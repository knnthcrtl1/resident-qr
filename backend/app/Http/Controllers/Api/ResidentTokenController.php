<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Household;
use App\Models\ResidentProfile;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\Request;

class ResidentTokenController extends Controller
{
    public function issue(Request $request, JwtService $jwt)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($data['user_id']);

        if ($user->role !== 'resident') {
            return response()->json([
                'ok' => false,
                'message' => 'User is not a resident.',
            ], 403);
        }

        $profile = $user->residentProfile;

        if (!$profile) {
            // Create a default household and profile for the user
            $household = Household::firstOrCreate([
                'house_no' => 'unknown',
                'street' => null,
            ]);

            $profile = ResidentProfile::create([
                'user_id' => $user->id,
                'household_id' => $household->id,
                'resident_type' => 'member',
            ]);
        }

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