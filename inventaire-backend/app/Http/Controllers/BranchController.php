<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BranchController extends Controller
{
    public function index()
    {
        $branches = Branch::all()->map(function ($branch) {
            // Vérifier si image_path est non nul et non vide
            if ($branch->image_path) {
                $branch->image_path = asset($branch->image_path);
            } else {
                $branch->image_path = null; // ou une URL par défaut si tu veux
            }
            return $branch;
        });

        return response()->json($branches);
    }


    public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'location' => 'required|string|max:255',
        'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    $imagePath = null; // Valeur par défaut si aucune image

    if ($request->hasFile('image')) {
        $filename = Str::slug($request->name) . '_' . time() . '.' . $request->image->getClientOriginalExtension();
        $request->image->move(public_path('asset'), $filename);
        $imagePath = 'asset/' . $filename;
    }

    $branch = Branch::create([
        'name' => $request->name,
        'location' => $request->location,
        'image_path' => $imagePath,
    ]);

    $branch->image_path = $imagePath ? asset($imagePath) : null;

    return response()->json($branch, 201);
}
public function destroy($id)
{
    $branch = Branch::findOrFail($id);

    // Supprimer l’image si elle existe
    if ($branch->image_path && file_exists(public_path($branch->image_path))) {
        unlink(public_path($branch->image_path));
    }

    $branch->delete();

    return response()->json(['message' => 'Branche supprimée avec succès']);
}
public function update(Request $request, $id)
{
    $branch = Branch::findOrFail($id);

    $request->validate([
        'name' => 'sometimes|required|string|max:255',
        'location' => 'sometimes|required|string|max:255',
        'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    $branch->name = $request->name ?? $branch->name;
    $branch->location = $request->location ?? $branch->location;

    if ($request->hasFile('image')) {
        // Supprimer l'ancienne image
        if ($branch->image_path && file_exists(public_path($branch->image_path))) {
            unlink(public_path($branch->image_path));
        }

        $filename = Str::slug($branch->name) . '_' . time() . '.' . $request->image->getClientOriginalExtension();
        $request->image->move(public_path('asset'), $filename);
        $branch->image_path = 'asset/' . $filename;
    }

    $branch->save();

    $branch->image_path = asset($branch->image_path);

    return response()->json($branch);
}

}


