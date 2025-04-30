<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InventaireTotalPc;

class PcController extends Controller
{
    // Cette méthode récupère les PCs d'une branche donnée
    public function getPcsByBranche($brancheName)
    {
        $pcs = InventaireTotalPc::where('branches', $brancheName)->get();
    
        return response()->json([
            'pcs' => $pcs,
            'message' => $pcs->isEmpty() ? 'Aucun PC trouvé pour cette branche' : ''
        ]);
    }
}

