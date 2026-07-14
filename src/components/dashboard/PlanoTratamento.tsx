'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DenteData } from '@/components/dashboard/Odontograma'

type StatusItem = 'planejado' | 'andamento' | 'concluido'

interface Servico {
  id: string
  name: string
  price: number
}

interface ItemPlano {
  id: string
  service_id: string
  dentes: number[]
  status: StatusItem
  ordem: number
  valor_estimado: number | null
  criado_em: string
  concluido_em: string | null
  services: { name: string; price: number } | null
}

const STATUS_ITEM_CONFIG: Record<StatusItem, { label: string; cor: string }> = {
  planejado: { label: 'Planejado', cor: '#6b7280' },
  andamento: { label: 'Em andamento', cor: '#eab308' },
  concluido: { label: 'Concluído', cor: '#16a34a' },
}

// -----------------------------------------------------------------------
// Ao concluir um item, esta é a face + status aplicado automaticamente
// em cada dente do item no odontograma. Ajuste aqui se quiser outro padrão.
// -----------------------------------------------------------------------
const FACE_AO_CONCLUIR = 'oclusal'
const STATUS_AO_CONCLUIR = 'restaurado'

interface Props {
  pacienteId: string
}

export default function PlanoTratamento({ pacienteId }: Props) {
  const [itens, setItens] = useState<ItemPlano[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  // Form de novo item
  const [novoServicoId, setNovoServicoId] = useState('')
  const [novoDentes, setNovoDentes] = useState('')
  const [novoValor, setNovoValor] = useState('')

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      setCarregando(true)
      const supabase = createClient()
      const [{ data: itensData }, { data: servicosData }] = await Promise.all([
        supabase
          .from('plano_tratamento_itens')
          .select('*, services(name, price)')
          .eq('patient_id', pacienteId)
          .order('ordem', { ascending: true }),
        supabase
          .from('services')
          .select('id, name, price')
          .order('name', { ascending: true }),
      ])
      if (!cancelado) {
        if (itensData) setItens(itensData as ItemPlano[])
        if (servicosData) setServicos(servicosData as Servico[])
        setCarregando(false)
      }
    }
    carregar()
    return () => { cancelado = true }
  }, [pacienteId])

  function parseDentes(texto: string): number[] {
    return texto
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n >= 11 && n <= 48)
  }

  async function handleAdicionarItem() {
    const dentes = parseDentes(novoDentes)
    if (!novoServicoId || dentes.length === 0) return
    setSalvando(true)
    const supabase = createClient()
    const servico = servicos.find(s => s.id === novoServicoId)
    const proximaOrdem = itens.length > 0 ? Math.max(...itens.map(i => i.ordem)) + 1 : 0
    const { data, error } = await supabase
      .from('plano_tratamento_itens')
      .insert({
        patient_id: pacienteId,
        service_id: novoServicoId,
        dentes,
        status: 'planejado',
        ordem: proximaOrdem,
        valor_estimado: novoValor ? parseFloat(novoValor) : (servico?.price ?? null),
      })
      .select('*, services(name, price)')
      .single()
    if (!error && data) {
      setItens(prev => [...prev, data as ItemPlano])
      setNovoServicoId('')
      setNovoDentes('')
      setNovoValor('')
    }
    setSalvando(false)
  }

  async function handleMudarStatus(item: ItemPlano, novoStatus: StatusItem) {
    setSalvando(true)
    const supabase = createClient()
    const patch: { status: StatusItem; concluido_em: string | null } = {
      status: novoStatus,
      concluido_em: novoStatus === 'concluido' ? new Date().toISOString() : null,
    }
    const { error } = await supabase
      .from('plano_tratamento_itens')
      .update(patch)
      .eq('id', item.id)

    if (!error) {
      setItens(prev => prev.map(i => (i.id === item.id ? { ...i, ...patch } : i)))

      // Integração: ao concluir, aplica o status no odontograma de cada dente do item
      if (novoStatus === 'concluido') {
        const { data: paciente } = await supabase
          .from('patients')
          .select('odontograma')
          .eq('id', pacienteId)
          .single()
        const odontogramaAtual = (paciente?.odontograma as Record<string, DenteData>) ?? {}
        const novoOdontograma = { ...odontogramaAtual }
        for (const dente of item.dentes) {
          novoOdontograma[dente] = { ...novoOdontograma[dente], [FACE_AO_CONCLUIR]: STATUS_AO_CONCLUIR }
        }
        await supabase.from('patients').update({ odontograma: novoOdontograma }).eq('id', pacienteId)

        // Registra também no histórico do odontograma, pra manter rastreabilidade
        for (const dente of item.dentes) {
          await supabase.from('odontograma_historico').insert({
            patient_id: pacienteId,
            dente,
            campo: 'status',
            face: FACE_AO_CONCLUIR,
            valor_anterior: odontogramaAtual[dente]?.[FACE_AO_CONCLUIR] ?? null,
            valor_novo: STATUS_AO_CONCLUIR,
          })
        }
      }
    }
    setSalvando(false)
  }

  async function handleExcluirItem(item: ItemPlano) {
    setSalvando(true)
    const supabase = createClient()
    const { error } = await supabase.from('plano_tratamento_itens').delete().eq('id', item.id)
    if (!error) setItens(prev => prev.filter(i => i.id !== item.id))
    setSalvando(false)
  }

  const valorTotal = itens.reduce((soma, i) => soma + (i.valor_estimado ?? 0), 0)
  const valorConcluido = itens.filter(i => i.status === 'concluido').reduce((soma, i) => soma + (i.valor_estimado ?? 0), 0)

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Plano de Tratamento</h2>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Total estimado: R$ {valorTotal.toFixed(2)} · Já concluído: R$ {valorConcluido.toFixed(2)}
          </p>
        </div>
        {salvando && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Salvando...</span>}
      </div>

      {/* Lista de itens */}
      <div style={{ padding: '16px 20px' }}>
        {carregando ? (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Carregando...</p>
        ) : itens.length === 0 ? (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Nenhum item no plano de tratamento ainda</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {itens.map(item => {
              const cfg = STATUS_ITEM_CONFIG[item.status]
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '10px 14px', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-default)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-strong)', fontWeight: 500 }}>
                      {item.services?.name ?? 'Serviço removido'}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · Dente(s) {item.dentes.join(', ')}</span>
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      R$ {(item.valor_estimado ?? 0).toFixed(2)}
                    </p>
                  </div>

                  <select
                    value={item.status}
                    onChange={e => handleMudarStatus(item, e.target.value as StatusItem)}
                    style={{
                      fontSize: 'var(--text-xs)', padding: '4px 8px', borderRadius: 'var(--radius-pill)',
                      border: `1px solid ${cfg.cor}`, color: cfg.cor, background: 'transparent', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {Object.entries(STATUS_ITEM_CONFIG).map(([key, c]) => (
                      <option key={key} value={key}>{c.label}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleExcluirItem(item)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-600)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-sans)' }}
                  >
                    Remover
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Adicionar novo item */}
      <div style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--border-divider)', background: 'var(--surface-sunken)' }}>
        <p style={{ margin: '0 0 10px', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Adicionar item</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <select
            value={novoServicoId}
            onChange={e => {
              setNovoServicoId(e.target.value)
              const s = servicos.find(sv => sv.id === e.target.value)
              if (s) setNovoValor(String(s.price))
            }}
            style={{ fontSize: 'var(--text-xs)', padding: '6px 10px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-default)', fontFamily: 'var(--font-sans)', minWidth: 180 }}
          >
            <option value="">Selecione o serviço...</option>
            {servicos.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Dente(s), ex: 16, 17"
            value={novoDentes}
            onChange={e => setNovoDentes(e.target.value)}
            style={{ fontSize: 'var(--text-xs)', padding: '6px 10px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-default)', fontFamily: 'var(--font-sans)', width: 140 }}
          />

          <input
            type="number"
            placeholder="Valor (R$)"
            value={novoValor}
            onChange={e => setNovoValor(e.target.value)}
            style={{ fontSize: 'var(--text-xs)', padding: '6px 10px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-default)', fontFamily: 'var(--font-sans)', width: 110 }}
          />

          <button
            onClick={handleAdicionarItem}
            disabled={!novoServicoId || parseDentes(novoDentes).length === 0}
            style={{
              fontSize: 'var(--text-xs)', padding: '6px 16px', borderRadius: 'var(--radius-pill)', border: 'none',
              background: 'var(--brand)', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              opacity: (!novoServicoId || parseDentes(novoDentes).length === 0) ? 0.5 : 1,
            }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}