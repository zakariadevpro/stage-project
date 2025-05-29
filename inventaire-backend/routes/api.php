<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\NouveauPcController;
use App\Http\Controllers\ImprimanteController;
use App\Http\Controllers\PcController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PasswordRequestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
// routes/api.php

Route::middleware('auth:sanctum')->get('/printers-by-branche/{branche}', [ImprimanteController::class, 'getByBranche']);

use App\Http\Controllers\ConsommableImprimanteController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/consommables', [ConsommableImprimanteController::class, 'index']); // liste, recherche, filtre
    Route::post('/consommables', [ConsommableImprimanteController::class, 'store']); // ajout
    Route::get('/consommables/{id}', [ConsommableImprimanteController::class, 'show']); // lecture 1
    Route::put('/consommables/{id}', [ConsommableImprimanteController::class, 'update']); // mise à jour
    Route::delete('/consommables/{id}', [ConsommableImprimanteController::class, 'destroy']); // suppression
});


// Routes publiques (pas besoin d'authentification)
Route::post('login', [AuthController::class, 'login']);
Route::post('/password-request', [PasswordRequestController::class, 'store']);

// Liste des branches publique (si tu veux la protéger, mets-la dans le middleware sanctum)
Route::get('/branches', [BranchController::class, 'index']);

// Routes protégées par authentification Sanctum
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('logout', [AuthController::class, 'logout']);

    // Utilisateur connecté
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Gestion des branches
    Route::post('/branches', [BranchController::class, 'store']);
    Route::post('/branches/{id}/update', [BranchController::class, 'update']);
    Route::delete('/branches/{id}', [BranchController::class, 'destroy']);

    // Gestion des utilisateurs
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Gestion des PC
    Route::get('/pcs-by-branche/{name}', [PcController::class, 'getPcsByBranche']);
    Route::post('/pcs', [PcController::class, 'store']);
    Route::put('/pcs/{id}', [PcController::class, 'update']);
    Route::delete('/pcs/{id}', [PcController::class, 'destroy']);

    // Gestion des nouveaux PC


    // Gestion imprimantes


    // Dashboard admin
    Route::get('/admin/stats', [DashboardController::class, 'stats']);

    // Gestion des demandes de changement de mot de passe
    Route::get('/admin/password-requests', [PasswordRequestController::class, 'index']);
    Route::delete('/admin/password-requests/{id}', [PasswordRequestController::class, 'destroy']);
    Route::delete('/admin/password-requests/delete-all', [PasswordRequestController::class, 'deleteAll']);
});
  Route::get('/nouveaux-pcs', [NouveauPcController::class, 'index']);
    Route::post('/nouveaux-pcs', [NouveauPcController::class, 'store']);
    Route::put('/nouveaux-pcs/{id}', [NouveauPcController::class, 'update']);
    Route::delete('/nouveaux-pcs/{id}', [NouveauPcController::class, 'destroy']);
        Route::get('/printers-by-branche/{branche}', [ImprimanteController::class, 'getByBranche']);
    Route::post('/printers', [ImprimanteController::class, 'store']);
    Route::put('/printers/{id}', [ImprimanteController::class, 'update']);
    Route::delete('/printers/{id}', [ImprimanteController::class, 'destroy']);
    Route::post('/printers/import', [ImprimanteController::class, 'import']);
