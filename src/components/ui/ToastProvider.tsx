'use client'
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ToastTipo = 'erro' | 'sucesso'

interface Toast {
  id: number
  tipo: ToastTipo
  mensagem: string
}

interface ToastContextValue {
  mostrarToast: (mensagem: string, tipo?: ToastTipo) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// Hook que qualquer componente usa pra disparar um toast
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const mostrarToast = useCallback((mensagem: string, tipo: ToastTipo = 'erro') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, tipo, mensagem }])
    // Some sozinho depois de 4 segundos
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  function fechar(id: number) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      {/* Área dos toasts — canto inferior direito */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
        {toasts.map(t => {
          const cor = t.tipo === 'erro' ? '#dc2626' : '#16a34a'
          const fundo = t.tipo === 'erro' ? '#fef2f2' : '#f0fdf4'
          return (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                borderRadius: 'var(--radius-md, 8px)', border: `1px solid ${cor}`,
                background: fundo, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                animation: 'toast-entrar 200ms ease',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: cor, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: '#1f2937', fontFamily: 'var(--font-sans)' }}>{t.mensagem}</span>
              <button
                onClick={() => fechar(t.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 18, lineHeight: 1, padding: 0 }}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}