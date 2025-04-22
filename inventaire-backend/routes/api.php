<?php
use App\Http\Controllers\PasswordRequestController;

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;   
use App\Http\Controllers\UserController;
Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/password-request', [PasswordRequestController::class, 'store']);
Route::get('/admin/password-requests', [PasswordRequestController::class, 'index']); // Pour dashboard admin


Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);         // Récupérer tous les users
    Route::put('/users/{id}', [UserController::class, 'update']);   // Modifier un user
    Route::delete('/users/{id}', [UserController::class, 'destroy']); // Supprimer un user
});