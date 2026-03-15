<?php

namespace Tests\Feature;

use App\Models\Household;
use App\Models\ResidentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiContractTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $jwtSecret = 'testing-secret-key-with-minimum-32-bytes';
        putenv('JWT_SECRET=' . $jwtSecret);
        $_ENV['JWT_SECRET'] = $jwtSecret;
        $_SERVER['JWT_SECRET'] = $jwtSecret;
    }

    public function test_login_success_response_contract(): void
    {
        $user = User::factory()->create([
            'email' => 'resident@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'resident',
            'status' => 'active',
        ]);

        $household = Household::create([
            'house_no' => 'A-01',
            'street' => 'Main St',
            'status' => 'active',
        ]);

        ResidentProfile::create([
            'user_id' => $user->id,
            'household_id' => $household->id,
            'resident_type' => 'member',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'emailOrPhone' => 'resident@example.com',
            'password' => 'secret123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'ok',
                'message',
                'token',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'phone',
                    'role',
                    'householdId',
                ],
            ])
            ->assertJson([
                'success' => true,
                'ok' => true,
            ]);
    }

    public function test_login_invalid_credentials_response_contract(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'emailOrPhone' => 'missing@example.com',
            'password' => 'wrong-pass',
        ]);

        $response->assertStatus(401)
            ->assertJsonStructure([
                'success',
                'ok',
                'message',
                'errors',
            ])
            ->assertJson([
                'success' => false,
                'ok' => false,
            ]);
    }

    public function test_create_pass_idempotency_returns_same_payload_for_same_key(): void
    {
        $resident = User::factory()->create([
            'email' => 'creator@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'resident',
            'status' => 'active',
        ]);

        $household = Household::create([
            'house_no' => 'B-10',
            'street' => '2nd St',
            'status' => 'active',
        ]);

        ResidentProfile::create([
            'user_id' => $resident->id,
            'household_id' => $household->id,
            'resident_type' => 'owner',
        ]);

        $payload = [
            'pass_type' => 'visitor',
            'household_id' => $household->id,
            'issued_by_user_id' => $resident->id,
            'visitor_name' => 'Alex Visitor',
            'has_vehicle' => false,
            'plate_no' => null,
            'delivery_type' => null,
            'valid_from' => now()->toISOString(),
            'valid_until' => now()->addHours(2)->toISOString(),
        ];

        $idempotencyKey = 'test-idem-key-1';

        $first = $this->withHeaders([
            'X-Idempotency-Key' => $idempotencyKey,
        ])->postJson('/api/passes', $payload);

        $second = $this->withHeaders([
            'X-Idempotency-Key' => $idempotencyKey,
        ])->postJson('/api/passes', $payload);

        $first->assertStatus(201)
            ->assertJson([
                'success' => true,
                'ok' => true,
            ])
            ->assertJsonStructure([
                'success',
                'ok',
                'message',
                'pass',
                'qrToken',
                'guestUrl',
            ]);

        $second->assertOk()
            ->assertJson([
                'success' => true,
                'ok' => true,
            ]);

        $this->assertSame(
            $first->json('pass.id'),
            $second->json('pass.id'),
            'Expected cached idempotent response to keep same pass id.',
        );

        $this->assertSame(
            $first->json('qrToken'),
            $second->json('qrToken'),
            'Expected cached idempotent response to keep same token.',
        );
    }
}
