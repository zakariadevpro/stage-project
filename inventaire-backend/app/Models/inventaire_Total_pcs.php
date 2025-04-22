<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventaireTotalPc extends Model
{
    use HasFactory;
    
    // Spécifier le nom de la table existante
    protected $table = 'inventaire_total_pcs';
    
    // Spécifier les colonnes qui peuvent être remplies
    protected $fillable = [
        'nom_poste',
        'num_serie',
        'user',
        'email',
        'service',
        'description',
        'date_aff',
        'etat',
        'remarque',
        'branches'
    ];
    
    // Convertir certaines colonnes en types spécifiques
    protected $casts = [
        'date_aff' => 'date',
    ];
}   