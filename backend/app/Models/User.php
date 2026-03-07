<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function residentProfile()
    {
        return $this->hasOne(ResidentProfile::class);
    }

    public function guardProfile()
    {
        return $this->hasOne(GuardProfile::class);
    }

    public function issuedPasses()
    {
        return $this->hasMany(Pass::class, 'issued_by_user_id');
    }

    public function subjectPasses()
    {
        return $this->hasMany(Pass::class, 'subject_user_id');
    }

    public function scanLogs()
    {
        return $this->hasMany(ScanLog::class, 'guard_user_id');
    }
}