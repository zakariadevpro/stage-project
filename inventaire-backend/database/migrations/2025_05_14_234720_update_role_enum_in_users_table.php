<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Modifier le type ENUM du champ 'role'
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'utilisateur') NOT NULL");
    }

    public function down(): void
    {
        // Revenir à l'ancienne version (par exemple 'admin', 'responsable', 'utilisateur')
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'responsable', 'utilisateur') NOT NULL");
    }
};
