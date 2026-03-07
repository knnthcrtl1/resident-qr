<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('passes', function (Blueprint $table) {
            $table->id();
            $table->enum('pass_type', ['resident', 'visitor', 'delivery']);
            $table->foreignId('household_id')->constrained()->cascadeOnDelete();
            $table->foreignId('issued_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('visitor_name')->nullable();
            $table->boolean('has_vehicle')->default(false);
            $table->string('plate_no')->nullable();
            $table->string('delivery_type')->nullable();

            $table->dateTime('valid_from');
            $table->dateTime('valid_until');

            $table->unsignedInteger('usage_limit')->default(1);
            $table->unsignedInteger('usage_count')->default(0);

            $table->enum('status', ['active', 'revoked', 'expired'])->default('active');
            $table->uuid('token_jti')->unique();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('passes');
    }
};
