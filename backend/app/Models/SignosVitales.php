<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SignosVitales extends Model
{
    protected $table = 'signos_vitales';
    protected $primaryKey = 'id_signos';

    protected $fillable = [
        'id_consulta',
        'peso',
        'altura',
        'imc',
        'presion_arterial',
        'frecuencia_cardiaca',
        'temperatura',
        'saturacion_oxigeno',
    ];

    protected $casts = [
        'peso' => 'float',
        'altura' => 'float',
        'imc' => 'float',
        'frecuencia_cardiaca' => 'integer',
        'temperatura' => 'float',
        'saturacion_oxigeno' => 'integer',
    ];

    public function consulta()
    {
        return $this->belongsTo(Consulta::class, 'id_consulta', 'id_consulta');
    }
}
