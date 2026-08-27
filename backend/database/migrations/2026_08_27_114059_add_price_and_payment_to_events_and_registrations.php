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
        Schema::table('events', function (Blueprint $table) {
            $table->unsignedInteger('price')->default(0)->after('quota');
        });

        Schema::table('registrations', function (Blueprint $table) {
            $table->string('payment_status')->default('free')->after('status'); // free, paid, pending
            $table->string('payment_method')->nullable()->after('payment_status'); // qris, bank_transfer, free
            $table->unsignedInteger('amount_paid')->default(0)->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('price');
        });

        Schema::table('registrations', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'payment_method', 'amount_paid']);
        });
    }
};
