<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consulta extends Model
{
    protected $table = 'consultas';
    protected $primaryKey = 'id_consulta';

    protected $fillable = [
        'id_paciente',
        'id_usuario',
        'fecha_hora',
        'tipo_consulta',
        'area_medica',
        'prioridad_medica',
        'sintomas_observados',
        'diagnostico_preliminar',
        'diagnostico_final',
        'tratamiento',
        'indicaciones_medicas',
        'estado_paciente',
        'tratamiento_duracion',
        'tratamiento_horarios',
        'notas_seguimiento',
    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function signosVitales()
    {
        return $this->hasOne(SignosVitales::class, 'id_consulta', 'id_consulta');
    }
}
