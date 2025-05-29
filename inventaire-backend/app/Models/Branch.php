<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Branch extends Model
{
    use HasFactory;

    // Ajoute la propriété $fillable et inclut les champs que tu veux autoriser pour l'assignation de masse
    protected $fillable = ['name','location','image_path'];  // Remplace ou ajoute d'autres champs si nécessaire
    // app/Models/Branche.php

    public function users()
    {
        return $this->hasMany(User::class, 'branche', 'name');
    }

}
