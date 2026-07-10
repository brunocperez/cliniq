'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Sun, Moon } from 'lucide-react'

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb)
  return () => window.removeEventListener('storage', cb)
}

function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isClient = useIsClient()

  if (!isClient) return <div style={{ width: 34, height: 34 }} />

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{
        width: 34,
        height: 34,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        background: 'var(--surface-card)',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 120ms ease, color 120ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--surface-sunken)'
        e.currentTarget.style.color = 'var(--text-body)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--surface-card)'
        e.currentTarget.style.color = 'var(--text-muted)'
      }}
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}