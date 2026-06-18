<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    /**
     * Listar todos los usuarios (sin password).
     */
    public function index(): JsonResponse
    {
        $usuarios = Usuario::orderBy('id_usuario')
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id_usuario,
                    'nombre' => $u->nombre,
                    'usuario' => $u->username,
                    'rol' => $u->rol,
                    'estado' => $u->estado,
                ];
            });

        return response()->json($usuarios);
    }

    /**
     * Crear un nuevo usuario.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'usuario' => 'required|string|max:50|unique:usuarios,username',
            'contrasena' => 'required|string|min:4',
            'rol' => 'required|string|in:Administrador,Médico,Enfermería,Recepcionista,Laboratorista',
            'estado' => 'sometimes|string|in:Activo,Inactivo',
        ]);

        $usuario = Usuario::create([
            'nombre' => $request->nombre,
            'username' => $request->usuario,
            'password' => Hash::make($request->contrasena),
            'rol' => $request->rol,
            'estado' => $request->input('estado', 'Activo'),
        ]);

        return response()->json([
            'id' => $usuario->id_usuario,
            'nombre' => $usuario->nombre,
            'usuario' => $usuario->username,
            'rol' => $usuario->rol,
            'estado' => $usuario->estado,
        ], 201);
    }

    /**
     * Actualizar un usuario existente.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $usuario = Usuario::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'usuario' => 'sometimes|string|max:50|unique:usuarios,username,' . $usuario->id_usuario . ',id_usuario',
            'contrasena' => 'nullable|string|min:4',
            'rol' => 'sometimes|string|in:Administrador,Médico,Enfermería,Recepcionista,Laboratorista',
            'estado' => 'sometimes|string|in:Activo,Inactivo',
        ]);

        $updateData = [];
        if ($request->has('nombre')) $updateData['nombre'] = $request->nombre;
        if ($request->has('usuario')) $updateData['username'] = $request->usuario;
        if ($request->filled('contrasena')) $updateData['password'] = Hash::make($request->contrasena);
        if ($request->has('rol')) $updateData['rol'] = $request->rol;
        if ($request->has('estado')) $updateData['estado'] = $request->estado;

        $usuario->update($updateData);

        return response()->json([
            'id' => $usuario->id_usuario,
            'nombre' => $usuario->nombre,
            'usuario' => $usuario->username,
            'rol' => $usuario->rol,
            'estado' => $usuario->estado,
        ]);
    }

    /**
     * Eliminar un usuario.
     */
    public function destroy(int $id): JsonResponse
    {
        $usuario = Usuario::findOrFail($id);

        if ($usuario->rol === 'Administrador') {
            $adminCount = Usuario::where('rol', 'Administrador')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'No se puede eliminar el último administrador del sistema.'
                ], 422);
            }
        }

        $usuario->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }
}
