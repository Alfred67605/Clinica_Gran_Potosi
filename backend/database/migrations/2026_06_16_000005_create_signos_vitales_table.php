<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('signos_vitales', function (Blueprint $table) {
            $table->id('id_signos');
            $table->unsignedBigInteger('id_consulta')->unique();
            $table->decimal('peso', 5, 2)->nullable();
            $table->decimal('altura', 3, 2)->nullable();
            $table->decimal('imc', 4, 2)->nullable();
            $table->string('presion_arterial', 10)->nullable(); // Ej: 120/80
            $table->integer('frecuencia_cardiaca')->nullable();
            $table->decimal('temperatura', 3, 1)->nullable();
            $table->integer('saturacion_oxigeno')->nullable();
            $table->timestamps();

            $table->foreign('id_consulta')
                  ->references('id_consulta')
                  ->on('consultas')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('signos_vitales');
    }
};
