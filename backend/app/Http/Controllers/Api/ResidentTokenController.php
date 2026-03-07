<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResidentProfile;
use App\Services\JwtService;
use Illuminate\Http\Request;

class ResidentTokenController extends Controller
{
    public function issue(Request $request, JwtService $jwt)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $profile = ResidentProfile::where('user_id', $data['user_id'])->firstOrFail();

        $issued = $jwt->issue([
            'type' => 'resident',
            'userId' => (int) $data['user_id'],
            'householdId' => (int) $profile->household_id,
        ], 60);

        return response()->json([
            'ok' => true,
            'qrToken' => $issued['token'],
            'expiresIn' => 60,
        ]);
    }
}