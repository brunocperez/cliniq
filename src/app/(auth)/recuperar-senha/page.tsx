'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { inputStyle, labelStyle } from '@/lib/styles'

export default function RecuperarSenhaPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEnviar() {
    setErro('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/atualizar-senha`,
    })

    if (error) {
      setErro('Não foi possível enviar o e-mail. Verifique o endereço digitado.')
      setLoading(false)
      return
    }

    setEnviado(true)
    setLoading(false)
  }

    return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-app)' }}>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 380 }}>
        <div style={{ marginBottom: 24 }}>
          <Image src="/logo.svg" alt="Cliniq" width={110} height={32} />
        </div>

        {enviado ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--cliniq-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ color: 'var(--brand)', fontSize: 20 }}>✓</span>
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>
              E-mail enviado!
            </h1>
            <p style={{ margin: '0 0 24px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 'var(--line-normal)' }}>
              Verifique sua caixa de entrada e clique no link para redefinir sua senha.
            </p>
            <Link href="/login" style={{ color: 'var(--brand)', fontSize: 'var(--text-sm)' }}>
              Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ margin: '0 0 4px', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>
              Recuperar senha
            </h1>
            <p style={{ margin: '0 0 24px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>

            {erro && (
              <div style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', color: 'var(--danger-600)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
                {erro}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="voce@email.com"
                onKeyDown={e => e.key === 'Enter' && handleEnviar()}
                style={inputStyle}
              />
            </div>

            <Button onClick={handleEnviar} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </Button>

            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 16 }}>
              <Link href="/login" style={{ color: 'var(--brand)' }}>Voltar ao login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}