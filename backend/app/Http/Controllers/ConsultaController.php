<?php

namespace App\Http\Controllers;

use App\Models\Consulta;
use App\Models\SignosVitales;
use App\Models\Paciente;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConsultaController extends Controller
{
    /**
     * Registrar una nueva consulta clínica con signos vitales.
     * Recibe los datos en el formato que envía el frontend.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_paciente' => 'required|integer|exists:pacientes,id_paciente',
            'id_usuario' => 'required|integer|exists:usuarios,id_usuario',
            'fecha_hora' => 'nullable|date',
            'tipo_consulta' => 'required|string|max:50',
            'area_medica' => 'required|string|max:80',
            'prioridad_medica' => 'required|string|in:Baja,Media,Alta,Crítica',
            'sintomas_observados' => 'nullable|string',
            'diagnostico_preliminar' => 'nullable|string',
            'diagnostico_final' => 'required|string',
            'tratamiento' => 'nullable|string',
            'indicaciones_medicas' => 'nullable|string',
            // Signos vitales
            'peso' => 'nullable|numeric|min:0',
            'altura' => 'nullable|numeric|min:0',
            'imc' => 'nullable|numeric|min:0',
            'presion_arterial' => 'nullable|string|max:10',
            'frecuencia_cardiaca' => 'nullable|integer|min:0',
            'temperatura' => 'nullable|numeric',
            'saturacion_oxigeno' => 'nullable|integer|min:0|max:100',
        ]);

        $consulta = Consulta::create([
            'id_paciente' => $request->id_paciente,
            'id_usuario' => $request->id_usuario,
            'fecha_hora' => $request->input('fecha_hora', now()),
            'tipo_consulta' => $request->tipo_consulta,
            'area_medica' => $request->area_medica,
            'prioridad_medica' => $request->prioridad_medica,
            'sintomas_observados' => $request->sintomas_observados,
            'diagnostico_preliminar' => $request->diagnostico_preliminar,
            'diagnostico_final' => $request->diagnostico_final,
            'tratamiento' => $request->tratamiento,
            'indicaciones_medicas' => $request->indicaciones_medicas,
        ]);

        // Crear signos vitales asociados
        SignosVitales::create([
            'id_consulta' => $consulta->id_consulta,
            'peso' => $request->peso,
            'altura' => $request->altura,
            'imc' => $request->imc,
            'presion_arterial' => $request->presion_arterial,
            'frecuencia_cardiaca' => $request->frecuencia_cardiaca,
            'temperatura' => $request->temperatura,
            'saturacion_oxigeno' => $request->saturacion_oxigeno,
        ]);

        // Recargar paciente completo para devolver al frontend
        $paciente = Paciente::with(['antecedentes', 'consultas.signosVitales', 'consultas.usuario'])
            ->find($request->id_paciente);

        return response()->json([
            'message' => 'Consulta registrada exitosamente',
            'consulta_id' => $consulta->id_consulta,
            'paciente' => app(PacienteController::class)->formatPacienteForApi($paciente),
        ], 201);
    }
}
