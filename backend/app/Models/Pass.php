<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pass extends Model
{
    protected $fillable = [
        'pass_type',
        'household_id',
        'issued_by_user_id',
        'subject_user_id',
        'visitor_name',
        'has_vehicle',
        'plate_no',
        'delivery_type',
        'valid_from',
        'valid_until',
        'usage_limit',
        'usage_count',
        'status',
        'token_jti',
    ];

    protected $casts = [
        'has_vehicle' => 'boolean',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
    ];

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public function issuedByUser()
    {
        return $this->belongsTo(User::class, 'issued_by_user_id');
    }

    public function subjectUser()
    {
        return $this->belongsTo(User::class, 'subject_user_id');
    }
}