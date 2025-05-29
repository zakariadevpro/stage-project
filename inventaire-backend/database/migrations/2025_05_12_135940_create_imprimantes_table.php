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
Schema::create('imprimantes', function (Blueprint $table) {
    $table->id();
    $table->string('emplacement')->nullable();
    $table->string('branche')->nullable();
    $table->string('adresseip')->nullable();
    $table->string('hostname')->nullable();
    $table->string('numero_serie')->nullable();
    $table->string('modele_peripherique')->nullable();
    $table->unsignedTinyInteger('etat_toner')->nullable(); // entre 0 et 100
    $table->unsignedTinyInteger('etat_drum')->nullable();  // entre 0 et 100
    $table->timestamps();
});
}
public function down()
{
    Schema::dropIfExists('imprimantes');
}
};
