<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id('id_paciente');
            $table->string('ci', 15)->unique();
            $table->string('nombre', 100);
            $table->date('fecha_nacimiento');
            $table->char('sexo', 1); // M, F, O
            $table->string('tipo_sangre', 5)->nullable(); // A+, A-, B+, B-, AB+, AB-, O+, O-
            $table->string('estado_civil', 20)->nullable(); // Soltero, Casado, Viudo, Divorciado
            $table->string('ciudad', 50)->nullable()->default('Potosí');
            $table->string('direccion', 150);
            $table->string('telefono', 15);
            $table->string('correo', 100)->nullable();
            $table->string('contacto_emergencia', 100)->nullable();
            $table->string('estado', 20)->default('Activo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};
