<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Imprimante extends Model
{
    use HasFactory;

    protected $fillable = [
        'emplacement',
        'branche',
        'adresseip',
        'hostname',
        'numero_serie',
        'modele_peripherique',
        'etat_toner',
        'etat_drum',
    ];
}
