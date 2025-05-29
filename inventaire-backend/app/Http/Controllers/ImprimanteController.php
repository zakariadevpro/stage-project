<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Imprimante;
use Illuminate\Support\Facades\Validator;

class ImprimanteController extends Controller
{
    public function import(Request $request)
{
    $data = $request->all();

    if (!isset($data['printers']) || !is_array($data['printers'])) {
        return response()->json(['message' => 'Données invalides'], 400);
    }

    foreach ($data['printers'] as $printer) {
        // Valider chaque ligne si nécessaire
        $validator = Validator::make($printer, [
            'emplacement' => 'nullable|string',
            'branche' => 'nullable|string',
            'adresseip' => 'nullable|ip',
            'hostname' => 'nullable|string',
            'numero_serie' => 'nullable|string',
            'modele_peripherique' => 'nullable|string',

        ]);

        if ($validator->fails()) continue;

        \App\Models\Imprimante::create($printer);
    }

    return response()->json(['message' => 'Importation réussie'], 200);
}
    // Lister toutes les imprimantes
    public function index()
    {
        return response()->json(Imprimante::all());
    }
    public function getByBranche($branche)
{
    $printers = Imprimante::where('branche', $branche)->get();
    return response()->json($printers);
}

    // Ajouter une imprimante
    public function store(Request $request)
    {
      $validated = $request->validate([
    'emplacement' => 'nullable|string|max:255',
    'branche' => 'nullable|string|max:255',
    'adresseip' => 'nullable|ip',
    'hostname' => 'nullable|string|max:255',
    'numero_serie' => 'nullable|string|max:255',
    'modele_peripherique' => 'nullable|string|max:255',

]);
        $imprimante = Imprimante::create($validated);

        return response()->json($imprimante, 201);
    }

    // Voir une imprimante
    public function show($id)
    {
        $imprimante = Imprimante::findOrFail($id);
        return response()->json($imprimante);
    }

    // Mettre à jour une imprimante
    public function update(Request $request, $id)
    {
        $imprimante = Imprimante::findOrFail($id);

      $validated = $request->validate([
    'emplacement' => 'nullable|string|max:255',
    'branche' => 'nullable|string|max:255',
    'adresseip' => 'nullable|ip',
    'hostname' => 'nullable|string|max:255',
    'numero_serie' => 'nullable|string|max:255',
    'modele_peripherique' => 'nullable|string|max:255',

]);

        $imprimante->update($validated);

        return response()->json($imprimante);
    }

    // Supprimer une imprimante
    public function destroy($id)
    {
        $imprimante = Imprimante::findOrFail($id);
        $imprimante->delete();

        return response()->json(['message' => 'Imprimante supprimée avec succès']);
    }
}
