<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NouveauPc extends Model
{
    use HasFactory;

    protected $table = 'nouveaux_pcs';

    protected $fillable = [
        'marque',
        'modele',
        'quantite_arrivee',
        'date_arrivage',
        'admin_nom',
        'fournisseur', 
        'disponibilite'
    ];
}
