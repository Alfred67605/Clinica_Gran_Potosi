<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('consultas', function (Blueprint $table) {
            $table->string('estado_paciente', 50)->default('En Seguimiento')->after('indicaciones_medicas');
            $table->string('tratamiento_duracion', 100)->nullable()->after('estado_paciente');
            $table->string('tratamiento_horarios', 150)->nullable()->after('tratamiento_duracion');
            $table->text('notas_seguimiento')->nullable()->after('tratamiento_horarios');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('consultas', function (Blueprint $table) {
            $table->dropColumn([
                'estado_paciente',
                'tratamiento_duracion',
                'tratamiento_horarios',
                'notas_seguimiento'
            ]);
        });
    }
};
