<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('antecedentes_medicos', function (Blueprint $table) {
            $table->id('id_antecedente');
            $table->unsignedBigInteger('id_paciente')->unique();
            $table->text('alergias')->nullable()->default('Ninguna');
            $table->text('enfermedades_previas')->nullable();
            $table->text('medicamentos_actuales')->nullable();
            $table->text('antecedentes_familiares')->nullable();
            $table->text('historial_quirurgico')->nullable();
            $table->text('observaciones_generales')->nullable();
            $table->timestamps();

            $table->foreign('id_paciente')
                  ->references('id_paciente')
                  ->on('pacientes')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('antecedentes_medicos');
    }
};
