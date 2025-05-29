<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Branch;
use App\Models\InventaireTotalPc;
use App\Models\PasswordRequest;
use App\Models\Imprimante;
use App\Models\NouveauPC; // Ajoutez cette ligne si vous avez un modèle pour les nouveaux PC

class DashboardController extends Controller
{
    public function stats()
    {
        $userCount = User::count();
        $messageCount = PasswordRequest::count();
        $branchCount = Branch::count();
        $inventoryCount = InventaireTotalPc::count();
        $printerCount = Imprimante::count(); // Ajout du comptage des imprimantes
        $newPcCount = NouveauPC::count(); // Ajout du comptage des nouveaux PC si vous avez ce modèle

        return response()->json([
            'users' => $userCount,
            'messages' => $messageCount,
            'branches' => $branchCount,
            'inventory' => $inventoryCount,
            'printers' => $printerCount, // Ajout des imprimantes à la réponse JSON
            'newPcs' => $newPcCount, // Ajout des nouveaux PC à la réponse JSON
        ]);
    }
}
