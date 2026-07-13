'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import PhoneInput from '@/components/ui/PhoneInput'
import PasswordInput, { senhaValida } from '@/components/ui/PasswordInput'
import { inputStyle, labelStyle } from '@/lib/styles'

export default function CadastroPage() {
  const router = useRouter()

  const [nomeConsultorio, setNomeConsultorio] = useState('')
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [whatsappResponsavel, setWhatsappResponsavel] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCadastrar() {
    setErro('')

    if (!nomeConsultorio || !nomeResponsavel || !whatsappResponsavel || !email) {
      setErro('Preencha todos os campos.')
      return
    }

    if (!senhaValida(senha)) {
      setErro('A senha não atende aos requisitos mínimos.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomeConsultorio, nomeResponsavel, whatsappResponsavel, email, senha }),
    })

    const data = await res.json()

    if (!res.ok) {
      setErro(data.error || 'Erro ao criar conta.')
      setLoading(false)
      return
    }

    router.push('/login?cadastro=sucesso')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-app)', padding: 16 }}>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 420 }}>

        <div style={{ marginBottom: 24 }}>
          <Image src="/logo.svg" alt="Cliniq" width={120} height={36} />
        </div>

        <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
          Crie sua conta gratuita
        </h1>
        <p style={{ margin: '4px 0 24px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          30 dias grátis para testar o Cliniq na sua clínica odontológica.
        </p>

        {erro && (
          <div style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', color: 'var(--danger-600)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
            {erro}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nome da clínica</label>
            <input type="text" value={nomeConsultorio} onChange={e => setNomeConsultorio(e.target.value)} placeholder="Ex: Clínica Odontológica Sorriso" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Seu nome</label>
            <input type="text" value={nomeResponsavel} onChange={e => setNomeResponsavel(e.target.value)} placeholder="Ex: Dr. João Silva" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>WhatsApp</label>
            <PhoneInput value={whatsappResponsavel} onChange={setWhatsappResponsavel} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" style={inputStyle} />
          </div>

          <div>
            <PasswordInput label="Senha" value={senha} onChange={setSenha} />
          </div>

          <Button onClick={handleCadastrar} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Criando conta...' : 'Começar agora'}
          </Button>

          <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Já tem conta?{' '}
            <Link href="/login" style={{ color: 'var(--brand)' }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}