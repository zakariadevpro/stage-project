<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsommableImprimante extends Model
{
    use HasFactory;

    protected $fillable = [
        'marque',
        'reference',
        'quantite_toner_noir',
        'quantite_toner_cyan',
        'quantite_toner_magenta',
        'quantite_toner_jaune',
        'quantite_toner_noir_couleur',
        'quantite_drum',
        'branche',
        'description',
        'etat'
    ];
}

