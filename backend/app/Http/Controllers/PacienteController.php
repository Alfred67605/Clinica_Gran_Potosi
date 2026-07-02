<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use App\Models\AntecedentesMedicos;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PacienteController extends Controller
{
    /**
     * Listar todos los pacientes con antecedentes y última consulta.
     */
    public function index(): JsonResponse
    {
        $pacientes = Paciente::with(['antecedentes', 'consultas.signosVitales', 'consultas.usuario'])
            ->orderBy('id_paciente', 'desc')
            ->get();

        $result = $pacientes->map(function ($p) {
            return $this->formatPacienteCompleto($p);
        });

        return response()->json($result);
    }

    /**
     * Obtener un paciente con su historial completo.
     */
    public function show(int $id): JsonResponse
    {
        $paciente = Paciente::with(['antecedentes', 'consultas.signosVitales', 'consultas.usuario'])
            ->findOrFail($id);

        return response()->json($this->formatPacienteCompleto($paciente));
    }

    /**
     * Registrar un nuevo paciente (con antecedentes médicos).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|min:5|max:100',
            'ci' => 'required|string|max:15|unique:pacientes,ci',
            'fecha_nacimiento' => 'required|date|before_or_equal:today',
            'sexo' => 'required|string|in:M,F,O',
            'tipo_sangre' => 'nullable|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'estado_civil' => 'nullable|string',
            'ciudad' => 'nullable|string|max:50',
            'direccion' => 'required|string|max:150',
            'telefono' => 'required|string|max:15',
            'correo' => 'nullable|email|max:100',
            'contacto_emergencia' => 'nullable|string|max:100',
            'foto' => 'nullable|string',
            // Antecedentes (opcionales)
            'alergias' => 'nullable|string',
            'enfermedades_previas' => 'nullable|string',
            'medicamentos_actuales' => 'nullable|string',
            'antecedentes_familiares' => 'nullable|string',
            'historial_quirurgico' => 'nullable|string',
            'observaciones_generales' => 'nullable|string',
        ]);

        $fotoPath = null;
        if ($request->filled('foto') && str_starts_with($request->input('foto'), 'data:image')) {
            $fotoPath = $this->saveBase64Photo($request->input('foto'));
        }

        $pacienteData = $request->only([
            'nombre', 'ci', 'fecha_nacimiento', 'sexo', 'tipo_sangre',
            'estado_civil', 'ciudad', 'direccion', 'telefono', 'correo',
            'contacto_emergencia',
        ]);
        if ($fotoPath) {
            $pacienteData['foto'] = $fotoPath;
        }

        $paciente = Paciente::create($pacienteData);

        // Crear antecedentes médicos asociados
        AntecedentesMedicos::create([
            'id_paciente' => $paciente->id_paciente,
            'alergias' => $request->input('alergias', 'Ninguna'),
            'enfermedades_previas' => $request->input('enfermedades_previas'),
            'medicamentos_actuales' => $request->input('medicamentos_actuales'),
            'antecedentes_familiares' => $request->input('antecedentes_familiares'),
            'historial_quirurgico' => $request->input('historial_quirurgico'),
            'observaciones_generales' => $request->input('observaciones_generales'),
        ]);

        $paciente->load(['antecedentes', 'consultas']);

        return response()->json($this->formatPacienteCompleto($paciente), 201);
    }

    /**
     * Actualizar datos de un paciente existente.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $paciente = Paciente::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|string|min:5|max:100',
            'ci' => 'sometimes|string|max:15|unique:pacientes,ci,' . $paciente->id_paciente . ',id_paciente',
            'fecha_nacimiento' => 'sometimes|date|before_or_equal:today',
            'sexo' => 'sometimes|string|in:M,F,O',
            'tipo_sangre' => 'nullable|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'estado_civil' => 'nullable|string',
            'ciudad' => 'nullable|string|max:50',
            'direccion' => 'sometimes|string|max:150',
            'telefono' => 'sometimes|string|max:15',
            'correo' => 'nullable|email|max:100',
            'contacto_emergencia' => 'nullable|string|max:100',
            'estado' => 'sometimes|string|in:Activo,Inactivo',
            'foto' => 'nullable|string',
            // Antecedentes (opcionales)
            'alergias' => 'nullable|string',
            'enfermedades_previas' => 'nullable|string',
            'medicamentos_actuales' => 'nullable|string',
            'antecedentes_familiares' => 'nullable|string',
            'historial_quirurgico' => 'nullable|string',
            'observaciones_generales' => 'nullable|string',
        ]);

        $pacienteFields = $request->only([
            'nombre', 'ci', 'fecha_nacimiento', 'sexo', 'tipo_sangre',
            'estado_civil', 'ciudad', 'direccion', 'telefono', 'correo',
            'contacto_emergencia', 'estado',
        ]);

        if ($request->filled('foto') && str_starts_with($request->input('foto'), 'data:image')) {
            $fotoPath = $this->saveBase64Photo($request->input('foto'), $paciente->foto);
            if ($fotoPath) {
                $pacienteFields['foto'] = $fotoPath;
            }
        } elseif ($request->has('foto') && empty($request->input('foto'))) {
            if ($paciente->foto) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($paciente->foto);
            }
            $pacienteFields['foto'] = null;
        }

        $paciente->update($pacienteFields);

        // Actualizar antecedentes si se envían
        $antecedentesFields = $request->only([
            'alergias', 'enfermedades_previas', 'medicamentos_actuales',
            'antecedentes_familiares', 'historial_quirurgico', 'observaciones_generales',
        ]);

        if (!empty($antecedentesFields)) {
            $paciente->antecedentes()->updateOrCreate(
                ['id_paciente' => $paciente->id_paciente],
                $antecedentesFields
            );
        }

        $paciente->load(['antecedentes', 'consultas.signosVitales', 'consultas.usuario']);

        return response()->json($this->formatPacienteCompleto($paciente));
    }

    /**
     * Historial de consultas de un paciente.
     */
    public function historial(int $id): JsonResponse
    {
        $paciente = Paciente::with(['consultas.signosVitales', 'consultas.usuario'])
            ->findOrFail($id);

        $historial = $paciente->consultas->map(function ($c) {
            $sv = $c->signosVitales;
            return [
                'id_consulta' => $c->id_consulta,
                'fecha' => $c->fecha_hora->format('Y-m-d'),
                'tipo' => $c->tipo_consulta,
                'medico' => $c->usuario->nombre ?? 'No asignado',
                'areaMedica' => $c->area_medica,
                'diagnostico' => $c->diagnostico_final,
                'tratamiento' => $c->tratamiento,
                'indicaciones' => $c->indicaciones_medicas,
                'estadoPaciente' => $c->estado_paciente ?? 'En Seguimiento',
                'tratamientoDuracion' => $c->tratamiento_duracion ?? '',
                'tratamientoHorarios' => $c->tratamiento_horarios ?? '',
                'notasSeguimiento' => $c->notas_seguimiento ?? '',
                'sintomas' => $c->sintomas_observados ?? 'Consulta de rutina',
                'presionArterial' => $sv?->presion_arterial ?? '',
                'peso' => $sv?->peso ?? '',
                'altura' => $sv?->altura ?? '',
                'imc' => $sv?->imc ?? '',
                'frecuenciaCardiaca' => $sv?->frecuencia_cardiaca ?? '',
                'temperatura' => $sv?->temperatura ?? '',
                'saturacionOxigeno' => $sv?->saturacion_oxigeno ?? '',
                'prioridad' => $c->prioridad_medica,
                'estadoClinico' => 'Estable',
            ];
        });

        return response()->json($historial);
    }

    /**
     * Formatea un paciente completo para el frontend (mantiene la estructura esperada por React).
     */
    public function formatPacienteForApi(Paciente $p): array
    {
        return $this->formatPacienteCompleto($p);
    }

    private function formatPacienteCompleto(Paciente $p): array
    {
        $ant = $p->antecedentes;
        $ultimaConsulta = $p->consultas->first();
        
        // Obtener el último control de signos vitales que contenga datos reales registrados
        $ultimosSignos = \App\Models\SignosVitales::whereHas('consulta', function ($q) use ($p) {
            $q->where('id_paciente', $p->id_paciente);
        })
        ->where(function ($q) {
            $q->whereNotNull('peso')
              ->orWhereNotNull('altura')
              ->orWhereNotNull('presion_arterial')
              ->orWhereNotNull('frecuencia_cardiaca')
              ->orWhereNotNull('temperatura')
              ->orWhereNotNull('saturacion_oxigeno');
        })
        ->latest('id_signos')
        ->first();

        if (!$ultimosSignos) {
            $ultimosSignos = $ultimaConsulta?->signosVitales;
        }

        return [
            'id' => $p->id_paciente,
            'nombre' => $p->nombre,
            'ci' => $p->ci,
            'fechaNacimiento' => $p->fecha_nacimiento,
            'edad' => $p->edad,
            'sexo' => $p->sexo,
            'estadoCivil' => $p->estado_civil ?? 'Soltero/a',
            'direccion' => $p->direccion,
            'ciudad' => $p->ciudad ?? 'Potosí',
            'telefono' => $p->telefono,
            'correo' => $p->correo ?? '',
            'contactoEmergencia' => $p->contacto_emergencia ?? '',
            'tipoSangre' => $p->tipo_sangre ?? '',
            'estado' => $p->estado,
            'foto' => $p->foto ? asset('storage/' . $p->foto) : null,
            // Signos vitales (últimos registrados)
            'peso' => $ultimosSignos?->peso ?? '',
            'altura' => $ultimosSignos?->altura ?? '',
            'imc' => $ultimosSignos?->imc ?? '',
            'presionArterial' => $ultimosSignos?->presion_arterial ?? '',
            'frecuenciaCardiaca' => $ultimosSignos?->frecuencia_cardiaca ?? '',
            'temperatura' => $ultimosSignos?->temperatura ?? '',
            'saturacionOxigeno' => $ultimosSignos?->saturacion_oxigeno ?? '',
            // Antecedentes médicos
            'alergias' => $ant?->alergias ?? 'Ninguna',
            'enfermedadesPrevias' => $ant?->enfermedades_previas ?? '',
            'medicamentosActuales' => $ant?->medicamentos_actuales ?? '',
            'antecedentesFamiliares' => $ant?->antecedentes_familiares ?? '',
            'historialQuirurgico' => $ant?->historial_quirurgico ?? '',
            'observacionesGenerales' => $ant?->observaciones_generales ?? '',
            // Última consulta
            'diagnosticoPreliminar' => $ultimaConsulta?->diagnostico_preliminar ?? '',
            'diagnosticoFinal' => $ultimaConsulta?->diagnostico_final ?? '',
            'tratamiento' => $ultimaConsulta?->tratamiento ?? '',
            'indicacionesMedicas' => $ultimaConsulta?->indicaciones_medicas ?? '',
            'fechaIngreso' => $ultimaConsulta ? $ultimaConsulta->fecha_hora->format('Y-m-d') : $p->created_at?->format('Y-m-d'),
            'doctorAsignado' => $ultimaConsulta?->usuario?->nombre ?? 'Sin asignar',
            'areaMedica' => $ultimaConsulta?->area_medica ?? 'Consulta General',
            'prioridadMedica' => $ultimaConsulta?->prioridad_medica ?? 'Baja',
            // Historial de consultas formateado
            'historialConsultas' => $p->consultas->map(function ($c) {
                $sv = $c->signosVitales;
                return [
                    'fecha' => $c->fecha_hora->format('Y-m-d'),
                    'tipo' => $c->tipo_consulta,
                    'medico' => $c->usuario->nombre ?? 'No asignado',
                    'areaMedica' => $c->area_medica,
                    'diagnostico' => $c->diagnostico_final,
                    'tratamiento' => $c->tratamiento,
                    'indicaciones' => $c->indicaciones_medicas,
                    'estadoPaciente' => $c->estado_paciente ?? 'En Seguimiento',
                    'tratamientoDuracion' => $c->tratamiento_duracion ?? '',
                    'tratamientoHorarios' => $c->tratamiento_horarios ?? '',
                    'notasSeguimiento' => $c->notas_seguimiento ?? '',
                    'sintomas' => $c->sintomas_observados ?? 'Consulta de rutina',
                    'presionArterial' => $sv?->presion_arterial ?? '',
                    'peso' => $sv?->peso ?? '',
                    'altura' => $sv?->altura ?? '',
                    'imc' => $sv?->imc ?? '',
                    'frecuenciaCardiaca' => $sv?->frecuencia_cardiaca ?? '',
                    'temperatura' => $sv?->temperatura ?? '',
                    'saturacionOxigeno' => $sv?->saturacion_oxigeno ?? '',
                    'prioridad' => $c->prioridad_medica,
                    'estadoClinico' => 'Estable',
                ];
            })->values()->toArray(),
        ];
    }

    private function saveBase64Photo(string $base64Image, ?string $oldPhoto = null): ?string
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
            $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, etc.

            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                return null;
            }

            $base64Image = str_replace(' ', '+', $base64Image);
            $imageDecoded = base64_decode($base64Image);

            if ($imageDecoded !== false) {
                if ($oldPhoto) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPhoto);
                }

                $fileName = 'paciente_' . time() . '_' . uniqid() . '.' . $type;
                \Illuminate\Support\Facades\Storage::disk('public')->put('fotos/' . $fileName, $imageDecoded);
                return 'fotos/' . $fileName;
            }
        }
        return null;
    }
}
