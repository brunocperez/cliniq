export interface Paciente {
  name: string | null
}

export interface Servico {
  id: string
  name: string
}

export interface Consulta {
  id: string
  scheduled_at: string
  status: string
  notes: string | null
  archived: boolean
  patients: Paciente | null
  services: Servico | null
}

export type Visualizacao = 'lista' | 'semanal' | 'mensal'
export type Filtro = 'todos' | 'agendado' | 'confirmado' | 'realizado' | 'faltou' | 'cancelado'