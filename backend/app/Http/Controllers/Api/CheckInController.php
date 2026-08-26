<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckInLog;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckInController extends Controller
{
    /**
     * Validate and process event ticket check-in at gate.
     * Prevents duplicate check-in via atomic status transition and pessimistic locking.
     */
    public function checkIn(Request $request): JsonResponse
    {
        $request->validate([
            'ticket_code' => 'nullable|string',
            'qr_payload' => 'nullable|string',
        ]);

        $ticketCode = $request->input('ticket_code');
        $rawQr = $request->input('qr_payload');

        // Extract ticket_code from QR payload if scanned directly from camera
        if (empty($ticketCode) && !empty($rawQr)) {
            $decoded = json_decode($rawQr, true);
            if ($decoded && isset($decoded['ticket_code'])) {
                $ticketCode = $decoded['ticket_code'];

                // Optional HMAC cryptographic verification
                if (isset($decoded['hmac'])) {
                    $hmacReceived = $decoded['hmac'];
                    unset($decoded['hmac']);
                    $secretKey = config('app.key', 'surabayadev12secret');
                    $expectedHmac = hash_hmac('sha256', json_encode($decoded), $secretKey);
                    
                    if (!hash_equals($expectedHmac, $hmacReceived)) {
                        return response()->json([
                            'success' => false,
                            'scan_result' => 'invalid_ticket',
                            'message' => 'Validasi Kriptografis Gagal: Format QR Code mencurigakan atau tidak diterbitkan oleh sistem resmi.',
                        ], 400);
                    }
                }
            } else {
                $ticketCode = trim($rawQr);
            }
        }

        if (empty($ticketCode)) {
            return response()->json([
                'success' => false,
                'scan_result' => 'invalid_ticket',
                'message' => 'Kode tiket tidak boleh kosong.'
            ], 422);
        }

        $user = $request->user();

        return DB::transaction(function () use ($ticketCode, $user, $request) {
            // Pessimistic lock on ticket row
            $ticket = Ticket::where('ticket_code', $ticketCode)
                ->lockForUpdate()
                ->with(['registration.user', 'registration.event', 'validator'])
                ->first();

            // 1. TICKET NOT FOUND
            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'scan_result' => 'invalid_ticket',
                    'message' => 'Tiket dengan kode "' . $ticketCode . '" tidak ditemukan dalam database.',
                ], 404);
            }

            // 2. PREVENT DUPLICATE CHECK-IN
            if ($ticket->status === 'checked_in') {
                CheckInLog::create([
                    'ticket_id' => $ticket->id,
                    'scanned_by' => $user ? $user->id : null,
                    'scan_result' => 'duplicate_rejected',
                    'ip_address' => $request->ip(),
                    'device_info' => $request->header('User-Agent', 'Gate Terminal'),
                    'notes' => 'Peringatan: Tiket dipindai kembali setelah sebelumnya di-check in.',
                    'created_at' => now(),
                ]);

                return response()->json([
                    'success' => false,
                    'scan_result' => 'duplicate_rejected',
                    'message' => 'PERINGATAN: Tiket ini SUDAH PERNAH di-check in!',
                    'data' => [
                        'ticket_code' => $ticket->ticket_code,
                        'attendee_name' => $ticket->registration->user->name,
                        'attendee_email' => $ticket->registration->user->email,
                        'event_title' => $ticket->registration->event->title,
                        'checked_in_at' => $ticket->checked_in_at ? $ticket->checked_in_at->format('d M Y, H:i:s') : 'N/A',
                        'checked_in_by' => $ticket->validator ? $ticket->validator->name : 'Petugas Gate',
                    ]
                ], 409);
            }

            // 3. TICKET VOIDED
            if ($ticket->status === 'voided') {
                return response()->json([
                    'success' => false,
                    'scan_result' => 'invalid_ticket',
                    'message' => 'Tiket ini telah dibatalkan (VOID) oleh sistem.',
                ], 400);
            }

            // 4. ATOMIC CHECK-IN SUCCESS
            $ticket->update([
                'status' => 'checked_in',
                'checked_in_at' => now(),
                'checked_in_by' => $user ? $user->id : null,
            ]);

            CheckInLog::create([
                'ticket_id' => $ticket->id,
                'scanned_by' => $user ? $user->id : null,
                'scan_result' => 'success',
                'ip_address' => $request->ip(),
                'device_info' => $request->header('User-Agent', 'Gate Terminal'),
                'notes' => 'Validasi berhasil di pintu masuk.',
                'created_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'scan_result' => 'success',
                'message' => 'CHECK-IN BERHASIL! Selamat datang di SurabayaDev 12th Anniversary.',
                'data' => [
                    'ticket_code' => $ticket->ticket_code,
                    'attendee_name' => $ticket->registration->user->name,
                    'attendee_email' => $ticket->registration->user->email,
                    'organization' => $ticket->registration->user->organization ?? 'Umum',
                    'event_title' => $ticket->registration->event->title,
                    'checked_in_at' => $ticket->checked_in_at->format('d M Y, H:i:s'),
                ]
            ]);
        });
    }

    /**
     * Get recent check-in logs for gate committee monitoring feed.
     */
    public function recentLogs(): JsonResponse
    {
        $logs = CheckInLog::with(['ticket.registration.user', 'ticket.registration.event', 'scanner'])
            ->orderBy('created_at', 'desc')
            ->limit(25)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
}
