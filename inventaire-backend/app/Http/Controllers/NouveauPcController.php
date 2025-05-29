<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NouveauPc;
use Carbon\Carbon;

class NouveauPcController extends Controller
{
  public function store(Request $request)
{
    $validated = $request->validate([
        'marque' => 'required|string|max:255',
        'modele' => 'required|string|max:255',
        'quantite_arrivee' => 'required|integer|min:1',
        'date_arrivage' => 'nullable|date',
        'admin_nom' => 'required|string|max:255',
        'fournisseur' => 'nullable|string|max:255',
        'disponibilite' => 'required|in:disponible,pas encore disponible',
    ]);

    $dateArrivage = $validated['date_arrivage'] ?? Carbon::now()->toDateString();

    $nouveauPc = NouveauPc::create([
        'marque' => $validated['marque'],
        'modele' => $validated['modele'],
        'quantite_arrivee' => $validated['quantite_arrivee'],
        'date_arrivage' => $dateArrivage,
        'admin_nom' => $validated['admin_nom'],
        'fournisseur' => $validated['fournisseur'] ?? null,
        'disponibilite' => $validated['disponibilite'],
    ]);

    return response()->json([
        'message' => 'Nouveau PC ajouté avec succès.',
        'data' => $nouveauPc
    ], 201);
}

    // Affiche tous les nouveaux PCs
public function index()
{
    return response()->json(NouveauPc::all());
}

// Supprime un PC par ID
public function destroy($id)
{
    $pc = NouveauPc::find($id);
    if (!$pc) {
        return response()->json(['message' => 'Nouveau PCs non trouvé.'], 404);
    }
    $pc->delete();
    return response()->json(['message' => 'Nouveau PCs supprimé avec succès.']);
}
// Dans PcController.php
public function update(Request $request, $id)
{
    $pc = NouveauPc::findOrFail($id);

    $validated = $request->validate([
        'marque' => 'required|string|max:255',
        'modele' => 'required|string|max:255',
        'quantite_arrivee' => 'required|integer',
        'date_arrivage' => 'nullable|date',
        'admin_nom' => 'nullable|string|max:255',
        'fournisseur' => 'nullable|string|max:255',
        'disponibilite' => 'required|in:disponible,pas encore disponible',
    ]);

    $pc->marque = $validated['marque'];
    $pc->modele = $validated['modele'];
    $pc->quantite_arrivee = $validated['quantite_arrivee'];
    $pc->date_arrivage = $validated['date_arrivage'] ?? $pc->date_arrivage;
    $pc->admin_nom = $validated['admin_nom'] ?? $pc->admin_nom;
    $pc->fournisseur = $validated['fournisseur'] ?? null;
    $pc->disponibilite = $validated['disponibilite'];

    $pc->save();

    return response()->json(['message' => 'PC mis à jour avec succès!', 'pc' => $pc]);
}



}
