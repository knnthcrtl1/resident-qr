<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\IssueResidentTokenRequest;
use App\Models\Household;
use App\Models\ResidentProfile;
use App\Models\User;
use App\Services\JwtService;

class ResidentTokenController extends Controller
{
    public function issue(IssueResidentTokenRequest $request, JwtService $jwt)
    {
        $data = $request->validated();

        $user = User::findOrFail($data['user_id']);

        if ($user->role !== 'resident') {
            return $this->sendError('User is not a resident.', 403);
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
            'success' => true,
            'ok' => true,
            'message' => 'Resident token issued.',
            'qrToken' => $issued['token'],
            'expiresIn' => 60,
        ]);
    }
}