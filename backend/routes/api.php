<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckInController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\RegistrationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SurabayaDev 12th Anniversary - Evently REST API Routes
|--------------------------------------------------------------------------
*/

// --- Public Endpoints ---
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{idOrSlug}', [EventController::class, 'show']);
Route::get('/tickets/verify/{ticketCode}', [RegistrationController::class, 'showTicket']);

// --- Authenticated Endpoints (All Logged-in Users) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Participant Registration & Ticket Retrieval
    Route::post('/registrations', [RegistrationController::class, 'register']);
    Route::get('/my-tickets', [RegistrationController::class, 'myTickets']);
    Route::get('/my-tickets/{ticketCode}', [RegistrationController::class, 'showTicket']);

    // --- Committee & Admin Endpoints (Ticket Check-in Gate) ---
    Route::middleware('role:committee,admin')->group(function () {
        Route::post('/check-in', [CheckInController::class, 'checkIn']);
        Route::get('/check-in/logs', [CheckInController::class, 'recentLogs']);
        Route::get('/check-in/stats', [CheckInController::class, 'gateStats']);
        Route::get('/check-in/attendees', [CheckInController::class, 'searchAttendees']);
    });

    // --- Admin-Only Management Endpoints ---
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{id}', [EventController::class, 'update']);
        Route::delete('/events/{id}', [EventController::class, 'destroy']);
        Route::get('/dashboard', [AdminController::class, 'dashboardStats']);
        Route::get('/events/{eventId}/attendees', [AdminController::class, 'eventAttendees']);
    });
});
