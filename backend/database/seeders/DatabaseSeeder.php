<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Usuario;
use App\Models\Paciente;
use App\Models\AntecedentesMedicos;
use App\Models\Consulta;
use App\Models\SignosVitales;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ========== USUARIOS ==========
        $usuarios = [
            ['nombre' => 'Dr. Admin',          'username' => 'admin',   'password' => Hash::make('admin'),   'rol' => 'Administrador', 'estado' => 'Activo'],
            ['nombre' => 'Dr. Roberto López',  'username' => 'rlopez',  'password' => Hash::make('rlopez'),  'rol' => 'Médico',        'estado' => 'Activo'],
            ['nombre' => 'Lic. Ana Ramos',     'username' => 'aramos',  'password' => Hash::make('aramos'),  'rol' => 'Enfermería',    'estado' => 'Activo'],
            ['nombre' => 'Srta. Carla Vargas', 'username' => 'cvargas', 'password' => Hash::make('cvargas'), 'rol' => 'Recepcionista', 'estado' => 'Inactivo'],
            ['nombre' => 'Dr. Miguel Quispe',  'username' => 'mquispe', 'password' => Hash::make('mquispe'), 'rol' => 'Médico',        'estado' => 'Activo'],
        ];

        $userIds = [];
        foreach ($usuarios as $u) {
            $created = Usuario::create($u);
            $userIds[$u['nombre']] = $created->id_usuario;
        }

        // ========== PACIENTES ==========
        $pacientesData = [
            [
                'ci' => '7654321', 'nombre' => 'Juan Carlos Mamani Quispe',
                'fecha_nacimiento' => '1989-04-15', 'sexo' => 'M', 'tipo_sangre' => 'O+',
                'estado_civil' => 'Casado', 'ciudad' => 'Potosí',
                'direccion' => 'Av. Oruro #123, Barrio Central',
                'telefono' => '75234567', 'correo' => 'juan.mamani@gmail.com',
                'contacto_emergencia' => 'María Mamani (Esposa) - 75234568',
                'antecedentes' => [
                    'alergias' => 'Penicilina',
                    'enfermedades_previas' => 'Hipertensión arterial leve',
                    'medicamentos_actuales' => 'Losartán 50mg (1 vez al día), Aspirina 100mg (1 vez al día)',
                    'antecedentes_familiares' => 'Padre con hipertensión y diabetes tipo 2',
                    'historial_quirurgico' => 'Extracción de quiste sebáceo en zona lumbar derecha (2025)',
                    'observaciones_generales' => 'Paciente con historial de hipertensión arterial bajo control. Se recomienda revisión mensual.',
                ],
                'consultas' => [
                    [
                        'medico' => 'Dr. Roberto López', 'fecha_hora' => '2026-05-02 10:00:00',
                        'tipo_consulta' => 'Consulta General', 'area_medica' => 'Consulta General',
                        'prioridad_medica' => 'Media',
                        'sintomas_observados' => 'Cefalea leve',
                        'diagnostico_preliminar' => 'Cefalea tensional',
                        'diagnostico_final' => 'Hipertensión arterial leve. Dieta baja en sodio y control mensual.',
                        'tratamiento' => 'Losartán 50mg c/24h',
                        'indicaciones_medicas' => 'Control de presión semanal',
                        'signos' => ['peso' => 78.5, 'altura' => 1.72, 'imc' => 26.53, 'presion_arterial' => '130/85', 'frecuencia_cardiaca' => 72, 'temperatura' => 36.5, 'saturacion_oxigeno' => 97],
                    ],
                    [
                        'medico' => 'Lic. Ana Ramos', 'fecha_hora' => '2026-03-15 09:00:00',
                        'tipo_consulta' => 'Laboratorio', 'area_medica' => 'Laboratorio',
                        'prioridad_medica' => 'Baja',
                        'sintomas_observados' => 'Rutina',
                        'diagnostico_preliminar' => 'Control rutinario',
                        'diagnostico_final' => 'Hemograma completo dentro de rango. Glucemia: 105 mg/dl (levemente elevada).',
                        'tratamiento' => 'Control nutricional',
                        'indicaciones_medicas' => 'Evitar carbohidratos refinados',
                        'signos' => ['peso' => 79.0, 'altura' => 1.72, 'imc' => 26.70, 'presion_arterial' => '120/80', 'frecuencia_cardiaca' => 70, 'temperatura' => 36.4, 'saturacion_oxigeno' => 98],
                    ],
                    [
                        'medico' => 'Dr. Roberto López', 'fecha_hora' => '2026-01-10 14:30:00',
                        'tipo_consulta' => 'Consulta General', 'area_medica' => 'Consulta General',
                        'prioridad_medica' => 'Baja',
                        'sintomas_observados' => 'Fiebre y dolor de garganta',
                        'diagnostico_preliminar' => 'Posible gripe estacional',
                        'diagnostico_final' => 'Gripe estacional. Tratamiento: reposo, hidratación, paracetamol 500mg cada 8h.',
                        'tratamiento' => 'Paracetamol 500mg c/8h',
                        'indicaciones_medicas' => 'Tomar abundante agua y reposo',
                        'signos' => ['peso' => 78.0, 'altura' => 1.72, 'imc' => 26.36, 'presion_arterial' => '115/75', 'frecuencia_cardiaca' => 78, 'temperatura' => 38.2, 'saturacion_oxigeno' => 95],
                    ],
                ],
            ],
            [
                'ci' => '8123456', 'nombre' => 'María Elena Flores Condori',
                'fecha_nacimiento' => '1998-08-22', 'sexo' => 'F', 'tipo_sangre' => 'A+',
                'estado_civil' => 'Soltera', 'ciudad' => 'Potosí',
                'direccion' => 'Calle Bolivar #456, Zona Central',
                'telefono' => '70112233', 'correo' => 'elena.flores@outlook.com',
                'contacto_emergencia' => 'Luis Flores (Padre) - 70112234',
                'antecedentes' => [
                    'alergias' => 'Ninguna',
                    'enfermedades_previas' => 'Asma bronquial leve',
                    'medicamentos_actuales' => 'Salbutamol inhalador SOS',
                    'antecedentes_familiares' => 'Madre con asma bronquial',
                    'historial_quirurgico' => 'Ninguno',
                    'observaciones_generales' => 'Paciente estable. Control anual de función pulmonar por neumología.',
                ],
                'consultas' => [
                    [
                        'medico' => 'Dr. Miguel Quispe', 'fecha_hora' => '2026-05-01 11:00:00',
                        'tipo_consulta' => 'Consulta Especialidad', 'area_medica' => 'Neumología',
                        'prioridad_medica' => 'Baja',
                        'sintomas_observados' => 'Ninguno',
                        'diagnostico_preliminar' => 'Control de rutina asmática',
                        'diagnostico_final' => 'Asma bronquial bajo control. Espirometría normal.',
                        'tratamiento' => 'Salbutamol SOS',
                        'indicaciones_medicas' => 'Control en 6 meses',
                        'signos' => ['peso' => 62.0, 'altura' => 1.65, 'imc' => 22.77, 'presion_arterial' => '110/70', 'frecuencia_cardiaca' => 68, 'temperatura' => 36.2, 'saturacion_oxigeno' => 99],
                    ],
                ],
            ],
            [
                'ci' => '5987654', 'nombre' => 'Carlos Alberto Ramos López',
                'fecha_nacimiento' => '1974-11-03', 'sexo' => 'M', 'tipo_sangre' => 'B+',
                'estado_civil' => 'Divorciado', 'ciudad' => 'Potosí',
                'direccion' => 'Av. Serrudo #890',
                'telefono' => '69887766', 'correo' => 'carlos.ramos@hotmail.com',
                'contacto_emergencia' => 'Sonia Ramos (Hija) - 78945612',
                'antecedentes' => [
                    'alergias' => 'Aspirina',
                    'enfermedades_previas' => 'Diabetes mellitus tipo 2, Obesidad I',
                    'medicamentos_actuales' => 'Metformina 850mg (2 veces al día)',
                    'antecedentes_familiares' => 'Ambos padres diabéticos',
                    'historial_quirurgico' => 'Apendicectomía (1995)',
                    'observaciones_generales' => 'Requiere plan estricto de nutrición y control glucémico diario.',
                ],
                'consultas' => [
                    [
                        'medico' => 'Dr. Miguel Quispe', 'fecha_hora' => '2026-04-30 09:30:00',
                        'tipo_consulta' => 'Consulta Especialidad', 'area_medica' => 'Endocrinología',
                        'prioridad_medica' => 'Alta',
                        'sintomas_observados' => 'Polidipsia y poliuria leves',
                        'diagnostico_preliminar' => 'Hiperglucemia reactiva',
                        'diagnostico_final' => 'Glucemia elevada en ayunas (152 mg/dl). Ajuste de dosis de Metformina.',
                        'tratamiento' => 'Metformina 850mg c/12h',
                        'indicaciones_medicas' => 'Control de glucemia capilar en ayunas',
                        'signos' => ['peso' => 88.0, 'altura' => 1.70, 'imc' => 30.45, 'presion_arterial' => '135/90', 'frecuencia_cardiaca' => 75, 'temperatura' => 36.6, 'saturacion_oxigeno' => 96],
                    ],
                ],
            ],
            [
                'ci' => '6543210', 'nombre' => 'Ana Lucía Torrez Bustamante',
                'fecha_nacimiento' => '1985-01-30', 'sexo' => 'F', 'tipo_sangre' => 'O-',
                'estado_civil' => 'Casada', 'ciudad' => 'Potosí',
                'direccion' => 'Calle Junin #12, Zona San Clemente',
                'telefono' => '71234567', 'correo' => 'ana.torrez@gmail.com',
                'contacto_emergencia' => 'Felipe Torrez (Hermano) - 71234568',
                'antecedentes' => [
                    'alergias' => 'Sulfas',
                    'enfermedades_previas' => 'Ninguna',
                    'medicamentos_actuales' => 'Vitamina D3 1000 UI diaria',
                    'antecedentes_familiares' => 'Abuela materna con cáncer de mama',
                    'historial_quirurgico' => 'Cesárea segmentaria (2018)',
                    'observaciones_generales' => 'Control ginecológico y de salud anual preventivo. Paciente sana.',
                ],
                'consultas' => [
                    [
                        'medico' => 'Dr. Roberto López', 'fecha_hora' => '2026-04-29 15:00:00',
                        'tipo_consulta' => 'Consulta General', 'area_medica' => 'Ginecología',
                        'prioridad_medica' => 'Baja',
                        'sintomas_observados' => 'Fatiga leve',
                        'diagnostico_preliminar' => 'Control general preventivo',
                        'diagnostico_final' => 'Control de salud femenino preventivo e inicio de suplemento de Vitamina D.',
                        'tratamiento' => 'Vitamina D3 1000 UI diaria',
                        'indicaciones_medicas' => 'Exposición solar 15 min diarios',
                        'signos' => ['peso' => 58.0, 'altura' => 1.60, 'imc' => 22.66, 'presion_arterial' => '105/65', 'frecuencia_cardiaca' => 64, 'temperatura' => 36.7, 'saturacion_oxigeno' => 98],
                    ],
                ],
            ],
            [
                'ci' => '4321098', 'nombre' => 'Roberto Chávez Mendoza',
                'fecha_nacimiento' => '1959-07-07', 'sexo' => 'M', 'tipo_sangre' => 'A-',
                'estado_civil' => 'Casado', 'ciudad' => 'Potosí',
                'direccion' => 'Calle Chichas #101, Zona Cantumarca',
                'telefono' => '72998877', 'correo' => 'roberto.chavez@gmail.com',
                'contacto_emergencia' => 'Lucía Chávez (Esposa) - 72998878',
                'antecedentes' => [
                    'alergias' => 'Ninguna',
                    'enfermedades_previas' => 'Cardiopatía isquémica crónica, Hipertensión arterial',
                    'medicamentos_actuales' => 'Amlodipino 10mg, Aspirina 100mg, Atorvastatina 20mg',
                    'antecedentes_familiares' => 'Padre fallecido por infarto agudo de miocardio',
                    'historial_quirurgico' => 'Angioplastia coronaria con colocación de stent (2022)',
                    'observaciones_generales' => 'Cardiopatía isquémica controlada. Monitoreo regular por hipertensión descompensada.',
                ],
                'consultas' => [
                    [
                        'medico' => 'Dr. Miguel Quispe', 'fecha_hora' => '2026-04-28 08:00:00',
                        'tipo_consulta' => 'Consulta Especialidad', 'area_medica' => 'Cardiología',
                        'prioridad_medica' => 'Alta',
                        'sintomas_observados' => 'Disnea leve de esfuerzo',
                        'diagnostico_preliminar' => 'Angina inestable descartada',
                        'diagnostico_final' => 'Monitoreo post-angioplastia. Ajuste de antihipertensivos por presiones elevadas.',
                        'tratamiento' => 'Atorvastatina 20mg, Amlodipino 10mg, Enalapril 10mg',
                        'indicaciones_medicas' => 'Evitar alimentos grasos y sal',
                        'signos' => ['peso' => 82.5, 'altura' => 1.75, 'imc' => 26.94, 'presion_arterial' => '142/88', 'frecuencia_cardiaca' => 82, 'temperatura' => 36.3, 'saturacion_oxigeno' => 94],
                    ],
                ],
            ],
        ];

        foreach ($pacientesData as $data) {
            // Crear paciente
            $paciente = Paciente::create([
                'ci' => $data['ci'],
                'nombre' => $data['nombre'],
                'fecha_nacimiento' => $data['fecha_nacimiento'],
                'sexo' => $data['sexo'],
                'tipo_sangre' => $data['tipo_sangre'],
                'estado_civil' => $data['estado_civil'],
                'ciudad' => $data['ciudad'],
                'direccion' => $data['direccion'],
                'telefono' => $data['telefono'],
                'correo' => $data['correo'] ?? null,
                'contacto_emergencia' => $data['contacto_emergencia'] ?? null,
                'estado' => 'Activo',
            ]);

            // Crear antecedentes médicos
            AntecedentesMedicos::create(array_merge(
                ['id_paciente' => $paciente->id_paciente],
                $data['antecedentes']
            ));

            // Crear consultas con signos vitales
            foreach ($data['consultas'] as $consultaData) {
                $medicoId = $userIds[$consultaData['medico']] ?? $userIds['Dr. Roberto López'];

                $consulta = Consulta::create([
                    'id_paciente' => $paciente->id_paciente,
                    'id_usuario' => $medicoId,
                    'fecha_hora' => $consultaData['fecha_hora'],
                    'tipo_consulta' => $consultaData['tipo_consulta'],
                    'area_medica' => $consultaData['area_medica'],
                    'prioridad_medica' => $consultaData['prioridad_medica'],
                    'sintomas_observados' => $consultaData['sintomas_observados'],
                    'diagnostico_preliminar' => $consultaData['diagnostico_preliminar'],
                    'diagnostico_final' => $consultaData['diagnostico_final'],
                    'tratamiento' => $consultaData['tratamiento'],
                    'indicaciones_medicas' => $consultaData['indicaciones_medicas'],
                ]);

                SignosVitales::create(array_merge(
                    ['id_consulta' => $consulta->id_consulta],
                    $consultaData['signos']
                ));
            }
        }

        $this->command->info('✅ Base de datos de Clínica Gran Potosí sembrada con éxito.');
        $this->command->info("   → {$paciente->id_paciente} pacientes, " . Consulta::count() . " consultas, " . count($usuarios) . " usuarios.");
    }
}
