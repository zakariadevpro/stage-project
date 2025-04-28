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
            $table->binary('image')->nullable();  // Ajoute la colonne image
        });
    }
    
    public function down()
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn('image');  // Supprime la colonne image
        }); 
    }
};
