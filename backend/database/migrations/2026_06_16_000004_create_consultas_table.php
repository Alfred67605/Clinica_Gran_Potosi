<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultas', function (Blueprint $table) {
            $table->id('id_consulta');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_usuario');
            $table->timestamp('fecha_hora')->useCurrent();
            $table->string('tipo_consulta', 50); // Primera Vez, Reevaluación, Emergencia, Rutina
            $table->string('area_medica', 80);
            $table->string('prioridad_medica', 20); // Baja, Media, Alta, Crítica
            $table->text('sintomas_observados')->nullable();
            $table->text('diagnostico_preliminar')->nullable();
            $table->text('diagnostico_final');
            $table->text('tratamiento')->nullable();
            $table->text('indicaciones_medicas')->nullable();
            $table->timestamps();

            $table->foreign('id_paciente')
                  ->references('id_paciente')
                  ->on('pacientes')
                  ->onDelete('cascade');

            $table->foreign('id_usuario')
                  ->references('id_usuario')
                  ->on('usuarios')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultas');
    }
};
