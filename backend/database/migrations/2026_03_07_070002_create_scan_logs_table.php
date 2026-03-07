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
        Schema::create('scan_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pass_id')->nullable()->constrained('passes')->nullOnDelete();
            $table->foreignId('guard_user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('gate', ['gate1', 'gate2']);
            $table->enum('direction', ['IN', 'OUT']);
            $table->enum('result', ['VALID', 'INVALID', 'EXPIRED', 'REVOKED', 'USED', 'DENIED_RULE']);
            $table->dateTime('scanned_at');
            $table->string('raw_code_hash')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scan_logs');
    }
};
