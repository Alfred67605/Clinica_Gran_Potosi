<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Endpoint para iniciar sesión.
     */
    public function login(Request $request)
    {
        $request->validate([
            'usuario' => 'required|string',
            'contrasena' => 'required|string',
        ]);

        $usuario = Usuario::where('username', $request->usuario)->first();

        if (!$usuario || !Hash::check($request->contrasena, $usuario->password)) {
            return response()->json([
                'message' => 'Usuario o contraseña incorrectos.'
            ], 401);
        }

        if ($usuario->estado !== 'Activo') {
            return response()->json([
                'message' => 'La cuenta se encuentra inactiva. Contacte al administrador.'
            ], 403);
        }

        // Devolvemos los datos del usuario para el frontend
        return response()->json([
            'id' => $usuario->id_usuario,
            'nombre' => $usuario->nombre,
            'usuario' => $usuario->username,
            'rol' => $usuario->rol,
            'estado' => $usuario->estado,
        ], 200);
    }
}
