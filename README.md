#  Sistema de Gestión de Pacientes - Clínica Gran Potosí

Bienvenido al repositorio del **Sistema de Gestión de Pacientes (SGP)** para la **Clínica Gran Potosí**. Esta aplicación es una solución integral diseñada para modernizar y optimizar la administración de pacientes, historiales clínicos y gestión administrativa en un entorno médico profesional.

---

##  Despliegue y Ejecución

Sigue estos pasos para poner en marcha el proyecto en tu entorno local:

### Requisitos Previos
- **Node.js** (versión 18 o superior recomendada)
- **npm** (incluido con Node.js)

### Instalación mediante Git (Clonación)
Para clonar el repositorio en otra computadora, ejecuta los siguientes comandos en tu terminal:

1. Clona el repositorio desde GitHub:
   ```bash
   git clone https://github.com/Alfred67605/Clinica_Gran_Potosi.git
   ```
2. Entra al directorio del proyecto:
   ```bash
   cd Clinica_Gran_Potosi
   ```
3. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

### Desarrollo
Para iniciar el servidor de desarrollo con recarga en tiempo real:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173` (o el puerto que indique la terminal).

### Producción
Para generar el bundle optimizado para producción:
```bash
npm run build
```
Los archivos resultantes se encontrarán en la carpeta `dist/`.

---

##  Estructura del Proyecto

El proyecto sigue una arquitectura modular basada en componentes de React, organizada de la siguiente manera:

```text
proyecto_clinica/
├── public/              # Activos estáticos (logos, iconos)
├── src/
│   ├── assets/          # Recursos multimedia y SVG
│   ├── components/      # Componentes reutilizables (Sidebar, Navbar, Cards)
│   ├── pages/           # Vistas principales de la aplicación
│   │   ├── RegistroPaciente.jsx
│   │   ├── BusquedaPaciente.jsx
│   │   ├── ActualizacionDatos.jsx
│   │   ├── HistorialClinico.jsx
│   │   ├── Reportes.jsx
│   │   ├── GestionUsuarios.jsx
│   │   └── Respaldo.jsx
│   ├── App.jsx          # Lógica central y enrutamiento (Hash Routing)
│   ├── main.jsx         # Punto de entrada de la aplicación
│   └── index.css        # Sistema de diseño y estilos globales
├── index.html           # Plantilla HTML base
├── package.json         # Dependencias y scripts
└── tsconfig.json        # Configuración de TypeScript (si aplica)
```

---

##  Funcionalidades Detalladas

La plataforma está dividida en 7 módulos principales accesibles desde el panel lateral:

### 1. Registro de Paciente
Permite el alta de nuevos pacientes capturando datos personales, de contacto y antecedentes médicos iniciales. Incluye validaciones en tiempo real para asegurar la integridad de la información.

### 2. Búsqueda de Paciente
Un motor de búsqueda eficiente que permite localizar expedientes por nombre, CI o fecha de nacimiento. Ofrece una vista rápida de los resultados para facilitar la navegación.

### 3. Actualización de Datos
Módulo dedicado a mantener la información de los pacientes al día. Permite editar perfiles existentes sin duplicar registros.

### 4. Historial Clínico
Visualización cronológica de las consultas, diagnósticos y tratamientos de cada paciente. Es la herramienta principal para los médicos durante la consulta.

### 5. Generación de Reportes
Panel analítico que utiliza **Recharts** para visualizar datos estadísticos de la clínica, como flujo de pacientes, diagnósticos frecuentes y métricas operativas.

### 6. Gestión de Usuarios
Área administrativa para el control de acceso. Permite crear, editar y gestionar los roles del personal (médicos, enfermeros, administrativos).

### 7. Respaldo de Información
Herramientas de seguridad para la exportación de bases de datos y mantenimiento del sistema, garantizando que la información médica esté siempre protegida.

---

##  Diseño y Tecnología

- **React + Vite**: Para una experiencia de usuario rápida y fluida.
- **Vanilla CSS**: Sistema de diseño personalizado con variables CSS para una estética premium y consistente (Dark Mode support).
- **Animaciones**: Micro-interacciones y transiciones suaves para mejorar la UX.
- **Responsive**: Diseño adaptado para diferentes tamaños de pantalla.

---

##  Licencia
Este proyecto fue desarrollado como prototipo profesional para la Clínica Gran Potosí. Todos los derechos reservados.
