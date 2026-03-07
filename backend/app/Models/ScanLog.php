<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScanLog extends Model
{
    protected $fillable = [
        'pass_id',
        'guard_user_id',
        'gate',
        'direction',
        'result',
        'scanned_at',
        'raw_code_hash',
        'note',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
    ];

    public function pass()
    {
        return $this->belongsTo(Pass::class);
    }

    public function guardUser()
    {
        return $this->belongsTo(User::class, 'guard_user_id');
    }
}