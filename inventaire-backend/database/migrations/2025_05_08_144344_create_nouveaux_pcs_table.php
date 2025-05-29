<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('nouveaux_pcs', function (Blueprint $table) {
            $table->id();
            $table->string('marque');
            $table->string('modele');
            $table->integer('quantite');
            $table->date('date_arrivage')->nullable(); // si vide, on la remplira automatiquement
            $table->string('admin_nom'); // stocke le nom de l'admin connecté
            $table->timestamps(); // created_at = date enregistrement
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nouveaux_pcs');
    }
};
