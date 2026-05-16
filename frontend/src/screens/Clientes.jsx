import React, { useState, useEffect, useMemo } from 'react'
import { clientesApi, reservasApi, initials } from '../api.js'
import { Badge, InlineMsg } from './NuevaReserva.jsx'
import {
  IconHome, IconChev, IconSearch, IconPlus, IconEdit, IconPower, IconCheck,
  IconLoad, IconX, IconAlert, IconUsers, IconReceipt, IconChevL
} from '../icons.jsx'

const PAGE_SIZE = 6

function enriquecerClientes(clientes, reservas) {
  const counts = {}
  reservas.forEach(r => {
    if (r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA') {
      const doc = r.cliente?.documento
      if (doc) counts[doc] = (counts[doc] || 0) + 1
    }
  })
  return clientes.map(c => ({ ...c, reservasActivas: counts[c.documento] || 0 }))
}

export default function Clientes({ pushToast }) {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [filterEstado, setFilterEstado] = useState('TODOS')
  const [page, setPage] = useState(1)

  const [drawer, setDrawer] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)

  // ---- Carga inicial ----
  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    setError('')
    try {
      const [cs, rs] = await Promise.all([clientesApi.listarTodos(), reservasApi.todas()])
      setClientes(enriquecerClientes(cs, rs))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ---- Stats ----
  const stats = useMemo(() => ({
    total: clientes.length,
    activos: clientes.filter(c => c.estado === 'ACTIVO').length,
    inactivos: clientes.filter(c => c.estado === 'INACTIVO').length,
    conReservaActiva: clientes.filter(c => c.reservasActivas > 0).length,
  }), [clientes])

  // ---- Filtrado y paginación ----
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clientes.filter(c => {
      if (filterEstado !== 'TODOS' && c.estado !== filterEstado) return false
      if (!q) return true
      return c.documento.includes(q) ||
        (c.nombre + ' ' + c.apellido).toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    })
  }, [clientes, query, filterEstado])

  useEffect(() => { setPage(1) }, [query, filterEstado])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ---- Crear / Editar cliente ----
  const handleSave = async (formData, mode) => {
    try {
      if (mode === 'create') {
        const nuevo = await clientesApi.crear({
          documento: formData.documento,
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
        })
        setClientes(prev => [{ ...nuevo, reservasActivas: 0 }, ...prev])
        pushToast('success', `Cliente ${nuevo.nombre} creado correctamente.`)
      } else {
        const actualizado = await clientesApi.actualizar(formData.documento, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
        })
        setClientes(prev => prev.map(c =>
          c.documento === formData.documento
            ? { ...c, ...actualizado, reservasActivas: c.reservasActivas }
            : c
        ))
        pushToast('success', `Cliente ${actualizado.nombre} actualizado.`)
      }
      setDrawer(null)
    } catch (err) {
      throw err
    }
  }

  // ---- Activar / Desactivar ----
  const handleToggleEstado = async (cliente) => {
    const nuevoEstado = cliente.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    try {
      await clientesApi.cambiarEstado(cliente.documento, nuevoEstado)
      setClientes(prev => prev.map(c =>
        c.documento === cliente.documento ? { ...c, estado: nuevoEstado } : c
      ))
      pushToast('success',
        nuevoEstado === 'INACTIVO'
          ? `${cliente.nombre} desactivado (borrado lógico).`
          : `${cliente.nombre} reactivado.`
      )
    } catch (err) {
      pushToast('error', err.message)
    } finally {
      setConfirmDialog(null)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-400)' }}>
        <IconLoad size={28} style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: 12 }}>Cargando clientes…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-state">
        <IconAlert size={28} />
        <div style={{ marginTop: 12, fontWeight: 600 }}>Error al cargar los datos</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>{error}</div>
        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={cargarDatos}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumb"><IconHome size={11} /> Operación <IconChev size={11} /> Clientes</div>
          <h1 className="page-title">Gestión de clientes</h1>
          <p className="page-sub">
            Registro maestro de clientes. La desactivación es un borrado lógico — el cliente nunca se elimina físicamente.
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setDrawer({ mode: 'create' })}>
          <IconPlus size={14} /> Nuevo cliente
        </button>
      </div>

      {/* ---- Stats strip ---- */}
      <div className="stat-strip">
        <StatCard label="Total clientes"     value={stats.total}            icon={<IconUsers size={14} />} />
        <StatCard label="Activos"            value={stats.activos}          icon={<IconCheck size={14} />} />
        <StatCard label="Inactivos"          value={stats.inactivos}        icon={<IconPower size={14} />} />
        <StatCard label="Con reserva activa" value={stats.conReservaActiva} icon={<IconReceipt size={14} />} />
      </div>

      {/* ---- Tabla ---- */}
      <div className="card">
        <div className="card-pad" style={{ paddingBottom: 14 }}>
          <div className="toolbar">
            <div className="search-box">
              <IconSearch size={15} />
              <input
                className="input"
                placeholder="Buscar por documento, nombre o email…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Buscar cliente"
              />
            </div>
            {['TODOS', 'ACTIVO', 'INACTIVO'].map(est => (
              <button key={est}
                className={'filter-chip ' + (filterEstado === est ? 'is-active' : '')}
                onClick={() => setFilterEstado(est)}>
                {est === 'ACTIVO' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />}
                {est === 'INACTIVO' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }} />}
                {est === 'TODOS' ? 'Todos' : est === 'ACTIVO' ? 'Activos' : 'Inactivos'}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          {paged.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <IconSearch size={28} style={{ color: 'var(--ink-300)' }} />
              <div style={{ marginTop: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink-700)' }}>Sin resultados</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 4 }}>
                No encontramos clientes con esos criterios. Prueba con otro término o crea uno nuevo.
              </div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Nombre completo</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Reservas activas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(c => (
                  <tr key={c.documento} className={c.estado === 'INACTIVO' ? 'is-inactive' : ''}>
                    <td className="cell-doc">{c.documento}</td>
                    <td>
                      <div className="cell-name">
                        <div className="avatar">{initials(c.nombre, c.apellido)}</div>
                        <span>{c.nombre} {c.apellido}</span>
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.telefono}</td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontWeight: 600,
                        color: c.reservasActivas >= 2 ? 'var(--danger)' : 'var(--ink-900)'
                      }}>
                        {c.reservasActivas}
                      </span>
                      <span style={{ color: 'var(--ink-400)', marginLeft: 3 }}>/ 2</span>
                    </td>
                    <td><Badge estado={c.estado} /></td>
                    <td className="cell-actions">
                      <div className="cell-actions">
                        <button className="btn-icon" title="Editar" onClick={() => setDrawer({ mode: 'edit', cliente: c })}>
                          <IconEdit size={14} />
                        </button>
                        <button
                          className={c.estado === 'ACTIVO' ? 'btn btn-danger' : 'btn btn-secondary'}
                          style={{ padding: '6px 12px', fontSize: 12.5 }}
                          onClick={() => setConfirmDialog(c)}
                        >
                          {c.estado === 'ACTIVO'
                            ? <><IconPower size={12} /> Desactivar</>
                            : <><IconCheck size={12} /> Activar</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card-foot">
          <div className="pg-info">
            Mostrando <b>{paged.length}</b> de <b>{filtered.length}</b> {filtered.length === 1 ? 'cliente' : 'clientes'}
          </div>
          <div className="pagination">
            <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <IconChevL size={12} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
              <button key={n} className={'pg-btn ' + (n === page ? 'is-active' : '')} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <IconChev size={12} />
            </button>
          </div>
        </div>
      </div>

      {drawer && (
        <ClienteFormDrawer
          mode={drawer.mode}
          cliente={drawer.cliente}
          existingDocs={clientes.map(c => c.documento)}
          existingEmails={clientes.map(c => c.email.toLowerCase())}
          onClose={() => setDrawer(null)}
          onSave={handleSave}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          cliente={confirmDialog}
          onCancel={() => setConfirmDialog(null)}
          onConfirm={() => handleToggleEstado(confirmDialog)}
        />
      )}
    </>
  )
}

// ---- Subcomponentes ----

function StatCard({ label, value, icon }) {
  return (
    <div className="stat">
      <div className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--ink-400)' }}>{icon}</span> {label}
      </div>
      <div className="val">{value}</div>
    </div>
  )
}

function ClienteFormDrawer({ mode, cliente, existingDocs, existingEmails, onClose, onSave }) {
  const [form, setForm] = useState(() => cliente
    ? { ...cliente }
    : { documento: '', nombre: '', apellido: '', email: '', telefono: '', estado: 'ACTIVO' }
  )
  const [touched, setTouched] = useState({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  const errors = useMemo(() => {
    const e = {}
    if (touched.documento) {
      if (!form.documento.trim()) e.documento = 'Campo obligatorio.'
      else if (mode === 'create' && existingDocs.includes(form.documento.trim()))
        e.documento = 'El documento ya está registrado.'
    }
    if (touched.nombre && !form.nombre.trim()) e.nombre = 'Campo obligatorio.'
    if (touched.apellido && !form.apellido.trim()) e.apellido = 'Campo obligatorio.'
    if (touched.email) {
      const v = form.email.trim().toLowerCase()
      if (!v) e.email = 'Campo obligatorio.'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) e.email = 'El email no tiene formato válido.'
      else if (mode === 'create' && existingEmails.includes(v))
        e.email = 'El email ya está registrado.'
      else if (mode === 'edit' && existingEmails.includes(v) && cliente.email.toLowerCase() !== v)
        e.email = 'El email ya está registrado.'
    }
    if (touched.telefono && !form.telefono.trim()) e.telefono = 'Campo obligatorio.'
    return e
  }, [form, touched, mode, existingDocs, existingEmails, cliente])

  const allFilled = form.documento && form.nombre && form.apellido && form.email && form.telefono
  const hasErrors = Object.keys(errors).length > 0

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const blur = (k) => setTouched(prev => ({ ...prev, [k]: true }))

  const submit = async () => {
    setTouched({ documento: true, nombre: true, apellido: true, email: true, telefono: true })
    if (!allFilled || hasErrors) return
    setSaving(true)
    setApiError('')
    try {
      await onSave(form, mode)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true"
           aria-label={mode === 'create' ? 'Nuevo cliente' : 'Editar cliente'}>
        <div className="drawer-head">
          <div>
            <h2>{mode === 'create' ? 'Nuevo cliente' : 'Editar cliente'}</h2>
            <div className="sub">
              {mode === 'create'
                ? 'Registra un cliente nuevo en el sistema.'
                : `Modificar datos de ${cliente.nombre} ${cliente.apellido}.`}
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar">
            <IconX size={14} />
          </button>
        </div>

        <div className="drawer-body">
          <FormField label="Documento" required error={errors.documento}>
            <input
              className={'input ' + (errors.documento ? 'is-error' : '')}
              placeholder="Ej: 1014522109"
              value={form.documento}
              disabled={mode === 'edit'}
              onChange={e => set('documento', e.target.value)}
              onBlur={() => blur('documento')}
              aria-required="true"
            />
            {mode === 'edit' && (
              <span className="hint">El documento es la llave primaria y no puede modificarse.</span>
            )}
          </FormField>

          <div className="grid-2">
            <FormField label="Nombre" required error={errors.nombre}>
              <input className={'input ' + (errors.nombre ? 'is-error' : '')}
                     placeholder="Ej: María"
                     value={form.nombre}
                     onChange={e => set('nombre', e.target.value)}
                     onBlur={() => blur('nombre')}
                     aria-required="true" />
            </FormField>
            <FormField label="Apellido" required error={errors.apellido}>
              <input className={'input ' + (errors.apellido ? 'is-error' : '')}
                     placeholder="Ej: Restrepo Vélez"
                     value={form.apellido}
                     onChange={e => set('apellido', e.target.value)}
                     onBlur={() => blur('apellido')}
                     aria-required="true" />
            </FormField>
          </div>

          <FormField label="Email" required error={errors.email}>
            <input className={'input ' + (errors.email ? 'is-error' : '')}
                   type="email"
                   placeholder="cliente@correo.co"
                   value={form.email}
                   onChange={e => set('email', e.target.value)}
                   onBlur={() => blur('email')}
                   aria-required="true" />
          </FormField>

          <FormField label="Teléfono" required error={errors.telefono}>
            <input className={'input ' + (errors.telefono ? 'is-error' : '')}
                   placeholder="+57 300 000 0000"
                   value={form.telefono}
                   onChange={e => set('telefono', e.target.value)}
                   onBlur={() => blur('telefono')}
                   aria-required="true" />
          </FormField>

          <FormField label="Estado" required>
            <div className="radio-group">
              <label className={'radio-card ' + (form.estado === 'ACTIVO' ? 'is-on' : '')}>
                <input type="radio" name="estado" hidden
                       checked={form.estado === 'ACTIVO'}
                       onChange={() => set('estado', 'ACTIVO')} />
                <span className="radio-dot" />
                <span className="lbl">Activo</span>
              </label>
              <label className={'radio-card ' + (form.estado === 'INACTIVO' ? 'is-on is-off' : '')}>
                <input type="radio" name="estado" hidden
                       checked={form.estado === 'INACTIVO'}
                       onChange={() => set('estado', 'INACTIVO')} />
                <span className="radio-dot" />
                <span className="lbl">Inactivo</span>
              </label>
            </div>
            <span className="hint">Los clientes inactivos no pueden generar nuevas reservas.</span>
          </FormField>

          {mode === 'edit' && cliente.reservasActivas > 0 && (
            <InlineMsg kind="info">
              Este cliente tiene <strong>{cliente.reservasActivas}</strong>{' '}
              {cliente.reservasActivas === 1 ? 'reserva activa' : 'reservas activas'}.
              La desactivación no las cancela automáticamente.
            </InlineMsg>
          )}

          {apiError && <InlineMsg kind="error">{apiError}</InlineMsg>}
        </div>

        <div className="drawer-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving
              ? <><IconLoad size={14} style={{ animation: 'spin 1s linear infinite' }} /> Guardando…</>
              : <><IconCheck size={14} /> Guardar</>}
          </button>
        </div>
      </div>
    </>
  )
}

function FormField({ label, required, error, children }) {
  return (
    <div className="field">
      <label>{label} {required && <span className="req" aria-hidden="true">*</span>}</label>
      {children}
      {error && (
        <span style={{ fontSize: 11.5, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}
              role="alert">
          <IconAlert size={11} /> {error}
        </span>
      )}
    </div>
  )
}

function ConfirmDialog({ cliente, onCancel, onConfirm }) {
  const isDeactivating = cliente.estado === 'ACTIVO'
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 24px 18px' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: isDeactivating ? 'var(--danger-bg)' : 'var(--primary-50)',
            color: isDeactivating ? 'var(--danger)' : 'var(--primary)',
            display: 'grid', placeItems: 'center', marginBottom: 14,
          }}>
            {isDeactivating ? <IconPower size={18} /> : <IconCheck size={18} />}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            {isDeactivating ? '¿Desactivar cliente?' : '¿Reactivar cliente?'}
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.5 }}>
            {isDeactivating
              ? <><strong>{cliente.nombre} {cliente.apellido}</strong> no podrá generar nuevas reservas, pero sus datos y reservas históricas se conservarán (borrado lógico).</>
              : <><strong>{cliente.nombre} {cliente.apellido}</strong> podrá volver a generar reservas en el sistema.</>}
          </p>
        </div>
        <div className="modal-foot" style={{ borderTop: '1px solid var(--ink-200)', background: 'var(--ink-50)' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button
            className={isDeactivating ? 'btn btn-danger' : 'btn btn-primary'}
            style={isDeactivating ? { background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' } : {}}
            onClick={onConfirm}
          >
            {isDeactivating ? 'Sí, desactivar' : 'Sí, reactivar'}
          </button>
        </div>
      </div>
    </div>
  )
}
