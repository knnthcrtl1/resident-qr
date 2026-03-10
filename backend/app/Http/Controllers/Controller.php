<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function sendResponse(mixed $data = null, string $message = 'OK', int $status = 200)
    {
        return response()->json([
            'success' => true,
            'ok' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    protected function sendError(string $message = 'Request failed.', int $status = 422, array $errors = [])
    {
        return response()->json([
            'success' => false,
            'ok' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}
