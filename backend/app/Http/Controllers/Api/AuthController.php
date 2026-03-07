<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Household;
use App\Models\ResidentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function registerResident(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'nullable|string|unique:users,phone',
            'password' => 'required|string|min:6',
            'house_no' => 'required|string|max:100',
            'street' => 'nullable|string|max:255',
            'resident_type' => 'nullable|in:owner,tenant,member',
        ]);

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

        return response()->json([
            'ok' => true,
            'message' => 'Registration submitted. Awaiting approval.',
        ]);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'emailOrPhone' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['emailOrPhone'])
            ->orWhere('phone', $data['emailOrPhone'])
            ->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'ok' => false,
                'message' => 'Invalid credentials.',
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'ok' => false,
                'message' => 'Account not active.',
            ], 403);
        }

        $token = $user->createToken('mobile-token')->plainTextToken;

        return response()->json([
            'ok' => true,
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