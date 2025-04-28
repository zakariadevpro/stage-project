<?php
namespace App\Http\Controllers;
use App\Models\PasswordRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PasswordRequestController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'message' => 'required|string|min:10',
        ]);

        PasswordRequest::create($request->all());

        return response()->json(['message' => 'Votre demande a été envoyée à l\'administrateur.'], 200);
    }

    public function index() // Pour l'admin
    {
        return response()->json(PasswordRequest::latest()->get());
    }
    public function destroy($id)
    {
        try {
            // Trouver la demande avec l'ID donné
            $request = PasswordRequest::findOrFail($id);

            // Supprimer la demande
            $request->delete();

            // Retourner une réponse de succès
            return response()->json(['message' => 'Demande supprimée avec succès'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la suppression de la demande'], 500);
        }
    }
    public function deleteAll()
{
    try {
        \App\Models\PasswordRequest::truncate(); // Vide toute la table
        return response()->json(['message' => 'Toutes les demandes ont été supprimées.'], 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Erreur lors de la suppression.', 'error' => $e->getMessage()], 500);
    }
}

}

