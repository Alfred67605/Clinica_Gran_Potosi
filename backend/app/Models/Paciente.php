<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Paciente extends Model
{
    protected $table = 'pacientes';
    protected $primaryKey = 'id_paciente';

    protected $fillable = [
        'ci',
        'nombre',
        'fecha_nacimiento',
        'sexo',
        'tipo_sangre',
        'estado_civil',
        'ciudad',
        'direccion',
        'telefono',
        'correo',
        'contacto_emergencia',
        'estado',
    ];

    protected $appends = ['edad'];

    public function getEdadAttribute(): int
    {
        return Carbon::parse($this->fecha_nacimiento)->age;
    }

    public function antecedentes()
    {
        return $this->hasOne(AntecedentesMedicos::class, 'id_paciente', 'id_paciente');
    }

    public function consultas()
    {
        return $this->hasMany(Consulta::class, 'id_paciente', 'id_paciente')
                    ->orderBy('fecha_hora', 'desc');
    }
}
