<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RegistrationController extends Controller
{
    /**
     * Register user to an event with atomic quota management and pessimistic locking.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $eventId = (int) $request->input('event_id');

        try {
            return DB::transaction(function () use ($eventId, $user, $request) {
                // 1. PESSIMISTIC LOCK: Lock the event row in PostgreSQL to prevent race conditions
                // under high concurrency (e.g. 1,000 concurrent registrations for limited seats)
                $event = Event::where('id', $eventId)
                    ->lockForUpdate()
                    ->firstOrFail();

                // 2. Check if user already registered for this event
                $existingReg = Registration::where('event_id', $eventId)
                    ->where('user_id', $user->id)
                    ->with('ticket')
                    ->first();

                if ($existingReg) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Anda sudah terdaftar dalam event ini.',
                        'data' => [
                            'registration' => $existingReg,
                            'ticket' => $existingReg->ticket,
                        ]
                    ], 409);
                }

                // 3. Strict Quota Check
                if ($event->registered_count >= $event->quota) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Mohon maaf, kuota tiket untuk event ini telah habis.',
                        'remaining_quota' => 0
                    ], 422);
                }

                // 4. Increment registered count atomically
                $event->increment('registered_count');

                // 5. Generate unique registration and ticket codes
                $regCode = 'REG-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(5));
                $ticketCode = 'TKT-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(6));

                // 6. Cryptographic HMAC signing to prevent ticket forgery
                $secretKey = config('app.key', 'surabayadev12secret');
                $payloadData = [
                    'ticket_code' => $ticketCode,
                    'event_id' => $event->id,
                    'event_title' => $event->title,
                    'user_id' => $user->id,
                    'attendee_name' => $user->name,
                    'issued_at' => now()->toIso8601String(),
                ];
                $hmac = hash_hmac('sha256', json_encode($payloadData), $secretKey);
                $qrPayload = json_encode(array_merge($payloadData, ['hmac' => $hmac]));

                $isPaid = (int) $event->price > 0;
                $paymentMethod = $request->input('payment_method', $isPaid ? 'qris' : 'free');

                // 7. Create registration record with payment details
                $registration = Registration::create([
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                    'registration_code' => $regCode,
                    'status' => 'confirmed',
                    'payment_status' => $isPaid ? 'paid' : 'free',
                    'payment_method' => $paymentMethod,
                    'amount_paid' => (int) $event->price,
                    'notes' => $request->input('notes'),
                    'registered_at' => now(),
                ]);

                // 8. Create digital ticket
                $ticket = Ticket::create([
                    'registration_id' => $registration->id,
                    'ticket_code' => $ticketCode,
                    'qr_payload' => $qrPayload,
                    'hmac_signature' => $hmac,
                    'status' => 'issued',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Pendaftaran berhasil! Tiket digital Anda telah diterbitkan.',
                    'data' => [
                        'registration' => $registration,
                        'ticket' => $ticket,
                        'event' => $event->fresh(),
                    ]
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kendala saat memproses pendaftaran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all tickets belonging to the currently authenticated user.
     */
    public function myTickets(Request $request): JsonResponse
    {
        $user = $request->user();

        $registrations = Registration::where('user_id', $user->id)
            ->with(['event', 'ticket', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $registrations
        ]);
    }

    /**
     * Get specific ticket pass detail by ticket code.
     */
    public function showTicket(string $ticketCode): JsonResponse
    {
        $ticket = Ticket::where('ticket_code', $ticketCode)
            ->with(['registration.user', 'registration.event', 'validator'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $ticket
        ]);
    }
}
