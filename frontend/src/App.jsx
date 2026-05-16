import React, { useState } from 'react'
import NuevaReserva from './screens/NuevaReserva.jsx'
import Clientes from './screens/Clientes.jsx'
import { IconCal, IconUsers } from './icons.jsx'

export default function App() {
  const [tab, setTab] = useState('reserva')
  const [toasts, setToasts] = useState([])

  const pushToast = (kind, text) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, kind, text }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white"
                 strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l6-12 4 8 3-5 5 9z" />
              <circle cx="17" cy="6" r="2" />
            </svg>
          </div>
          <div className="sb-brand-text">
            <div className="t1">Turismo Rural</div>
            <div className="t2">Eje Cafetero · CO</div>
          </div>
        </div>

        <div>
          <div className="sb-section-label">Operación</div>
          <nav className="sb-nav">
            <button
              className={'sb-link ' + (tab === 'reserva' ? 'active' : '')}
              onClick={() => setTab('reserva')}
            >
              <IconCal size={16} /> Nueva reserva
            </button>
            <button
              className={'sb-link ' + (tab === 'clientes' ? 'active' : '')}
              onClick={() => setTab('clientes')}
            >
              <IconUsers size={16} /> Clientes
            </button>
          </nav>
        </div>

        <div className="sb-foot">
          <div className="sb-avatar">OP</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 12.5 }}>Operador</div>
            <div>Sistema · Salento</div>
          </div>
        </div>
      </aside>

      <main className="main">
        {tab === 'reserva' && <NuevaReserva pushToast={pushToast} />}
        {tab === 'clientes' && <Clientes pushToast={pushToast} />}
      </main>

      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast is-${t.kind}`}>
            <span className="dot" />
            {t.text}
          </div>
        ))}
      </div>
    </div>
  )
}
