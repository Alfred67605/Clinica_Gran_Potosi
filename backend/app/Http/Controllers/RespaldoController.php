<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use App\Models\Usuario;
use App\Models\Consulta;
use App\Models\SignosVitales;
use App\Models\AntecedentesMedicos;
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

    /**
     * Importar/Restaurar la base de datos desde un archivo JSON.
     */
    public function importar(Request $request): JsonResponse
    {
        $request->validate([
            'json_data' => 'required|array',
        ]);

        $data = $request->json_data;

        if (!isset($data['clinica_db']) || $data['clinica_db'] !== true) {
            return response()->json(['message' => 'El archivo JSON no corresponde a un respaldo válido de la Clínica Gran Potosí.'], 400);
        }

        try {
            \DB::transaction(function () use ($data) {
                // Truncar tablas para restaurar exactamente el respaldo
                \DB::statement('TRUNCATE TABLE antecedentes_medicos CASCADE');
                \DB::statement('TRUNCATE TABLE signos_vitales CASCADE');
                \DB::statement('TRUNCATE TABLE consultas CASCADE');
                \DB::statement('TRUNCATE TABLE pacientes CASCADE');

                // 1. Restaurar Usuarios
                if (isset($data['usuarios']) && is_array($data['usuarios'])) {
                    foreach ($data['usuarios'] as $uData) {
                        $existing = Usuario::where('username', $uData['usuario'])->first();
                        if (!$existing) {
                            Usuario::create([
                                'nombre' => $uData['nombre'],
                                'username' => $uData['usuario'],
                                'password' => \Hash::make('admin'), // Contraseña por defecto
                                'rol' => $uData['rol'] ?? 'Médico',
                                'estado' => $uData['estado'] ?? 'Activo',
                            ]);
                        }
                    }
                }

                // 2. Restaurar Pacientes, Antecedentes, Consultas y Signos Vitales
                if (isset($data['pacientes']) && is_array($data['pacientes'])) {
                    foreach ($data['pacientes'] as $pData) {
                        // Crear Paciente
                        $paciente = Paciente::create([
                            'nombre' => $pData['nombre'],
                            'ci' => $pData['ci'],
                            'fecha_nacimiento' => $pData['fechaNacimiento'] ?? '1990-01-01',
                            'sexo' => $pData['sexo'] ?? 'M',
                            'tipo_sangre' => $pData['tipoSangre'] ?? null,
                            'estado_civil' => $pData['estadoCivil'] ?? 'Soltero/a',
                            'ciudad' => $pData['ciudad'] ?? 'Potosí',
                            'direccion' => $pData['direccion'] ?? '',
                            'telefono' => $pData['telefono'] ?? '',
                            'correo' => $pData['correo'] ?? null,
                            'contacto_emergencia' => $pData['contactoEmergencia'] ?? null,
                            'estado' => $pData['estado'] ?? 'Activo',
                        ]);

                        // Crear Antecedentes
                        AntecedentesMedicos::create([
                            'id_paciente' => $paciente->id_paciente,
                            'alergias' => $pData['alergias'] ?? 'Ninguna',
                            'enfermedades_previas' => $pData['enfermedadesPrevias'] ?? null,
                            'medicamentos_actuales' => $pData['medicamentosActuales'] ?? null,
                            'antecedentes_familiares' => $pData['antecedentesFamiliares'] ?? null,
                            'historial_quirurgico' => $pData['historialQuirurgico'] ?? null,
                            'observaciones_generales' => $pData['observacionesGenerales'] ?? null,
                        ]);

                        // Crear Consultas e Signos Vitales
                        if (isset($pData['historialConsultas']) && is_array($pData['historialConsultas'])) {
                            // Invertir para que se inserten de más antiguas a más recientes
                            $consultasData = array_reverse($pData['historialConsultas']);

                            foreach ($consultasData as $cData) {
                                // Buscar doctor asignado por nombre o usar el primero médico/admin disponible
                                $medico = Usuario::where('nombre', $cData['medico'])->first() 
                                       ?? Usuario::where('rol', 'Médico')->first() 
                                       ?? Usuario::first();

                                $consulta = Consulta::create([
                                    'id_paciente' => $paciente->id_paciente,
                                    'id_usuario' => $medico->id_usuario ?? 1,
                                    'fecha_hora' => ($cData['fecha'] ?? now()->format('Y-m-d')) . ' 12:00:00',
                                    'tipo_consulta' => $cData['tipo'] ?? 'Consulta General',
                                    'area_medica' => $cData['areaMedica'] ?? 'Medicina General',
                                    'prioridad_medica' => $cData['prioridad'] ?? 'Baja',
                                    'sintomas_observados' => $cData['sintomas'] ?? 'Consulta de rutina',
                                    'diagnostico_preliminar' => $cData['diagnostico'] ?? '',
                                    'diagnostico_final' => $cData['diagnostico'] ?? '',
                                    'tratamiento' => $cData['tratamiento'] ?? '',
                                    'indicaciones_medicas' => $cData['indicaciones'] ?? '',
                                    'estado_paciente' => $cData['estadoPaciente'] ?? 'En Seguimiento',
                                    'tratamiento_duracion' => $cData['tratamientoDuracion'] ?? '',
                                    'tratamiento_horarios' => $cData['tratamientoHorarios'] ?? '',
                                    'notas_seguimiento' => $cData['notasSeguimiento'] ?? '',
                                ]);

                                // Crear Signos Vitales si corresponde
                                if (!empty($cData['peso']) || !empty($cData['temperatura']) || !empty($cData['presionArterial'])) {
                                    SignosVitales::create([
                                        'id_consulta' => $consulta->id_consulta,
                                        'peso' => !empty($cData['peso']) ? floatval($cData['peso']) : null,
                                        'altura' => !empty($cData['altura']) ? floatval($cData['altura']) : null,
                                        'imc' => !empty($cData['imc']) ? floatval($cData['imc']) : null,
                                        'presion_arterial' => $cData['presionArterial'] ?? null,
                                        'frecuencia_cardiaca' => !empty($cData['frecuenciaCardiaca']) ? intval($cData['frecuenciaCardiaca']) : null,
                                        'temperatura' => !empty($cData['temperatura']) ? floatval($cData['temperatura']) : null,
                                        'saturacion_oxigeno' => !empty($cData['saturacionOxigeno']) ? intval($cData['saturacionOxigeno']) : null,
                                    ]);
                                }
                            }
                        }
                    }
                }
            });

            return response()->json([
                'message' => 'Base de datos restaurada con éxito a partir del archivo de respaldo.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al restaurar el respaldo: ' . $e->getMessage()
            ], 500);
        }
    }
}
