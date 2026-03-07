<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResidentProfile extends Model
{
    protected $fillable = ['user_id', 'household_id', 'resident_type'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function household()
    {
        return $this->belongsTo(Household::class);
    }
}