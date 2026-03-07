<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Str;

class JwtService
{
    public function issue(array $claims, int $ttlSeconds): array
    {
        $now = time();

        $payload = array_merge([
            'iss' => env('JWT_ISSUER', 'subdivision-gate'),
            'aud' => env('JWT_AUDIENCE', 'guard-app'),
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + $ttlSeconds,
            'jti' => (string) Str::uuid(),
        ], $claims);

        $token = JWT::encode($payload, env('JWT_SECRET'), 'HS256');

        return [
            'token' => $token,
            'payload' => $payload,
        ];
    }

    public function verify(string $token): array
    {
        $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
        return (array) $decoded;
    }
}