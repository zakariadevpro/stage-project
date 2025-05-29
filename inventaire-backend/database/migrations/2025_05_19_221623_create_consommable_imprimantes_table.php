<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateConsommableImprimantesTable extends Migration
{
    public function up()
    {
        Schema::create('consommable_imprimantes', function (Blueprint $table) {
            $table->id();
            $table->string('marque');
            $table->string('reference');

            // Toner noir
            $table->integer('quantite_toner_noir')->default(0);

            // Toner multicolor (CMYK)
            $table->integer('quantite_toner_cyan')->default(0);
            $table->integer('quantite_toner_magenta')->default(0);
            $table->integer('quantite_toner_jaune')->default(0);
            $table->integer('quantite_toner_noir_couleur')->default(0);

            // Drum
            $table->integer('quantite_drum')->default(0);

            $table->string('branche');
            $table->text('description')->nullable();

            $table->enum('etat', ['disponible', 'endemande'])->default('disponible');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('consommable_imprimantes');
    }
}
