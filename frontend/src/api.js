// ============================================================
// api.js — capa de acceso al backend Spring Boot
// ============================================================
// El proxy de Vite (vite.config.js) reescribe /api → http://localhost:8080/api
// Así no tenemos problemas de CORS en desarrollo y las URLs quedan limpias.

async function apiFetch(url, options = {}) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ mensaje: 'Error del servidor' }))
    throw new Error(err.mensaje || 'Error del servidor')
  }
  if (res.status === 204) return null
  return res.json()
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const clientesApi = {
  buscar:        (q)        => apiFetch(`/api/clientes?query=${encodeURIComponent(q)}`),
  listarTodos:   ()         => apiFetch('/api/clientes'),
  obtener:       (doc)      => apiFetch(`/api/clientes/${doc}`),
  crear:         (data)     => apiFetch('/api/clientes', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(data) }),
  actualizar:    (doc, data)=> apiFetch(`/api/clientes/${doc}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(data) }),
  cambiarEstado: (doc, est) => apiFetch(`/api/clientes/${doc}/estado`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ estado: est }) }),
}

export const experienciasApi = {
  buscar:  (q)  => apiFetch(`/api/experiencias?query=${encodeURIComponent(q)}`),
  obtener: (id) => apiFetch(`/api/experiencias/${id}`),
}

export const reservasApi = {
  crear:      (data) => apiFetch('/api/reservas', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(data) }),
  porCliente: (doc)  => apiFetch(`/api/reservas?clienteDoc=${encodeURIComponent(doc)}`),
  todas:      ()     => apiFetch('/api/reservas'),
}

// ---- Helpers de formato ----

export const fmtCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)

export const fmtFechaLarga = (isoStr) =>
  new Date(isoStr + 'T00:00').toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

export const fmtFechaCorta = (isoStr) =>
  new Date(isoStr + 'T00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

export const tomorrowISO = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export const initials = (nombre, apellido) =>
  ((nombre?.[0] ?? '') + (apellido?.[0] ?? '')).toUpperCase()

export const formatRsvId = (id) => 'RSV-' + String(id).padStart(6, '0')
