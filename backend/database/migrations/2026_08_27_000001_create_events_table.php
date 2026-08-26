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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique()->index();
            $table->text('description');
            $table->string('category')->index();
            $table->string('location');
            $table->dateTime('event_date')->index();
            $table->dateTime('end_date')->nullable();
            $table->integer('quota')->default(100);
            $table->integer('registered_count')->default(0);
            $table->string('banner_url')->nullable();
            $table->string('speaker_name')->nullable();
            $table->string('speaker_role')->nullable();
            $table->boolean('is_published')->default(true)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
