<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Generate Midtrans Snap Token for Event Registration.
     */
    public function createSnapToken(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
        ]);

        $user = $request->user();
        $event = Event::findOrFail($request->event_id);

        if ($event->price <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Event ini gratis, tidak memerlukan pembayaran Midtrans.'
            ], 400);
        }

        // Check if already registered
        $existing = Registration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah terdaftar dalam event ini.',
            ], 409);
        }

        // Verify remaining quota
        if ($event->remaining_quota <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Mohon maaf, kuota tiket untuk event ini sudah habis.'
            ], 422);
        }

        $serverKey = config('services.midtrans.server_key');
        $isProduction = config('services.midtrans.is_production', false);
        $snapUrl = $isProduction 
            ? 'https://app.midtrans.com/snap/v1/transactions' 
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $orderId = 'EVT' . $event->id . '-U' . $user->id . '-' . time();

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $event->price,
            ],
            'item_details' => [
                [
                    'id' => 'EVENT-' . $event->id,
                    'price' => (int) $event->price,
                    'quantity' => 1,
                    'name' => Str::limit($event->title, 45, ''),
                    'category' => $event->category,
                ]
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '081234567890',
            ],
            'callbacks' => [
                'finish' => url('/#my-tickets'),
            ],
        ];

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->post($snapUrl, $params);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'success' => true,
                    'data' => [
                        'snap_token' => $data['token'],
                        'redirect_url' => $data['redirect_url'] ?? null,
                        'order_id' => $orderId,
                        'client_key' => config('services.midtrans.client_key'),
                        'gross_amount' => (int) $event->price,
                    ]
                ]);
            }

            Log::error('Midtrans Snap API Error: ' . $response->body());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghubungkan ke Midtrans: ' . ($response->json('error_messages')[0] ?? 'Layanan tidak merespons'),
            ], 500);

        } catch (\Exception $e) {
            Log::error('Midtrans Exception: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm paid registration upon Midtrans success.
     */
    public function finishPayment(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'order_id' => 'required|string',
            'payment_type' => 'nullable|string',
            'transaction_status' => 'nullable|string',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $eventId = $request->event_id;

        try {
            $result = DB::transaction(function () use ($eventId, $user, $request) {
                // Lock row to prevent race condition
                $event = Event::where('id', $eventId)->lockForUpdate()->first();

                // Double check if already registered
                $existing = Registration::where('event_id', $eventId)
                    ->where('user_id', $user->id)
                    ->first();

                if ($existing) {
                    return [
                        'registration' => $existing->load('ticket'),
                        'is_new' => false,
                    ];
                }

                // Check quota
                if ($event->registered_count >= $event->quota) {
                    abort(422, 'Mohon maaf, kuota peserta untuk event ini sudah penuh.');
                }

                // Increment quota
                $event->increment('registered_count');

                // Generate codes
                $regCode = 'REG-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(5));
                $ticketCode = 'TKT-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(6));

                // Generate HMAC signature
                $secretKey = config('app.key', 'surabayadev12secret');
                $payloadData = [
                    'ticket_code' => $ticketCode,
                    'event_id' => $event->id,
                    'event_title' => $event->title,
                    'user_id' => $user->id,
                    'attendee_name' => $user->name,
                    'issued_at' => now()->toISOString(),
                ];
                $signature = hash_hmac('sha256', json_encode($payloadData), $secretKey);

                $paymentMethod = $request->payment_type ? 'midtrans_' . $request->payment_type : 'midtrans_qris';

                // Create registration record
                $registration = Registration::create([
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                    'registration_code' => $regCode,
                    'status' => 'confirmed',
                    'notes' => $request->notes,
                    'registered_at' => now(),
                    'payment_status' => 'paid',
                    'payment_method' => $paymentMethod,
                    'amount_paid' => $event->price,
                ]);

                // Create ticket record
                $ticket = Ticket::create([
                    'registration_id' => $registration->id,
                    'ticket_code' => $ticketCode,
                    'qr_payload' => json_encode(array_merge($payloadData, ['hmac' => $signature])),
                    'hmac_signature' => $signature,
                    'status' => 'issued',
                ]);

                $registration->setRelation('ticket', $ticket);
                $registration->setRelation('event', $event);

                return [
                    'registration' => $registration,
                    'is_new' => true,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran Midtrans berhasil dan tiket VIP Anda resmi diterbitkan!',
                'data' => [
                    'registration' => $result['registration'],
                    'ticket' => $result['registration']->ticket,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Terjadi kesalahan saat memproses tiket.'
            ], 500);
        }
    }

    /**
     * Webhook Notification from Midtrans.
     */
    public function handleNotification(Request $request)
    {
        $serverKey = config('services.midtrans.server_key');
        $orderId = $request->order_id;
        $statusCode = $request->status_code;
        $grossAmount = $request->gross_amount;
        $signatureKey = $request->signature_key;

        // Verify Midtrans SHA512 signature
        $computedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($computedSignature !== $signatureKey) {
            Log::warning('Midtrans Webhook: Invalid Signature');
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $transactionStatus = $request->transaction_status;
        $fraudStatus = $request->fraud_status;

        Log::info("Midtrans Webhook Received: {$orderId} status: {$transactionStatus}");

        return response()->json(['status' => 'success']);
    }
}
