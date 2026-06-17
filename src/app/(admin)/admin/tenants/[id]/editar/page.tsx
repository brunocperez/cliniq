'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import PhoneInput from '@/components/ui/PhoneInput'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const especialidades = [
  'Odontologia', 'Psicologia', 'Fisioterapia', 'Nutrição', 'Fonoaudiologia',
  'Dermatologia', 'Cardiologia', 'Ortopedia', 'Ginecologia', 'Pediatria',
  'Clínica Geral', 'Outra',
]

const inputStyle = {
  width: '100%',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  padding: '8px 12px',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  boxSizing: 'border-box' as const,
  color: 'var(--text-body)',
  background: 'var(--surface-card)',
}

const labelStyle = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  color: 'var(--text-muted)',
  marginBottom: 4,
}

export default function EditarTenantPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [nomeConsultorio, setNomeConsultorio] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [whatsappConsultorio, setWhatsappConsultorio] = useState('')
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [whatsappResponsavel, setWhatsappResponsavel] = useState('')
  const [profileId, setProfileId] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function carregar() {
      const res = await fetch(`/api/tenants/${id}`)
      const data = await res.json()

      setNomeConsultorio(data.tenant?.name ?? '')
      setEspecialidade(data.tenant?.specialty ?? '')
      setWhatsappConsultorio(data.tenant?.whatsapp_consultorio ?? '')
      setNomeResponsavel(data.profile?.responsible_name ?? '')
      setWhatsappResponsavel(data.profile?.whatsapp_responsavel ?? '')
      setProfileId(data.profile?.id ?? '')
    }

    carregar()
  }, [id])

  async function handleSalvar() {
    setErro('')
    setLoading(true)

    const res = await fetch(`/api/tenants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomeConsultorio, especialidade, whatsappConsultorio, nomeResponsavel, whatsappResponsavel, profileId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setErro(data.error || 'Erro ao salvar.')
      setLoading(false)
      return
    }

    router.push(`/admin/tenants/${id}`)
  }

  return (
    <div className="max-w-lg">
      <div style={{ marginBottom: 24 }}>
        <Link href={`/admin/tenants/${id}`} className="text-sm hover:opacity-70" style={{ color: 'var(--brand)' }}>← Voltar</Link>
        <h1 style={{ margin: '8px 0 0', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Editar tenant</h1>
      </div>

      {erro && (
        <div style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', color: 'var(--danger-600)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
          {erro}
        </div>
      )}

      <Card title="Dados do consultório" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nome do consultório</label>
            <input type="text" value={nomeConsultorio} onChange={e => setNomeConsultorio(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Especialidade</label>
            <select value={especialidade} onChange={e => setEspecialidade(e.target.value)} style={inputStyle}>
              <option value="">Selecione uma especialidade</option>
              {especialidades.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>WhatsApp do consultório</label>
            <PhoneInput value={whatsappConsultorio} onChange={setWhatsappConsultorio} style={inputStyle} />
          </div>
        </div>
      </Card>

      <Card title="Dados do responsável" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nome do responsável</label>
            <input type="text" value={nomeResponsavel} onChange={e => setNomeResponsavel(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp do responsável</label>
            <PhoneInput value={whatsappResponsavel} onChange={setWhatsappResponsavel} style={inputStyle} />
          </div>
        </div>
      </Card>

      <Button onClick={handleSalvar} disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </div>
  )
}