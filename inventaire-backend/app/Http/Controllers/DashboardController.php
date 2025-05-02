<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Branch;
use App\Models\InventaireTotalPc;
use App\Models\PasswordRequest;

class DashboardController extends Controller
{
    public function stats()
    {
        $userCount = User::count();
        $messageCount = PasswordRequest::count();
        $branchCount = Branch::count();
        $inventoryCount = InventaireTotalPc::count(); // <-- attention ici on utilise ton modèle InventaireTotalPc

        return response()->json([
            'users' => $userCount,
            'messages' => $messageCount,
            'branches' => $branchCount,
            'inventory' => $inventoryCount,
        ]);
    }
}
