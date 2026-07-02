<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\ConsultaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\RespaldoController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes — Clínica Gran Potosí
|--------------------------------------------------------------------------
*/

// Autenticación
Route::post('/login', [AuthController::class, 'login']);

// Pacientes
Route::get('/pacientes', [PacienteController::class, 'index']);
Route::get('/pacientes/{id}', [PacienteController::class, 'show']);
Route::post('/pacientes', [PacienteController::class, 'store']);
Route::put('/pacientes/{id}', [PacienteController::class, 'update']);
Route::get('/pacientes/{id}/historial', [PacienteController::class, 'historial']);

// Consultas clínicas
Route::post('/consultas', [ConsultaController::class, 'store']);

// Usuarios
Route::get('/usuarios', [UsuarioController::class, 'index']);
Route::post('/usuarios', [UsuarioController::class, 'store']);
Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);

// Respaldos y estadísticas
Route::get('/respaldos/exportar', [RespaldoController::class, 'exportar']);
Route::post('/respaldos/importar', [RespaldoController::class, 'importar']);
Route::get('/reportes/estadisticas', [RespaldoController::class, 'estadisticas']);
Route::get('/reportes/consultas', [ConsultaController::class, 'reporte']);
