<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Household extends Model
{
    protected $fillable = ['house_no', 'street', 'status'];

    public function residents()
    {
        return $this->hasMany(ResidentProfile::class);
    }

    public function passes()
    {
        return $this->hasMany(Pass::class);
    }
}