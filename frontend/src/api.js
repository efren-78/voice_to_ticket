const BASE_URL = 'http://localhost:8000/api';

/**
 * inicio de sesion
 * Valida las credenciales del usuario (users.json)
 */
export const iniciarSesion = async (email, password) => {
  const respuesta = await fetch(`${BASE_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ email, password }),
  });
  
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.detail || 'Correo o contraseña incorrectos.');
  }
  // Guardar token y retornar el usuario público
  if (datos.access_token) {
    localStorage.setItem('token', datos.access_token);
    return datos.user;
  }
  return datos;
};

/**
 * Registro de usuarios
 * Envía los datos para crear un nuevo usuario en el sistema
 */
export const registrarUsuario = async (nombre, email, password) => {
  const respuesta = await fetch(`${BASE_URL}/usuarios/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nombre, email, password }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.detail || 'Error al registrar el usuario.');
  }

  return datos; // Retorna { message, user }
};


/**
 * Envía la descripción de un incidente en texto al Backend para ser analizado por el LLM.
 */
export const registrarIncidente = async (textoIncidente) => {
  const token = localStorage.getItem('token');
  const respuesta = await fetch(`${BASE_URL}/incidentes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ texto: textoIncidente }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.detail || 'Error al procesar el incidente');
  }

  return datos; // Retorna { message, incidente }
};

/**
 * Obtiene el historial completo de incidentes guardados en el archivo JSON.
 */
export const obtenerIncidentes = async () => {
  const respuesta = await fetch(`${BASE_URL}/incidentes`);
  
  const datos = await respuesta.json(); 
  if (!respuesta.ok) {
    throw new Error(datos.detail || 'Error al obtener el historial de incidentes');
  }

  return datos; // Retorna el array de incidentes
};

/**
 * Obtiene las métricas en tiempo real para las tarjetas del Dashboard (StatsCard).
 */
export const obtenerEstadisticas = async () => {
  const respuesta = await fetch(`${BASE_URL}/incidentes/stats`);
  
  const datos = await respuesta.json();
  
  if (!respuesta.ok) {
    throw new Error(datos.detail || 'Error al obtener las estadísticas');
  }

  return datos; // Retorna { total, resueltos, esta_semana, porcentaje_semana }
};

export const actualizarEstadoIncidente = async (incidenteId, estado) => {
  const token = localStorage.getItem('token');
  const respuesta = await fetch(`${BASE_URL}/incidentes/${incidenteId}/estado`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ estado }),
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.detail || 'Error al actualizar el estado del incidente');
  }

  return datos;
};

/**
 * Envía un blob de audio grabado por el micrófono al pipeline de transcripción
 */
export const registrarIncidentePorVoz = async (blobAudio) => {
  const formData = new FormData();
  // 'audio' es el nombre exacto que FastAPI mapea en (audio: UploadFile = File(...))
  formData.append('audio', blobAudio, 'reporte.wav'); 

  const token = localStorage.getItem('token');
  const respuesta = await fetch(`${BASE_URL}/incidentes/voz`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData, // El navegador configura de forma automática el multipart/form-data
  });
  
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.detail || 'Error al procesar el audio');
  }
  return datos; // Retorna el objeto IncidenteResponse analizado tras la transcripción
};

//CONFIGURACION

// Obtiene la configuración de idioma actual (ConfigResponse)
export const obtenerConfiguracion = async () => {
  const respuesta = await fetch(`${BASE_URL}/configuracion`);
  const datos = await respuesta.json();
  if (!respuesta.ok){
      throw new Error(datos.detail || 'Error al obtener configuración');
  }
  return datos; // Retorna { idioma_iso, idioma_nombre, idioma_voz }
};

// Guardar nuevo idioma en el backend (ConfigRequest)
export const actualizarConfiguracion = async (codigoIso) => {
  const respuesta = await fetch(`${BASE_URL}/configuracion`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idioma_iso: codigoIso }), // Mapea con ConfigRequest
  });
  
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.detail || 'Error al actualizar idioma');
  }
  return datos; // Retorna ConfigResponse actualizado
};
