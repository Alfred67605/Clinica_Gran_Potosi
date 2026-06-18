/**
 * api.js — Servicio centralizado de comunicación con el backend Laravel
 * Clínica Gran Potosí — Sistema de Gestión de Pacientes
 */

const API_BASE = 'http://127.0.0.1:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose.');
    }
    throw error;
  }
}

// ==================== AUTH ====================

export async function iniciarSesion(usuario, contrasena) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ usuario, contrasena }),
  });
}

// ==================== PACIENTES ====================

export async function fetchPacientes() {
  return request('/pacientes');
}

export async function fetchPaciente(id) {
  return request(`/pacientes/${id}`);
}

export async function crearPaciente(data) {
  return request('/pacientes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function actualizarPaciente(id, data) {
  return request(`/pacientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function fetchHistorial(id) {
  return request(`/pacientes/${id}/historial`);
}

// ==================== CONSULTAS ====================

export async function crearConsulta(data) {
  return request('/consultas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== USUARIOS ====================

export async function fetchUsuarios() {
  return request('/usuarios');
}

export async function crearUsuario(data) {
  return request('/usuarios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function actualizarUsuario(id, data) {
  return request(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function eliminarUsuario(id) {
  return request(`/usuarios/${id}`, {
    method: 'DELETE',
  });
}

// ==================== RESPALDOS ====================

export async function exportarRespaldo() {
  return request('/respaldos/exportar');
}

export async function fetchEstadisticas() {
  return request('/reportes/estadisticas');
}
