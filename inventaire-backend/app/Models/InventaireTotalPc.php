<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventaireTotalPc extends Model
{
    use HasFactory;

    protected $table = 'inventaire_total_pcs'; // le nom exact de ta table

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
        'branches', // ATTENTION: c'est 'branches' avec un S
    ];

    public $timestamps = false; // car tu n'as pas created_at ni updated_at dans ta table
}
