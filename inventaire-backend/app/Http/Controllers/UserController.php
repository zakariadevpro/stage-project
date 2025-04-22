<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // 🧾 Liste tous les utilisateurs
    public function index()
    {
        // ✅ Vérifie que l'utilisateur est admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        return User::all();
    }

    // ✏️ Modifier un utilisateur
    public function update(Request $request, $id)
    {
        // ✅ Vérifie que l'utilisateur est admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $user = User::findOrFail($id);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->role = $request->role;

        // ⚠️ Si tu veux aussi modifier le mot de passe :
        if ($request->has('password') && $request->password !== null) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json(['message' => 'Utilisateur mis à jour avec succès']);
    }

    // 🗑 Supprimer un utilisateur
    public function destroy($id)
    {
        // ✅ Vérifie que l'utilisateur est admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }
}
