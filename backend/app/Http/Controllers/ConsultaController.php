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
            'estado_paciente' => 'nullable|string|max:50',
            'tratamiento_duracion' => 'nullable|string|max:100',
            'tratamiento_horarios' => 'nullable|string|max:150',
            'notas_seguimiento' => 'nullable|string',
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
            'estado_paciente' => $request->input('estado_paciente', 'En Seguimiento'),
            'tratamiento_duracion' => $request->tratamiento_duracion,
            'tratamiento_horarios' => $request->tratamiento_horarios,
            'notas_seguimiento' => $request->notas_seguimiento,
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

    /**
     * Obtener listado de consultas filtrado para reportes.
     */
    public function reporte(Request $request): JsonResponse
    {
        $query = Consulta::with(['paciente', 'usuario', 'signosVitales']);

        // Filtrar por paciente
        if ($request->filled('id_paciente')) {
            $query->where('id_paciente', $request->id_paciente);
        }

        // Filtrar por área médica
        if ($request->filled('area_medica')) {
            $query->where('area_medica', $request->area_medica);
        }

        // Filtrar por doctor
        if ($request->filled('id_usuario')) {
            $query->where('id_usuario', $request->id_usuario);
        }

        // Filtrar por fecha / rango de fecha
        if ($request->filled('periodo')) {
            $periodo = $request->periodo; // 'dia', 'semana', 'mes', 'custom'
            if ($periodo === 'dia') {
                $query->whereDate('fecha_hora', now()->toDateString());
            } elseif ($periodo === 'semana') {
                $query->where('fecha_hora', '>=', now()->subWeek());
            } elseif ($periodo === 'mes') {
                $query->where('fecha_hora', '>=', now()->subMonth());
            } elseif ($periodo === 'custom' && $request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
                $query->whereBetween('fecha_hora', [
                    $request->fecha_inicio . ' 00:00:00',
                    $request->fecha_fin . ' 23:59:59'
                ]);
            }
        }

        $consultas = $query->orderBy('fecha_hora', 'desc')->get();

        $result = $consultas->map(function ($c) {
            return [
                'id_consulta' => $c->id_consulta,
                'fecha_hora' => $c->fecha_hora->toDateTimeString(),
                'fecha' => $c->fecha_hora->format('Y-m-d'),
                'tipo_consulta' => $c->tipo_consulta,
                'area_medica' => $c->area_medica,
                'prioridad_medica' => $c->prioridad_medica,
                'paciente' => [
                    'id_paciente' => $c->paciente->id_paciente ?? null,
                    'nombre' => $c->paciente->nombre ?? 'No registrado',
                    'ci' => $c->paciente->ci ?? '',
                    'foto' => $c->paciente->foto ? asset('storage/' . $c->paciente->foto) : null,
                ],
                'medico' => [
                    'id_usuario' => $c->usuario->id_usuario ?? null,
                    'nombre' => $c->usuario->nombre ?? 'No asignado',
                ],
                'diagnostico_final' => $c->diagnostico_final,
                'tratamiento' => $c->tratamiento,
                'estado_paciente' => $c->estado_paciente,
                'tratamiento_duracion' => $c->tratamiento_duracion,
                'tratamiento_horarios' => $c->tratamiento_horarios,
                'notas_seguimiento' => $c->notas_seguimiento,
            ];
        });

        return response()->json($result);
    }
}
