'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function NovoTenantPage() {
  const router = useRouter()

  const [nomeConsultorio, setNomeConsultorio] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [whatsappConsultorio, setWhatsappConsultorio] = useState('')
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [whatsappResponsavel, setWhatsappResponsavel] = useState('')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [senhaGerada, setSenhaGerada] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [copiado, setCopiado] = useState(false)

  async function handleCriar() {
    setErro('')

    if (!nomeConsultorio || !especialidade || !whatsappConsultorio || !nomeResponsavel || !whatsappResponsavel || !email) {
      setErro('Preencha todos os campos.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nomeConsultorio, plano: 'essencial', email, especialidade, whatsappConsultorio, nomeResponsavel, whatsappResponsavel }),
    })

    const data = await res.json()

    if (!res.ok) {
      setErro(data.error || 'Erro ao criar tenant.')
      setLoading(false)
      return
    }

    setSenhaGerada(data.senha)
    setLoading(false)
  }

  function handleCopiar() {
    navigator.clipboard.writeText(`E-mail: ${email}\nSenha: ${senhaGerada}`)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function handleBaixarTxt() {
    const conteudo = `Cliniq — Dados de Acesso\n=============================\nConsultório: ${nomeConsultorio}\nE-mail: ${email}\nSenha temporária: ${senhaGerada}\n\nAcesse: ${window.location.origin}/login\n\nAtenção: troque sua senha no primeiro acesso.`
    const blob = new Blob([conteudo], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `acesso-${nomeConsultorio.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (senhaGerada) {
    return (
      <div className="max-w-md">
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--cliniq-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ color: 'var(--brand)', fontSize: 20 }}>✓</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Acesso criado com sucesso!</h1>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Credenciais de acesso do cliente:</p>
          </div>

          <div style={{ background: 'var(--surface-app)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <p style={{ ...labelStyle, marginBottom: 2 }}>E-mail</p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>{email}</p>
            </div>
            <div>
              <p style={{ ...labelStyle, marginBottom: 2 }}>Senha temporária</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', flex: 1, color: 'var(--text-body)' }}>
                  {mostrarSenha ? senhaGerada : '••••••••••'}
                </p>
                <Button variant="secondary" size="sm" onClick={() => setMostrarSenha(!mostrarSenha)}>
                  {mostrarSenha ? 'Ocultar' : 'Ver'}
                </Button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Button variant="secondary" onClick={handleCopiar} style={{ flex: 1 }}>
              {copiado ? 'Copiado!' : 'Copiar credenciais'}
            </Button>
            <Button variant="secondary" onClick={handleBaixarTxt} style={{ flex: 1 }}>
              Baixar .txt
            </Button>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', textAlign: 'center', marginBottom: 16 }}>
            Um e-mail com as credenciais foi enviado para o cliente.
          </p>

          <Button onClick={() => router.push('/admin')} style={{ width: '100%' }}>
            Voltar para a lista
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md">
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" className="text-sm hover:opacity-70" style={{ color: 'var(--brand)' }}>← Voltar</Link>
        <h1 style={{ margin: '8px 0 0', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Novo acesso</h1>
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
            <input type="text" value={nomeConsultorio} onChange={e => setNomeConsultorio(e.target.value)} placeholder="Ex: Clínica Dra. Ana" style={inputStyle} />
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

      <Card title="Dados do responsável" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nome do responsável</label>
            <input type="text" value={nomeResponsavel} onChange={e => setNomeResponsavel(e.target.value)} placeholder="Ex: Dra. Ana Silva" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp do responsável</label>
            <PhoneInput value={whatsappResponsavel} onChange={setWhatsappResponsavel} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>E-mail de acesso</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="cliente@email.com" style={inputStyle} />
          </div>
        </div>
      </Card>

      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', marginBottom: 16 }}>
        Uma senha temporária será gerada e enviada por e-mail automaticamente.
      </p>

      <Button onClick={handleCriar} disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Criando...' : 'Criar acesso'}
      </Button>
    </div>
  )
}