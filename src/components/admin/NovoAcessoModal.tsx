'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import PhoneInput from '@/components/ui/PhoneInput'
import { inputStyle, labelStyle } from '@/lib/styles'

interface Props {
  onFechar: () => void
}

export default function NovoAcessoModal({ onFechar }: Props) {
  const router = useRouter()
  const [nomeConsultorio, setNomeConsultorio] = useState('')
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState<{ senha: string } | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function handleCriar() {
    setErro('')

    if (!nomeConsultorio || !nomeResponsavel || !email) {
      setErro('Preencha todos os campos.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nomeConsultorio,
        plano: 'trial',
        email,
        especialidade: 'Odontologia',
        whatsappConsultorio: '',
        nomeResponsavel,
        whatsappResponsavel: '',
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setErro(data.error || 'Erro ao criar acesso.')
      setLoading(false)
      return
    }

    setSucesso({ senha: data.senha })
    setLoading(false)
    router.refresh()
  }

  function handleCopiar() {
    navigator.clipboard.writeText(`E-mail: ${email}\nSenha: ${sucesso?.senha}`)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (sucesso) {
    return (
      <Modal titulo="Acesso criado" onFechar={onFechar}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--cliniq-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <span style={{ color: 'var(--brand)', fontSize: 20 }}>✓</span>
            </div>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
              {nomeConsultorio} criado com sucesso!
            </p>
          </div>

          <div style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 16 }}>
            <div style={{ marginBottom: 10 }}>
              <p style={{ margin: '0 0 2px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>E-mail</p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-strong)', fontWeight: 'var(--weight-medium)' }}>{email}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Senha temporária</p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-strong)', fontFamily: 'var(--font-mono)', fontWeight: 'var(--weight-medium)' }}>{sucesso.senha}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={handleCopiar} style={{ flex: 1 }}>
              {copiado ? 'Copiado!' : 'Copiar credenciais'}
            </Button>
            <Button onClick={onFechar} style={{ flex: 1 }}>Fechar</Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal titulo="Novo acesso" onFechar={onFechar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {erro && (
          <div style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', color: 'var(--danger-600)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)' }}>
            {erro}
          </div>
        )}

        <div>
          <label style={labelStyle}>Nome da clínica</label>
          <input type="text" value={nomeConsultorio} onChange={e => setNomeConsultorio(e.target.value)} placeholder="Ex: Clínica Dr. João" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Nome do responsável</label>
          <input type="text" value={nomeResponsavel} onChange={e => setNomeResponsavel(e.target.value)} placeholder="Ex: Dr. João Silva" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>E-mail de acesso</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="clinica@email.com" style={inputStyle} />
        </div>

        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
          Uma senha temporária será gerada automaticamente.
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onFechar}>Cancelar</Button>
          <Button onClick={handleCriar} disabled={loading}>
            {loading ? 'Criando...' : 'Criar acesso'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}