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

const SEMANAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function AgendaMensal({ consultas, dataAtual }: Props) {
  const inicioMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1)
  const diasNoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).getDate()
  const primeiroDiaSemana = inicioMes.getDay()

  const celulas = Array.from({ length: primeiroDiaSemana + diasNoMes }, (_, i) => {
    if (i < primeiroDiaSemana) return null
    return new Date(dataAtual.getFullYear(), dataAtual.getMonth(), i - primeiroDiaSemana + 1)
  })

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-divider)' }}>
        {SEMANAS.map(s => (
          <div key={s} style={{ padding: 8, textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>
            {s}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {celulas.map((dia, i) => {
          if (!dia) return (
            <div key={i} style={{ minHeight: 80, background: 'var(--surface-app)', borderRight: '1px solid var(--border-divider)', borderBottom: '1px solid var(--border-divider)' }} />
          )

          const consultasDia = consultas.filter(c =>
            new Date(c.scheduled_at).toDateString() === dia.toDateString()
          )
          const hoje = dia.toDateString() === new Date().toDateString()

          return (
            <div key={i} style={{ minHeight: 80, padding: 4, borderRight: '1px solid var(--border-divider)', borderBottom: '1px solid var(--border-divider)' }}>
              <p style={{
                margin: '0 0 4px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)',
                width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', background: hoje ? 'var(--brand)' : 'transparent',
                color: hoje ? 'white' : 'var(--text-body)'
              }}>
                {dia.getDate()}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {consultasDia.slice(0, 2).map(c => (
                  
                  <a
                    key={c.id}
                    href={`/dashboard/agenda/${c.id}`}
                    style={{ fontSize: 10, padding: '2px 4px', borderRadius: 4, background: `var(--${c.status}-fill)`, color: `var(--${c.status}-ink)`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
                  >
                    {c.patients?.name ?? 'Paciente'}
                  </a>
                ))}
                {consultasDia.length > 2 && (
                  <p style={{ margin: 0, fontSize: 10, color: 'var(--text-faint)' }}>+{consultasDia.length - 2}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}