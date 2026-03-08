<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ResidentTokenController;
use App\Http\Controllers\Api\PassController;
use App\Http\Controllers\Api\ScanController;

Route::post('/auth/register', [AuthController::class, 'registerResident']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::post('/resident/token', [ResidentTokenController::class, 'issue']);
Route::post('/passes', [PassController::class, 'createPass']);
Route::post('/scans/validate', [ScanController::class, 'validateScan']);


Route::get('/ping', function () {
    return response()->json([
        'ok' => true,
        'message' => 'Backend reachable',
        'time' => now()->toDateTimeString(),
    ]);
});