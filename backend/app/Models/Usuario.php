<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';

    protected $fillable = [
        'nombre',
        'username',
        'password',
        'rol',
        'estado',
    ];

    protected $hidden = [
        'password',
    ];

    public function consultas()
    {
        return $this->hasMany(Consulta::class, 'id_usuario', 'id_usuario');
    }
}
