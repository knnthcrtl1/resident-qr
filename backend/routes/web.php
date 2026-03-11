<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/guest-pass', function () {
    $token = request()->query('token');

    if (!$token || !is_string($token)) {
        abort(400, 'Missing token');
    }

    return view('guest-pass', [
        'token' => $token,
    ]);
});
