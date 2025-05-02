<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InventaireTotalPc;

class PcController extends Controller
{
    public function getPcsByBranche($brancheName)
    {
        $pcs = InventaireTotalPc::where('branches', $brancheName)->get();

        return response()->json([
            'pcs' => $pcs,
            'message' => $pcs->isEmpty() ? 'Aucun PC trouvé pour cette branche' : ''
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom_poste' => 'nullable|string',
            'num_serie' => 'nullable|string',
            'user' => 'nullable|string',
            'email' => 'nullable|email',
            'service' => 'nullable|string',
            'description' => 'nullable|string',
            'date_aff' => 'nullable|date',
            'etat' => 'nullable|string',
            'remarque' => 'nullable|string',
            'branches' => 'nullable|string',
        ]);

        $pc = InventaireTotalPc::create($data);
        return response()->json($pc, 201);
    }

    public function update(Request $request, $id)
    {
        $pc = InventaireTotalPc::findOrFail($id);

        $data = $request->validate([
            'nom_poste' => 'nullable|string',
            'num_serie' => 'nullable|string',
            'user' => 'nullable|string',
            'email' => 'nullable|email',
            'service' => 'nullable|string',
            'description' => 'nullable|string',
            'date_aff' => 'nullable|date',
            'etat' => 'nullable|string',
            'remarque' => 'nullable|string',
        ]);

        $pc->update($data);
        return response()->json($pc);
    }

    public function destroy($id)
    {
        $pc = InventaireTotalPc::findOrFail($id);
        $pc->delete();

        return response()->json(['message' => 'PC supprimé avec succès.']);
    }
}
