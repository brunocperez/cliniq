interface Props {
  children: React.ReactNode
  title?: string
  action?: React.ReactNode
  padded?: boolean
  style?: React.CSSProperties
}

export default function Card({ children, title, action, padded = true, style }: Props) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-divider)',
          }}
        >
          {title && (
            <h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
              {title}
            </h2>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={padded ? { padding: '20px' } : {}}>
        {children}
      </div>
    </div>
  )
}