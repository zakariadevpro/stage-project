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
            $branch->image_path = asset($branch->image_path); // Ajoute l'URL complète
            return $branch;
        });

        return response()->json($branches);
    }
    
    public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'address' => 'required|string|max:255',
        'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    if ($request->hasFile('image')) {
        $filename = Str::slug($request->name) . '_' . time() . '.' . $request->image->getClientOriginalExtension();
        $request->image->move(public_path('asset'), $filename);
        $imagePath = 'asset/' . $filename;
    }

    $branch = Branch::create([
        'name' => $request->name,
        'address' => $request->address,
        'image_path' => $imagePath,
    ]);

    $branch->image_path = asset($branch->image_path);

    return response()->json($branch, 201);
}
}


