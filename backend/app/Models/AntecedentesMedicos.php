<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AntecedentesMedicos extends Model
{
    protected $table = 'antecedentes_medicos';
    protected $primaryKey = 'id_antecedente';

    protected $fillable = [
        'id_paciente',
        'alergias',
        'enfermedades_previas',
        'medicamentos_actuales',
        'antecedentes_familiares',
        'historial_quirurgico',
        'observaciones_generales',
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }
}
