<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterResidentRequest;
use App\Models\User;
use App\Models\Household;
use App\Models\ResidentProfile;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function registerResident(RegisterResidentRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'role' => 'resident',
            'status' => 'pending',
        ]);

        $household = Household::firstOrCreate([
            'house_no' => $data['house_no'],
            'street' => $data['street'] ?? null,
        ]);

        ResidentProfile::create([
            'user_id' => $user->id,
            'household_id' => $household->id,
            'resident_type' => $data['resident_type'] ?? 'member',
        ]);

        return $this->sendResponse(null, 'Registration submitted. Awaiting approval.');
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $user = User::where('email', $data['emailOrPhone'])
            ->orWhere('phone', $data['emailOrPhone'])
            ->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return $this->sendError('Invalid credentials.', 401);
        }

        if ($user->status !== 'active') {
            return $this->sendError('Account not active.', 403);
        }

        $token = $user->createToken('mobile-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'ok' => true,
            'message' => 'Login successful.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ]);
    }
}