<?php

use App\Http\Controllers\PasswordRequestController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\PcController;

Route::middleware('auth:sanctum')->get('/pcs-by-branche/{name}', [PcController::class, 'getPcsByBranche']);

Route::middleware('auth:sanctum')->post('/branches', [BranchController::class, 'store']);
Route::delete('/branches/{id}', [BranchController::class, 'destroy']);
Route::post('/branches/{id}/update', [BranchController::class, 'update']);

Route::middleware('auth:sanctum')->get('/branches', [BranchController::class, 'index']);
// routes/api.php





Route::middleware('auth:sanctum')->group(function () {
    Route::delete('/admin/password-requests/delete-all', [PasswordRequestController::class, 'deleteAll']);
});


Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/password-request', [PasswordRequestController::class, 'store']);
Route::get('/admin/password-requests', [PasswordRequestController::class, 'index']);
Route::delete('/admin/password-requests/{id}', [PasswordRequestController::class, 'destroy']);
// Pour dashboard admin
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    }); // Ajouter cette route pour récupérer l'utilisateur connecté
    Route::get('/users', [UserController::class, 'index']);         // Récupérer tous les users
    Route::post('/users', [UserController::class, 'store']);        // Créer un user
    Route::put('/users/{id}', [UserController::class, 'update']);   // Modifier un user
    Route::delete('/users/{id}', [UserController::class, 'destroy']); // Supprimer un user
});
