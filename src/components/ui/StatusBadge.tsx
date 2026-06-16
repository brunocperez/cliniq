interface Props {
  status: 'agendado' | 'confirmado' | 'realizado' | 'faltou' | 'cancelado'
  children?: React.ReactNode
}

const MAP = {
  agendado:   { fill: 'var(--agendado-fill)',   ink: 'var(--agendado-ink)' },
  confirmado: { fill: 'var(--confirmado-fill)', ink: 'var(--confirmado-ink)' },
  realizado:  { fill: 'var(--realizado-fill)',  ink: 'var(--realizado-ink)' },
  faltou:     { fill: 'var(--faltou-fill)',     ink: 'var(--faltou-ink)' },
  cancelado:  { fill: 'var(--cancelado-fill)',  ink: 'var(--cancelado-ink)' },
}

export default function StatusBadge({ status, children }: Props) {
  const s = MAP[status] ?? MAP.agendado

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-medium)',
        padding: '2px 8px',
        borderRadius: 'var(--radius-pill)',
        background: s.fill,
        color: s.ink,
        lineHeight: 1.5,
      }}
    >
      {children ?? status}
    </span>
  )
}