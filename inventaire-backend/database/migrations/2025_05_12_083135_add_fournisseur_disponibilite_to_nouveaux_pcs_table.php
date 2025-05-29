<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::table('nouveaux_pcs', function (Blueprint $table) {
        $table->string('fournisseur')->nullable();
        $table->enum('disponibilite', ['disponible', 'pas encore disponible'])->default('pas encore disponible');
    });
}

public function down()
{
    Schema::table('nouveaux_pcs', function (Blueprint $table) {
        $table->dropColumn(['fournisseur', 'disponibilite']);
    });
}


};
