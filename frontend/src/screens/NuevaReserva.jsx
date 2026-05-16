import React, { useState, useMemo } from 'react'
import { clientesApi, experienciasApi, reservasApi, fmtCOP, fmtFechaLarga, fmtFechaCorta, tomorrowISO, initials, formatRsvId } from '../api.js'
import { IconHome, IconChev, IconSearch, IconUser, IconCompass, IconMap, IconClock, IconReceipt, IconCheck, IconLoad, IconInfo, IconAlert, IconPlus } from '../icons.jsx'

export default function NuevaReserva({ pushToast }) {
  // ---- Cliente ----
  const [clienteQuery, setClienteQuery] = useState('')
  const [clienteResults, setClienteResults] = useState([])
  const [showClienteResults, setShowClienteResults] = useState(false)
  const [loadingCliente, setLoadingCliente] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [clienteReservas, setClienteReservas] = useState([])

  // ---- Experiencia ----
  const [expQuery, setExpQuery] = useState('')
  const [expResults, setExpResults] = useState([])
  const [showExpResults, setShowExpResults] = useState(false)
  const [loadingExp, setLoadingExp] = useState(false)
  const [expSeleccionada, setExpSeleccionada] = useState(null)

  // ---- Detalles ----
  const [fechaExperiencia, setFechaExperiencia] = useState('')
  const [cantidadPersonas, setCantidadPersonas] = useState('')

  // ---- Submit ----
  const [submitting, setSubmitting] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [success, setSuccess] = useState(null)

  const minFecha = tomorrowISO()

  // ---- Búsqueda de clientes ----
  const buscarCliente = async () => {
    if (!clienteQuery.trim()) return
    setLoadingCliente(true)
    setShowClienteResults(false)
    try {
      const res = await clientesApi.buscar(clienteQuery.trim())
      setClienteResults(res.slice(0, 6))
      setShowClienteResults(true)
    } catch {
      setClienteResults([])
      setShowClienteResults(true)
    } finally {
      setLoadingCliente(false)
    }
  }

  const seleccionarCliente = async (c) => {
    setClienteQuery('')
    setShowClienteResults(false)
    setLoadingCliente(true)
    try {
      const reservas = await reservasApi.porCliente(c.documento)
      const activas = reservas.filter(r => r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA').length
      setClienteSeleccionado({ ...c, reservasActivas: activas })
      setClienteReservas(reservas)
    } catch {
      setClienteSeleccionado({ ...c, reservasActivas: 0 })
      setClienteReservas([])
    } finally {
      setLoadingCliente(false)
    }
  }

  // ---- Búsqueda de experiencias ----
  const buscarExp = async () => {
    if (!expQuery.trim()) return
    setLoadingExp(true)
    setShowExpResults(false)
    try {
      const res = await experienciasApi.buscar(expQuery.trim())
      setExpResults(res.slice(0, 6))
      setShowExpResults(true)
    } catch {
      setExpResults([])
      setShowExpResults(true)
    } finally {
      setLoadingExp(false)
    }
  }

  const seleccionarExp = (e) => {
    setExpSeleccionada(e)
    setExpQuery('')
    setShowExpResults(false)
    if (cantidadPersonas && Number(cantidadPersonas) > e.capacidadMaxima) setCantidadPersonas('')
  }

  // ---- Total (RN-05) ----
  const total = expSeleccionada && cantidadPersonas
    ? expSeleccionada.precio * Number(cantidadPersonas) : 0

  // ---- Validaciones client-side ----
  const errors = useMemo(() => {
    const errs = []
    if (clienteSeleccionado) {
      if (clienteSeleccionado.estado === 'INACTIVO')
        errs.push({ key: 'cli-inactivo', msg: 'El cliente está inactivo y no puede realizar reservas.' })
      else if (clienteSeleccionado.reservasActivas >= 2)
        errs.push({ key: 'RN-01', code: 'RN-01', msg: 'El cliente ya tiene 2 reservas activas.' })
    }
    if (expSeleccionada) {
      if (expSeleccionada.estado === 'AGOTADA')
        errs.push({ key: 'exp-agot', msg: 'La experiencia está agotada para el período disponible.' })
      if (expSeleccionada.estado === 'SUSPENDIDA')
        errs.push({ key: 'exp-susp', msg: 'La experiencia se encuentra suspendida y no admite reservas.' })
    }
    if (fechaExperiencia && fechaExperiencia < minFecha)
      errs.push({ key: 'RN-04', code: 'RN-04', msg: 'La fecha debe ser al menos 24 horas en el futuro.' })
    if (expSeleccionada && cantidadPersonas && Number(cantidadPersonas) > expSeleccionada.capacidadMaxima)
      errs.push({ key: 'RN-03', code: 'RN-03', msg: `La cantidad excede la capacidad máxima (${expSeleccionada.capacidadMaxima} personas).` })
    if (clienteSeleccionado && expSeleccionada && fechaExperiencia) {
      const dup = clienteReservas.some(r =>
        r.experiencia.id === expSeleccionada.id &&
        r.fechaExperiencia === fechaExperiencia &&
        (r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA')
      )
      if (dup)
        errs.push({ key: 'RN-07', code: 'RN-07', msg: 'Ya existe una reserva para este cliente, experiencia y fecha.' })
    }
    return errs
  }, [clienteSeleccionado, expSeleccionada, fechaExperiencia, cantidadPersonas, clienteReservas, minFecha])

  const canSubmit =
    clienteSeleccionado && clienteSeleccionado.estado === 'ACTIVO' &&
    clienteSeleccionado.reservasActivas < 2 &&
    expSeleccionada && expSeleccionada.estado === 'DISPONIBLE' &&
    fechaExperiencia && fechaExperiencia >= minFecha &&
    cantidadPersonas && Number(cantidadPersonas) >= 1 &&
    Number(cantidadPersonas) <= (expSeleccionada?.capacidadMaxima || 0) &&
    errors.length === 0

  // ---- Submit ----
  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setErrorGeneral('')
    try {
      const reserva = await reservasApi.crear({
        clienteDocumento: clienteSeleccionado.documento,
        experienciaId: expSeleccionada.id,
        fechaExperiencia,
        cantidadPersonas: Number(cantidadPersonas),
      })
      setSuccess({
        ...reserva,
        codigo: formatRsvId(reserva.id),
        clienteNombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`,
        experienciaNombre: expSeleccionada.nombre,
      })
    } catch (err) {
      setErrorGeneral(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setSuccess(null)
    setClienteSeleccionado(null); setClienteReservas([])
    setExpSeleccionada(null)
    setFechaExperiencia(''); setCantidadPersonas('')
    setErrorGeneral('')
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumb">
            <IconHome size={11} /> Operación <IconChev size={11} /> Reservas <IconChev size={11} /> Nueva
          </div>
          <h1 className="page-title">Registrar reserva de experiencia</h1>
          <p className="page-sub">
            Completa los tres pasos para generar una nueva reserva en estado{' '}
            <b style={{ color: '#b8860b' }}>PENDIENTE</b>.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={reset}>Cancelar</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24 }}>
        <div className="card">

          {/* ===== Sección 1: Cliente ===== */}
          <Section step="1" title="Cliente" desc="Busca y selecciona al cliente que realizará la reserva.">
            <div className="search-wrap">
              <div className="search-row">
                <input
                  className="input"
                  placeholder="Buscar por documento o nombre…"
                  value={clienteQuery}
                  onChange={e => { setClienteQuery(e.target.value); setShowClienteResults(false) }}
                  onKeyDown={e => e.key === 'Enter' && buscarCliente()}
                  disabled={!!clienteSeleccionado}
                  aria-label="Buscar cliente"
                />
                {clienteSeleccionado ? (
                  <button className="btn btn-secondary" onClick={() => setClienteSeleccionado(null)}>Cambiar</button>
                ) : (
                  <button className="btn btn-primary" onClick={buscarCliente}
                          disabled={!clienteQuery.trim() || loadingCliente}>
                    {loadingCliente
                      ? <IconLoad size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      : <IconSearch size={14} />}
                    Buscar
                  </button>
                )}
              </div>

              {showClienteResults && (
                <div className="search-results">
                  {clienteResults.length === 0
                    ? <div className="sr-empty">Sin resultados para "{clienteQuery}"</div>
                    : clienteResults.map(c => (
                      <div key={c.documento} className="sr-item" onClick={() => seleccionarCliente(c)}>
                        <div className="sr-mini">{initials(c.nombre, c.apellido)}</div>
                        <div className="sr-text">
                          <div className="sr-name">{c.nombre} {c.apellido}</div>
                          <div className="sr-sub">CC {c.documento} · {c.email}</div>
                        </div>
                        <Badge estado={c.estado} />
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {!clienteSeleccionado && !showClienteResults && !loadingCliente && (
              <EmptyHint icon={<IconUser size={20} />} text="Aún no se ha seleccionado ningún cliente." />
            )}
            {loadingCliente && <SkeletonRow />}

            {clienteSeleccionado && (
              <>
                <div className="entity-card">
                  <div className="entity-avatar">{initials(clienteSeleccionado.nombre, clienteSeleccionado.apellido)}</div>
                  <div className="entity-main">
                    <div className="entity-name">
                      {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                      <Badge estado={clienteSeleccionado.estado} />
                    </div>
                    <div className="entity-meta">
                      <span><b>CC</b> {clienteSeleccionado.documento}</span>
                      <span className="sep">·</span>
                      <span>{clienteSeleccionado.email}</span>
                      <span className="sep">·</span>
                      <span>{clienteSeleccionado.telefono}</span>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span className={'reservation-counter ' + (clienteSeleccionado.reservasActivas >= 2 ? 'is-max' : '')}>
                        <IconReceipt size={12} /> Reservas activas: <b>{clienteSeleccionado.reservasActivas} / 2</b>
                      </span>
                    </div>
                  </div>
                </div>
                {clienteSeleccionado.estado === 'INACTIVO' && (
                  <InlineMsg kind="error">El cliente está inactivo y no puede realizar reservas.</InlineMsg>
                )}
                {clienteSeleccionado.estado === 'ACTIVO' && clienteSeleccionado.reservasActivas >= 2 && (
                  <InlineMsg kind="error" code="RN-01">El cliente ya tiene 2 reservas activas.</InlineMsg>
                )}
              </>
            )}
          </Section>

          {/* ===== Sección 2: Experiencia ===== */}
          <Section step="2" title="Experiencia" desc="Selecciona la actividad que el cliente reservará.">
            <div className="search-wrap">
              <div className="search-row">
                <input
                  className="input"
                  placeholder="Buscar por nombre o ubicación…"
                  value={expQuery}
                  onChange={e => { setExpQuery(e.target.value); setShowExpResults(false) }}
                  onKeyDown={e => e.key === 'Enter' && buscarExp()}
                  disabled={!!expSeleccionada}
                  aria-label="Buscar experiencia"
                />
                {expSeleccionada ? (
                  <button className="btn btn-secondary" onClick={() => setExpSeleccionada(null)}>Cambiar</button>
                ) : (
                  <button className="btn btn-primary" onClick={buscarExp}
                          disabled={!expQuery.trim() || loadingExp}>
                    {loadingExp
                      ? <IconLoad size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      : <IconSearch size={14} />}
                    Buscar
                  </button>
                )}
              </div>

              {showExpResults && (
                <div className="search-results">
                  {expResults.length === 0
                    ? <div className="sr-empty">Sin experiencias para "{expQuery}"</div>
                    : expResults.map(e => (
                      <div key={e.id} className="sr-item" onClick={() => seleccionarExp(e)}>
                        <div className="sr-mini exp">🌿</div>
                        <div className="sr-text">
                          <div className="sr-name">{e.nombre}</div>
                          <div className="sr-sub">{e.ubicacion} · {fmtCOP(e.precio)} / persona · {e.duracionHoras}h</div>
                        </div>
                        <Badge estado={e.estado} />
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {!expSeleccionada && !showExpResults && !loadingExp && (
              <EmptyHint icon={<IconCompass size={20} />} text="Aún no se ha seleccionado ninguna experiencia." />
            )}
            {loadingExp && <SkeletonRow />}

            {expSeleccionada && (
              <>
                <div className="entity-card">
                  <div className="entity-img">🌿</div>
                  <div className="entity-main">
                    <div className="entity-name">
                      {expSeleccionada.nombre}
                      <Badge estado={expSeleccionada.estado} />
                    </div>
                    <div className="entity-meta">
                      <span><IconMap size={11} style={{ verticalAlign: '-1px', marginRight: 3 }} />{expSeleccionada.ubicacion}</span>
                      <span className="sep">·</span>
                      <span><IconClock size={11} style={{ verticalAlign: '-1px', marginRight: 3 }} />{expSeleccionada.duracionHoras} horas</span>
                    </div>
                    <div className="entity-meta">
                      <span><b>Precio:</b> {fmtCOP(expSeleccionada.precio)} <span style={{ color: 'var(--ink-400)' }}>/ persona</span></span>
                      <span className="sep">·</span>
                      <span><b>Capacidad máxima:</b> {expSeleccionada.capacidadMaxima} personas</span>
                    </div>
                  </div>
                </div>
                {expSeleccionada.estado === 'AGOTADA' && (
                  <InlineMsg kind="error">La experiencia está <strong>agotada</strong> para el período disponible.</InlineMsg>
                )}
                {expSeleccionada.estado === 'SUSPENDIDA' && (
                  <InlineMsg kind="error">La experiencia se encuentra <strong>suspendida</strong> y no admite reservas.</InlineMsg>
                )}
              </>
            )}
          </Section>

          {/* ===== Sección 3: Detalles ===== */}
          <Section step="3" title="Detalles de la reserva" desc="Define la fecha, cantidad de personas y verifica el total.">
            <div className="grid-2">
              <div className="field">
                <label htmlFor="fecha-exp">Fecha de la experiencia <span className="req" aria-hidden="true">*</span></label>
                <input
                  id="fecha-exp"
                  type="date"
                  className={'input ' + (fechaExperiencia && fechaExperiencia < minFecha ? 'is-error' : '')}
                  min={minFecha}
                  value={fechaExperiencia}
                  onChange={e => setFechaExperiencia(e.target.value)}
                  aria-required="true"
                  aria-describedby={fechaExperiencia && fechaExperiencia < minFecha ? 'err-fecha' : undefined}
                />
                <span className="hint">
                  Mínimo {fmtFechaCorta(minFecha)} — al menos 24 h en el futuro.
                </span>
              </div>
              <div className="field">
                <label htmlFor="cantidad">Cantidad de personas <span className="req" aria-hidden="true">*</span></label>
                <input
                  id="cantidad"
                  type="number"
                  className={'input ' + (expSeleccionada && cantidadPersonas && Number(cantidadPersonas) > expSeleccionada.capacidadMaxima ? 'is-error' : '')}
                  min="1"
                  max={expSeleccionada?.capacidadMaxima || 1}
                  value={cantidadPersonas}
                  onChange={e => setCantidadPersonas(e.target.value)}
                  placeholder={expSeleccionada ? `Máx. ${expSeleccionada.capacidadMaxima}` : 'Selecciona experiencia'}
                  disabled={!expSeleccionada}
                  aria-required="true"
                />
                <span className="hint">
                  {expSeleccionada
                    ? `Máximo dinámico según capacidad (${expSeleccionada.capacidadMaxima}).`
                    : 'Selecciona una experiencia primero.'}
                </span>
              </div>
            </div>

            <div className="field">
              <label>Total (cálculo automático)</label>
              <div className="amount-display">
                <span>
                  <div className="lbl">Total a pagar</div>
                  <span className="calc">
                    {expSeleccionada && cantidadPersonas
                      ? `${fmtCOP(expSeleccionada.precio)} × ${cantidadPersonas} ${cantidadPersonas == 1 ? 'persona' : 'personas'}`
                      : '— × —'}
                  </span>
                </span>
                <span>{fmtCOP(total)}</span>
              </div>
            </div>

            {errors.filter(e => ['RN-04', 'RN-07', 'RN-03'].includes(e.code)).map(err => (
              <InlineMsg key={err.key} kind="error" code={err.code}>{err.msg}</InlineMsg>
            ))}
            {errorGeneral && <InlineMsg kind="error">{errorGeneral}</InlineMsg>}
          </Section>

          <div className="card-foot">
            <div style={{ fontSize: 12.5, color: 'var(--ink-500)' }}>
              <IconInfo size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
              Estado al confirmar: <Badge estado="PENDIENTE" />
            </div>
            <button className="btn btn-primary btn-lg" disabled={!canSubmit || submitting} onClick={handleSubmit}>
              {submitting
                ? <><IconLoad size={14} style={{ animation: 'spin 1s linear infinite' }} /> Procesando…</>
                : <><IconCheck size={14} /> Confirmar reserva</>}
            </button>
          </div>
        </div>

        {/* ===== Resumen lateral ===== */}
        <SummarySidebar
          cliente={clienteSeleccionado}
          experiencia={expSeleccionada}
          fechaExperiencia={fechaExperiencia}
          cantidadPersonas={cantidadPersonas}
          total={total}
        />
      </div>

      {success && <ReservaSuccessModal reserva={success} onClose={reset} />}
    </>
  )
}

// ---- Subcomponentes ----

function Section({ step, title, desc, children }) {
  return (
    <div className="form-section">
      <div className="fs-label">
        <div className="step">{step}</div>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
      <div className="fs-body">{children}</div>
    </div>
  )
}

export function Badge({ estado }) {
  const map = {
    ACTIVO:     { cls: 'badge-success', label: 'Activo' },
    INACTIVO:   { cls: 'badge-danger',  label: 'Inactivo' },
    DISPONIBLE: { cls: 'badge-success', label: 'Disponible' },
    AGOTADA:    { cls: 'badge-danger',  label: 'Agotada' },
    SUSPENDIDA: { cls: 'badge-warn',    label: 'Suspendida' },
    PENDIENTE:  { cls: 'badge-pending', label: 'Pendiente' },
    CONFIRMADA: { cls: 'badge-success', label: 'Confirmada' },
    CANCELADA:  { cls: 'badge-neutral', label: 'Cancelada' },
  }
  const m = map[estado] || { cls: 'badge-neutral', label: estado }
  return <span className={'badge ' + m.cls}><span className="dot" />{m.label}</span>
}

export function InlineMsg({ kind = 'error', code, children }) {
  return (
    <div className={'inline-msg is-' + kind} role="alert">
      <IconAlert size={14} />
      <div>
        {code && <span className="code">{code}</span>} {children}
      </div>
    </div>
  )
}

function EmptyHint({ icon, text }) {
  return (
    <div className="empty-state">
      {icon}
      <div style={{ marginTop: 6 }}>{text}</div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="entity-card" style={{ background: '#fff' }}>
      <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 10 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 14, width: '50%' }} />
        <div className="skeleton" style={{ height: 11, width: '75%' }} />
        <div className="skeleton" style={{ height: 11, width: '35%' }} />
      </div>
    </div>
  )
}

function SummarySidebar({ cliente, experiencia, fechaExperiencia, cantidadPersonas, total }) {
  const fechaTxt = fechaExperiencia
    ? fmtFechaLarga(fechaExperiencia)
    : '—'
  return (
    <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 24 }}>
      <div className="card-head" style={{ padding: '16px 20px' }}>
        <h3 className="card-title" style={{ fontSize: 14 }}>Resumen de la reserva</h3>
        <IconReceipt size={14} style={{ color: 'var(--ink-400)' }} />
      </div>
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SumLine k="Cliente"
          v={cliente ? `${cliente.nombre} ${cliente.apellido}` : '—'}
          sub={cliente ? `CC ${cliente.documento}` : null} />
        <SumLine k="Experiencia"
          v={experiencia ? experiencia.nombre : '—'}
          sub={experiencia ? experiencia.ubicacion : null} />
        <SumLine k="Fecha experiencia" v={fechaTxt} />
        <SumLine k="Personas"
          v={cantidadPersonas ? `${cantidadPersonas} ${cantidadPersonas == 1 ? 'persona' : 'personas'}` : '—'} />
        <div style={{ height: 1, background: 'var(--ink-200)' }} />
        <div className="receipt-total">
          <span className="k">Total</span>
          <span className="v">{fmtCOP(total)}</span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-400)', lineHeight: 1.4 }}>
          <IconInfo size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />
          La reserva quedará en estado <b>PENDIENTE</b> hasta su confirmación.
        </div>
      </div>
    </div>
  )
}

function SumLine({ k, v, sub }) {
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 3 }}>{k}</div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-900)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{v}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 1 }}>{sub}</div>}
    </div>
  )
}

function ReservaSuccessModal({ reserva, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-check"><IconCheck size={22} /></div>
          <div className="eyebrow">Reserva creada</div>
          <h2>¡Reserva registrada con éxito!</h2>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>Código</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{reserva.codigo}</span>
          </div>
          <div className="receipt-row"><span className="k">Cliente</span><span className="v">{reserva.clienteNombre}</span></div>
          <div className="receipt-row"><span className="k">Experiencia</span><span className="v">{reserva.experienciaNombre}</span></div>
          <div className="receipt-row">
            <span className="k">Fecha de la experiencia</span>
            <span className="v">{reserva.fechaExperiencia ? fmtFechaCorta(reserva.fechaExperiencia) : '—'}</span>
          </div>
          <div className="receipt-row"><span className="k">Cantidad de personas</span><span className="v">{reserva.cantidadPersonas}</span></div>
          <div className="receipt-row"><span className="k">Estado</span><span className="v"><Badge estado={reserva.estado} /></span></div>
          <div className="receipt-total" style={{ marginTop: 14 }}>
            <span className="k">Total</span>
            <span className="v">{fmtCOP(reserva.total)}</span>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={onClose}><IconPlus size={14} /> Nueva reserva</button>
        </div>
      </div>
    </div>
  )
}
