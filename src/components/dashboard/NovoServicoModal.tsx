'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { inputStyle, labelStyle } from '@/lib/styles'
import { useToast } from '@/components/ui/ToastProvider'

// Os 6 status de dente, pra popular o seletor de "status aplicado"
const STATUS_OPCOES = [
  { value: 'higido', label: 'Hígido' },
  { value: 'cariado', label: 'Cariado' },
  { value: 'restaurado', label: 'Restaurado' },
  { value: 'ausente', label: 'Ausente' },
  { value: 'implante', label: 'Implante' },
  { value: 'canal', label: 'Canal' },
]

// Tipo do serviço que o modal edita (quando vem preenchido = modo edição)
export interface ServicoEditavel {
  id: string
  name: string
  duration_minutes: number
  price: number | null
  categoria: 'diagnostico' | 'tratamento'
  descricao: string | null
  status_aplicado: string | null
}

interface Props {
  onFechar: () => void
  servico?: ServicoEditavel   // se vier, o modal abre em modo edição
}

export default function NovoServicoModal({ onFechar, servico }: Props) {
  const router = useRouter()
  const editando = !!servico

  // Estados — se estiver editando, começam com os valores do serviço
  const [nome, setNome] = useState(servico?.name ?? '')
  const [duracao, setDuracao] = useState(String(servico?.duration_minutes ?? 60))
  const [preco, setPreco] = useState(servico?.price != null ? String(servico.price) : '')
  const [categoria, setCategoria] = useState<'diagnostico' | 'tratamento'>(servico?.categoria ?? 'tratamento')
  const [descricao, setDescricao] = useState(servico?.descricao ?? '')
  const [statusAplicado, setStatusAplicado] = useState(servico?.status_aplicado ?? '')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { mostrarToast } = useToast()

  async function handleSalvar() {
    setErro('')
    if (!nome) {
      setErro('O nome do serviço é obrigatório.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Monta os campos comuns a criar e editar
    const dados = {
      name: nome,
      duration_minutes: parseInt(duracao) || 60,
      price: preco ? parseFloat(preco) : null,
      categoria,
      descricao: descricao || null,
      // status_aplicado só faz sentido em tratamento; em diagnóstico salva null
      status_aplicado: categoria === 'tratamento' && statusAplicado ? statusAplicado : null,
    }

    let error
    if (editando) {
      // Modo edição: atualiza o serviço existente
      const res = await supabase.from('services').update(dados).eq('id', servico!.id)
      error = res.error
    } else {
      // Modo criação: precisa do tenant_id
      const { data: profile } = await supabase.from('profiles').select('tenant_id').single()
      const res = await supabase.from('services').insert({ ...dados, tenant_id: profile?.tenant_id })
      error = res.error
    }

    if (error) {
      setErro('Erro ao salvar serviço.')
      mostrarToast('Erro ao salvar serviço.')
      setLoading(false)
      return
    }

    mostrarToast(editando ? 'Serviço atualizado.' : 'Serviço criado.', 'sucesso')
    router.refresh()
    onFechar()
  }

  return (
    <Modal titulo={editando ? 'Editar serviço' : 'Novo serviço'} onFechar={onFechar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {erro && (
          <div style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', color: 'var(--danger-600)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)' }}>
            {erro}
          </div>
        )}

        {/* Nome */}
        <div>
          <label style={labelStyle}>Nome do serviço</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Consulta inicial" style={inputStyle} />
        </div>

        {/* Categoria (modo padrão) */}
        <div>
          <label style={labelStyle}>Tipo do serviço</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {([
              { value: 'diagnostico' as const, label: 'Diagnóstico', desc: 'Avaliar e marcar problemas' },
              { value: 'tratamento' as const, label: 'Tratamento', desc: 'Registrar procedimento feito' },
            ]).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCategoria(opt.value)}
                style={{
                  flex: 1, textAlign: 'left', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${categoria === opt.value ? 'var(--brand)' : 'var(--border-default)'}`,
                  background: categoria === opt.value ? 'var(--cliniq-50)' : 'var(--surface-card)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                }}
              >
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: categoria === opt.value ? 'var(--brand)' : 'var(--text-strong)' }}>{opt.label}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Status aplicado — só aparece se for tratamento */}
        {categoria === 'tratamento' && (
          <div>
            <label style={labelStyle}>Status aplicado no dente ao concluir (opcional)</label>
            <select value={statusAplicado} onChange={e => setStatusAplicado(e.target.value)} style={inputStyle}>
              <option value="">Nenhum (dentista escolhe na hora)</option>
              {STATUS_OPCOES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Duração e valor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Duração (minutos)</label>
            <input type="number" value={duracao} onChange={e => setDuracao(e.target.value)} placeholder="60" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Valor (R$)</label>
            <input type="number" value={preco} onChange={e => setPreco(e.target.value)} placeholder="150.00" style={inputStyle} />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label style={labelStyle}>Descrição (opcional)</label>
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Detalhes do procedimento, materiais, observações..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant="secondary" onClick={onFechar}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar serviço'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}