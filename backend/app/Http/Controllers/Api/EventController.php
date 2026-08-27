<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventController extends Controller
{
    /**
     * Display a listing of published events with search and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::query();

        // If not admin, show only published
        if (!$request->user() || !$request->user()->isAdmin()) {
            $query->where('is_published', true);
        }

        // Search by keyword
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%")
                  ->orWhere('location', 'ilike', "%{$search}%")
                  ->orWhere('speaker_name', 'ilike', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->input('category'));
        }

        // Order by upcoming date
        $events = $query->orderBy('event_date', 'asc')->get();

        // If user authenticated, annotate whether already registered
        $registeredEventIds = [];
        if ($request->user()) {
            $registeredEventIds = Registration::where('user_id', $request->user()->id)
                ->pluck('event_id')
                ->toArray();
        }

        $events->transform(function ($event) use ($registeredEventIds) {
            $event->is_user_registered = in_array($event->id, $registeredEventIds);
            return $event;
        });

        // Get unique categories for filter tabs
        $categories = Event::distinct()->pluck('category')->filter()->values();

        return response()->json([
            'success' => true,
            'data' => [
                'events' => $events,
                'categories' => $categories,
                'total' => $events->count(),
            ]
        ]);
    }

    /**
     * Display the specified event.
     */
    public function show(Request $request, string $idOrSlug): JsonResponse
    {
        $event = Event::where('id', is_numeric($idOrSlug) ? $idOrSlug : 0)
            ->orWhere('slug', $idOrSlug)
            ->firstOrFail();

        $userRegistration = null;
        if ($request->user()) {
            $userRegistration = Registration::where('event_id', $event->id)
                ->where('user_id', $request->user()->id)
                ->with('ticket')
                ->first();
        }

        $event->is_user_registered = (bool) $userRegistration;
        $event->user_registration = $userRegistration;

        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    /**
     * Store a newly created event (Admin only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'location' => 'required|string|max:255',
            'event_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:event_date',
            'quota' => 'required|integer|min:1',
            'price' => 'nullable|integer|min:0',
            'banner_url' => 'nullable|url',
            'speaker_name' => 'nullable|string|max:255',
            'speaker_role' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        $slug = Str::slug($validated['title']) . '-' . Str::lower(Str::random(5));
        $validated['slug'] = $slug;
        $validated['price'] = (int) ($validated['price'] ?? 0);
        $validated['registered_count'] = 0;

        $event = Event::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil dibuat!',
            'data' => $event
        ], 201);
    }

    /**
     * Update the specified event (Admin only).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'category' => 'sometimes|required|string|max:100',
            'location' => 'sometimes|required|string|max:255',
            'event_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date',
            'quota' => 'sometimes|required|integer|min:' . $event->registered_count,
            'price' => 'nullable|integer|min:0',
            'banner_url' => 'nullable|url',
            'speaker_name' => 'nullable|string|max:255',
            'speaker_role' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $event->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::lower(Str::random(5));
        }

        $event->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data event berhasil diperbarui!',
            'data' => $event
        ]);
    }

    /**
     * Remove the specified event (Admin only).
     */
    public function destroy(int $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        
        $registrationsCount = $event->registrations()->count();
        if ($registrationsCount > 0) {
            // Optional: warn if deleting event with attendees
        }

        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event berhasil dihapus.'
        ]);
    }
}
