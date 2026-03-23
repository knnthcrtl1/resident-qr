<?php

namespace Tests\Unit;

use App\Http\Middleware\RetryTransientAdminGetDatabaseErrors;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use PDOException;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Response;

class RetryTransientAdminGetDatabaseErrorsTest extends TestCase
{
    public function test_it_retries_once_for_transient_admin_get_database_errors(): void
    {
        $middleware = new RetryTransientAdminGetDatabaseErrors();
        $request = Request::create('/admin/households/2/edit', 'GET');

        $attempts = 0;

        $response = $middleware->handle($request, function () use (&$attempts): Response {
            $attempts++;

            if ($attempts === 1) {
                throw new QueryException(
                    'pgsql',
                    'select * from "households" where "id" = ?',
                    [2],
                    new PDOException('SQLSTATE[HY000] [2002] connection refused')
                );
            }

            return new Response('ok', 200);
        });

        $this->assertSame(2, $attempts);
        $this->assertSame(200, $response->getStatusCode());
    }

    public function test_it_does_not_retry_for_non_get_requests(): void
    {
        $middleware = new RetryTransientAdminGetDatabaseErrors();
        $request = Request::create('/admin/households', 'POST');

        $attempts = 0;

        try {
            $middleware->handle($request, function () use (&$attempts): Response {
                $attempts++;

                throw new QueryException(
                    'pgsql',
                    'insert into "households" ("house_no") values (?)',
                    ['A-1'],
                    new PDOException('SQLSTATE[HY000] [2002] connection refused')
                );
            });

            $this->fail('Expected QueryException to be thrown.');
        } catch (QueryException) {
            $this->assertSame(1, $attempts);
        }
    }
}