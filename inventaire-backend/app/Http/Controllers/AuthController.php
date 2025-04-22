<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Fonction pour l'authentification
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Vérification si l'utilisateur existe et si le mot de passe est correct
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
        }

        // Créer le token d'authentification avec Sanctum
        $token = $user->createToken('auth-token')->plainTextToken;

        // Retourner la réponse avec l'utilisateur et le token
        return response()->json([
            'user' => $user,
            'token' => $token,
            'role' => $user->role, // Ajout du rôle de l'utilisateur
            'redirect_url' => $this->getRedirectUrl($user) // URL de redirection en fonction du rôle
        ]);
    }

    // Fonction pour la déconnexion
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    // Fonction pour déterminer l'URL de redirection en fonction du rôle
    private function getRedirectUrl(User $user)
    {
        // Exemple de redirection en fonction du rôle
        if ($user->role === 'admin') {
            return url('/admin/dashboard'); // Rediriger vers le tableau de bord de l'admin
        }

        if ($user->role === 'responsable') {
            return url('/responsable/dashboard'); // Rediriger vers le tableau de bord du responsable
        }

        return url('/'); // Par défaut, rediriger vers la page d'accueil
    }
}
