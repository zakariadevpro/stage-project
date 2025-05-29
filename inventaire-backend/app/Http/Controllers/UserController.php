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
            'name' => 'nullable|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:Admin,Utilisateur',
            'branche' => 'nullable|string|max:255', // ou 'integer' si c’est un id
        ]);

        $user = User::create([
            'name' => $request->name,
            'prenom' => $request->prenom,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'branche' => $request->branche,
        ]);

        return response()->json($user, 201);
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'username' => 'sometimes|required|string|max:255|unique:users,username,' . $id,
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'role' => 'sometimes|required|string|in:Admin,Utilisateur',
            'branche' => 'sometimes|nullable|string|max:255',
            'password' => 'sometimes|nullable|string|min:6',
        ]);

        foreach ($validatedData as $key => $value) {
            if ($key === 'password') {
                $user->password = Hash::make($value);
            } else {
                $user->$key = $value;
            }
        }

        $user->save();

        return response()->json(['message' => 'Utilisateur mis à jour avec succès', 'user' => $user]);
    }

    /**
     * Supprimer un utilisateur
     */
    public function destroy(Request $request, $id)
    {
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
