<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Log as LogFacade;
use App\Models\InventaireTotalPc;
use App\Models\ConsommableImprimante;
use App\Models\Imprimante;
use Illuminate\Routing\Controller;
use Exception;

class DashboardUserControlle extends Controller
{
    public function getStats()
    {
        try {
            // Vérifier que l'utilisateur est authentifié
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Utilisateur non authentifié'], 401);
            }

            // Vérifier que l'utilisateur a une branche
            $branch = $user->branche;
            
            if (!$branch) {
                return response()->json([
                    'inventory' => 0,
                    'printers' => 0,
                    'consommables' => 0,
                    'message' => 'Aucune branche assignée à l\'utilisateur'
                ]);
            }

            // Comptage par branche utilisateur avec gestion d'erreurs
            $inventoryCount = 0;
            $printerCount = 0;
            $consommableCount = 0;

            try {
                $inventoryCount = InventaireTotalPc::where('branches', $branch)->count();
            } catch (Exception $e) {
                Log::error('Erreur comptage inventory: ' . $e->getMessage());
            }

            try {
                $printerCount = Imprimante::where('branche', $branch)->count();
            } catch (Exception $e) {
                Log::error('Erreur comptage printers: ' . $e->getMessage());
            }

            try {
                $consommableCount = ConsommableImprimante::where('branche', $branch)
                                       ->where('etat', 'disponible')
                                       ->count();
            } catch (Exception $e) {
                Log::error('Erreur comptage consommables: ' . $e->getMessage());
            }

            return response()->json([
                'inventory' => $inventoryCount,
                'printers' => $printerCount,
                'consommables' => $consommableCount,
                'user_branch' => $branch // Pour debug
            ]);

        } catch (Exception $e) {
            Log::error('Erreur dans getStats: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Erreur serveur',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}