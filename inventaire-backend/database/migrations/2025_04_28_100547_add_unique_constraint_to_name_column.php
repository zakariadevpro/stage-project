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
        Schema::table('branches', function (Blueprint $table) {
            // Ajouter une contrainte d'unicité à la colonne 'name'
            $table->unique('name');  // Contrainte d'unicité sur la colonne name
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('branches', function (Blueprint $table) {
            // Supprimer la contrainte d'unicité sur la colonne 'name'
            $table->dropUnique('branches_name_unique');  // Nom de la contrainte généré automatiquement
        });
    }
};
