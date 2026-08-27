<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get aggregate platform analytics for admin overview.
     */
    public function dashboardStats(): JsonResponse
    {
        $totalEvents = Event::count();
        $totalQuota = Event::sum('quota');
        $totalRegistrations = Registration::count();
        $totalCheckedIn = Ticket::where('status', 'checked_in')->count();
        $totalIssued = Ticket::where('status', 'issued')->count();
        $totalRevenue = (int) Registration::where('payment_status', 'paid')->sum('amount_paid');

        $checkInRate = $totalRegistrations > 0 
            ? round(($totalCheckedIn / $totalRegistrations) * 100, 1) 
            : 0;

        $eventsSummary = Event::withCount(['registrations'])
            ->withCount(['tickets as checked_in_count' => function ($q) {
                $q->where('tickets.status', 'checked_in');
            }])
            ->orderBy('event_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'metrics' => [
                    'total_events' => $totalEvents,
                    'total_quota' => $totalQuota,
                    'total_registrations' => $totalRegistrations,
                    'total_checked_in' => $totalCheckedIn,
                    'total_issued' => $totalIssued,
                    'check_in_rate' => $checkInRate,
                    'total_revenue' => $totalRevenue,
                ],
                'events_summary' => $eventsSummary,
            ]
        ]);
    }

    /**
     * Get list of attendees for a specific event with attendance status.
     */
    public function eventAttendees(Request $request, int $eventId): JsonResponse
    {
        $event = Event::findOrFail($eventId);

        $query = Registration::where('event_id', $eventId)
            ->with(['user', 'ticket.validator']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('organization', 'ilike', "%{$search}%");
            })->orWhere('registration_code', 'ilike', "%{$search}%");
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'checked_in' || $status === 'issued') {
                $query->whereHas('ticket', function ($q) use ($status) {
                    $q->where('status', $status);
                });
            }
        }

        $attendees = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'event' => $event,
                'attendees' => $attendees,
                'total' => $attendees->count(),
            ]
        ]);
    }
}
