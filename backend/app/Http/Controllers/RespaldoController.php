<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use App\Models\Usuario;
use App\Models\Consulta;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RespaldoController extends Controller
{
    /**
     * Exportar toda la base de datos en JSON.
     */
    public function exportar(): JsonResponse
    {
        $pacientes = Paciente::with(['antecedentes', 'consultas.signosVitales', 'consultas.usuario'])->get();
        $usuarios = Usuario::all()->map(function ($u) {
            return [
                'id' => $u->id_usuario,
                'nombre' => $u->nombre,
                'usuario' => $u->username,
                'rol' => $u->rol,
                'estado' => $u->estado,
            ];
        });

        $pacienteController = new PacienteController();

        return response()->json([
            'clinica_db' => true,
            'export_date' => now()->toISOString(),
            'pacientes' => $pacientes->map(function ($p) use ($pacienteController) {
                return $pacienteController->formatPacienteForApi($p);
            }),
            'usuarios' => $usuarios,
        ]);
    }

    /**
     * Estadísticas para dashboard y reportes.
     */
    public function estadisticas(): JsonResponse
    {
        $totalPacientes = Paciente::count();
        $pacientesActivos = Paciente::where('estado', 'Activo')->count();
        $totalConsultas = Consulta::count();
        $totalUsuarios = Usuario::count();

        // Consultas por área médica
        $consultasPorArea = Consulta::selectRaw('area_medica, count(*) as total')
            ->groupBy('area_medica')
            ->orderByDesc('total')
            ->get();

        // Consultas por mes (últimos 6 meses)
        $consultasPorMes = Consulta::selectRaw("to_char(fecha_hora, 'YYYY-MM') as mes, count(*) as total")
            ->where('fecha_hora', '>=', now()->subMonths(6))
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        // Distribución por prioridad
        $porPrioridad = Consulta::selectRaw('prioridad_medica, count(*) as total')
            ->groupBy('prioridad_medica')
            ->get();

        // Distribución por sexo
        $porSexo = Paciente::selectRaw('sexo, count(*) as total')
            ->groupBy('sexo')
            ->get();

        return response()->json([
            'totalPacientes' => $totalPacientes,
            'pacientesActivos' => $pacientesActivos,
            'totalConsultas' => $totalConsultas,
            'totalUsuarios' => $totalUsuarios,
            'consultasPorArea' => $consultasPorArea,
            'consultasPorMes' => $consultasPorMes,
            'porPrioridad' => $porPrioridad,
            'porSexo' => $porSexo,
        ]);
    }
}
