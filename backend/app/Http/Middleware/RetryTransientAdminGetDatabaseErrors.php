<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class RetryTransientAdminGetDatabaseErrors
{
    private const MAX_ATTEMPTS = 2;

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->shouldRetry($request)) {
            return $next($request);
        }

        $attempt = 0;

        while (true) {
            $attempt++;

            try {
                return $next($request);
            } catch (Throwable $e) {
                if ($attempt >= self::MAX_ATTEMPTS || ! $this->isTransientDatabaseError($e)) {
                    throw $e;
                }

                Log::warning('Retrying transient admin database error.', [
                    'attempt' => $attempt,
                    'method' => $request->method(),
                    'path' => $request->path(),
                    'exception' => $e::class,
                    'message' => $e->getMessage(),
                ]);

                // Brief delay gives the database a moment to recover before retry.
                usleep(150000);
            }
        }
    }

    private function shouldRetry(Request $request): bool
    {
        if (! $request->isMethod('GET')) {
            return false;
        }

        return $request->is('admin/*');
    }

    private function isTransientDatabaseError(Throwable $e): bool
    {
        if (! ($e instanceof QueryException) && ! ($e instanceof \PDOException)) {
            return false;
        }

        $message = strtolower($e->getMessage());

        $needles = [
            'sqlstate[hy000] [2002]',
            'no connection could be made because the target machine actively refused it',
            'connection refused',
            'server has gone away',
            'lost connection',
            'connection reset',
            'timeout',
            'could not connect to server',
        ];

        foreach ($needles as $needle) {
            if (str_contains($message, $needle)) {
                return true;
            }
        }

        return false;
    }
}