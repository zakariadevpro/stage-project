<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;



use App\Models\ConsommableImprimante;


class ConsommableImprimanteController extends Controller
{
    public function index(Request $request)
    {
        $query = ConsommableImprimante::query();

        // Recherche
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('marque', 'like', "%$search%")
                ->orWhere('reference', 'like', "%$search%");
        }

        // Filtrage par branche
        if ($request->has('branche')) {
            $query->where('branche', $request->input('branche'));
        }

        // Filtrage par état
        if ($request->filled('etat')) {
            $query->where('etat', $request->etat);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'marque' => 'required|string',
            'reference' => 'required|string',
            'branche' => 'required|string',
            'etat' => 'in:disponible,endemande',
            // les quantités sont optionnelles, par défaut à 0
        ]);

        $consommable = ConsommableImprimante::create($request->all());

        return response()->json($consommable, 201);
    }

    public function show($id)
    {
        return ConsommableImprimante::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $consommable = ConsommableImprimante::findOrFail($id);
        $consommable->update($request->all());

        return response()->json($consommable);
    }

    public function destroy($id)
    {
        $consommable = ConsommableImprimante::findOrFail($id);
        $consommable->delete();

        return response()->json(['message' => 'Supprimé avec succès']);
    }
    }

