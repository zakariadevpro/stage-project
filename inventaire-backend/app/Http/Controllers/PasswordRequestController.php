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
}

