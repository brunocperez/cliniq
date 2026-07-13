interface Consulta {
  id: string
  scheduled_at: string
  status: string
  patients: { name: string | null } | null
}

interface Props {
  consultas: Consulta[]
  dataAtual: Date
}

function getInicioDaSemana(data: Date) {
  const d = new Date(data)
  d.setDate(d.getDate() - d.getDay())
  return d
}

export default function AgendaSemanal({ consultas, dataAtual }: Props) {
  const inicio = getInicioDaSemana(dataAtual)
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: '1px solid var(--border-divider)' }}>
      {dias.map((dia, i) => {
        const consultasDia = consultas.filter(c =>
          new Date(c.scheduled_at).toDateString() === dia.toDateString()
        )
        const hoje = dia.toDateString() === new Date().toDateString()

        return (
          <div key={i} style={{ minHeight: 128, borderRight: i < 6 ? '1px solid var(--border-divider)' : 'none' }}>
            <div style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid var(--border-divider)', background: hoje ? 'var(--cliniq-50)' : 'transparent' }}>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {dia.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: hoje ? 'var(--brand)' : 'var(--text-body)' }}>
                {dia.getDate()}
              </p>
            </div>
            <div style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {consultasDia.map(c => (
                
                <a
                  key={c.id}
                  href={`/dashboard/agenda/${c.id}`}
                  style={{ fontSize: 11, padding: '4px 6px', borderRadius: 6, background: `var(--${c.status}-fill)`, color: `var(--${c.status}-ink)`, display: 'block' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <p style={{ margin: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.patients?.name ?? 'Paciente'}
                  </p>
                  <p style={{ margin: 0 }}>
                    {new Date(c.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}