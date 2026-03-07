<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuardProfile extends Model
{
    protected $fillable = ['user_id', 'default_gate'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}