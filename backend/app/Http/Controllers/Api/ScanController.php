<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ValidateScanRequest;
use App\Models\Pass;
use App\Models\ScanLog;
use App\Services\JwtService;
use Illuminate\Support\Facades\DB;

class ScanController extends Controller
{
    public function validateScan(ValidateScanRequest $request, JwtService $jwt)
    {
        $data = $request->validated();

        $rawHash = hash('sha256', $data['token']);

        try {
            $payload = $jwt->verify($data['token']);
        } catch (\Throwable $e) {
            $this->logScan(null, $data, $rawHash, 'INVALID');
            return response()->json([
                'success' => false,
                'ok' => false,
                'result' => 'INVALID',
                'message' => 'Invalid QR.',
            ], 422);
        }

        $type = $payload['type'] ?? null;

        if ($type === 'resident') {
            $this->logScan(null, $data, $rawHash, 'VALID');

            return response()->json([
                'success' => true,
                'ok' => true,
                'result' => 'VALID',
                'message' => 'Resident access validated.',
                'display' => [
                    'type' => 'resident',
                    'householdId' => $payload['householdId'] ?? null,
                    'directionAllowed' => ['IN', 'OUT'],
                ],
            ]);
        }

        if (!in_array($type, ['visitor', 'delivery'])) {
            $this->logScan(null, $data, $rawHash, 'INVALID');
            return response()->json([
                'success' => false,
                'ok' => false,
                'result' => 'INVALID',
                'message' => 'Unknown token type.',
            ], 422);
        }

        if ($data['direction'] === 'OUT') {
            $this->logScan(null, $data, $rawHash, 'DENIED_RULE');
            return response()->json([
                'success' => false,
                'ok' => false,
                'result' => 'DENIED_RULE',
                'message' => 'OUT is not allowed for visitor/delivery passes.',
            ], 422);
        }

        $pass = Pass::where('id', $payload['passId'] ?? null)
            ->where('token_jti', $payload['jti'] ?? null)
            ->first();

        if (!$pass) {
            $this->logScan(null, $data, $rawHash, 'INVALID');
            return response()->json([
                'success' => false,
                'ok' => false,
                'result' => 'INVALID',
                'message' => 'Pass not found.',
            ], 404);
        }

        if ($pass->status === 'revoked') {
            $this->logScan($pass->id, $data, $rawHash, 'REVOKED');
            return response()->json([
                'success' => false,
                'ok' => false,
                'result' => 'REVOKED',
                'message' => 'Pass revoked.',
            ], 409);
        }

        if (now()->lt($pass->valid_from) || now()->gt($pass->valid_until)) {
            $this->logScan($pass->id, $data, $rawHash, 'EXPIRED');
            return response()->json([
                'success' => false,
                'ok' => false,
                'result' => 'EXPIRED',
                'message' => 'Pass expired.',
            ], 422);
        }

        $status = DB::transaction(function () use ($pass, $data, $rawHash) {
            $lockedPass = Pass::whereKey($pass->id)->lockForUpdate()->first();
            if (!$lockedPass) {
                return 'INVALID';
            }

            if ($lockedPass->usage_count >= $lockedPass->usage_limit) {
                $this->logScan($lockedPass->id, $data, $rawHash, 'USED');
                return 'USED';
            }

            $lockedPass->increment('usage_count');
            $this->logScan($lockedPass->id, $data, $rawHash, 'VALID');
            return 'VALID';
        });

        if ($status !== 'VALID') {
            return response()->json([
                'success' => false,
                'ok' => false,
                'result' => 'USED',
                'message' => 'Pass already used.',
            ], 409);
        }

        return response()->json([
            'success' => true,
            'ok' => true,
            'result' => 'VALID',
            'message' => 'Pass validated.',
            'display' => [
                'type' => $pass->pass_type,
                'householdId' => $pass->household_id,
                'visitorName' => $pass->visitor_name,
                'plateNo' => $pass->plate_no,
                'deliveryType' => $pass->delivery_type,
                'directionAllowed' => ['IN'],
            ],
        ]);
    }

    private function logScan(?int $passId, array $data, string $rawHash, string $result): void
    {
        ScanLog::create([
            'pass_id' => $passId,
            'guard_user_id' => $data['guard_user_id'],
            'gate' => $data['gate'],
            'direction' => $data['direction'],
            'result' => $result,
            'scanned_at' => now(),
            'raw_code_hash' => $rawHash,
            'note' => $data['note'] ?? null,
        ]);
    }
}