<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->boolean('is_admin')->default(false));
        Schema::create('products', function (Blueprint $t) {
            $t->id(); $t->string('name', 120); $t->text('description');
            $t->unsignedInteger('price_cents'); $t->softDeletes(); $t->timestamps();
        });
        Schema::create('orders', function (Blueprint $t) {
            $t->id(); $t->foreignId('user_id')->constrained(); $t->uuid('reference');
            $t->unique(['user_id','reference']); $t->string('status')->default('pending');
            $t->unsignedInteger('total_cents'); $t->timestamps();
        });
        Schema::create('order_items', function (Blueprint $t) {
            $t->id(); $t->foreignId('order_id')->constrained(); $t->foreignId('product_id')->constrained();
            $t->string('name'); $t->unsignedInteger('unit_cents'); $t->unsignedInteger('quantity');
        });
        Schema::create('payments', function (Blueprint $t) {
            $t->uuid('id')->primary(); $t->foreignId('order_id')->unique()->constrained();
            $t->string('stripe_id')->nullable()->unique(); $t->string('status')->default('pending'); $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['payments','order_items','orders','products'] as $table) Schema::dropIfExists($table);
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('is_admin'));
    }
};
