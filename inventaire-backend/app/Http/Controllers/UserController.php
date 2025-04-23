<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Récupérer tous les utilisateurs
     */
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    /**
     * Créer un nouvel utilisateur
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:Admin,Responsable,Utilisateur',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json($user, 201);
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update(Request $request, $id)
    {
        // Vérifier si l'utilisateur existe
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Valider les données
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'role' => 'sometimes|required|string|in:Admin,Responsable,Utilisateur',
            'password' => 'sometimes|nullable|string|min:6',
        ]);

        // Mettre à jour les champs
        if (isset($validatedData['name'])) {
            $user->name = $validatedData['name'];
        }
        
        if (isset($validatedData['email'])) {
            $user->email = $validatedData['email'];
        }
        
        if (isset($validatedData['role'])) {
            $user->role = $validatedData['role'];
        }
        
        // Mettre à jour le mot de passe seulement s'il est fourni
        if (isset($validatedData['password']) && $validatedData['password']) {
            $user->password = Hash::make($validatedData['password']);
        }

        $user->save();

        return response()->json(['message' => 'Utilisateur mis à jour avec succès', 'user' => $user]);
    }

    /**
     * Supprimer un utilisateur
     */
    public function destroy(Request $request, $id)
    {
        // Vérifier si l'utilisateur essaie de supprimer son propre compte
        if ($request->user()->id == $id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }
}
