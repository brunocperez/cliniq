'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import Link from 'next/link'

type Role = 'clinica' | 'admin'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<Role>('clinica')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setErro('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

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

  const segmentos: { value: Role; label: string }[] = [
    { value: 'clinica', label: 'Sou uma clínica' },
    { value: 'admin', label: 'Sou administrador' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-app)' }}>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 380 }}>

        <div style={{ marginBottom: 24 }}>
          <Image src="/logo.svg" alt="Cliniq" width={110} height={32} />
        </div>

        {/* Segmented control */}
        <div style={{ display: 'flex', background: 'var(--surface-app)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 24, gap: 2 }}>
          {segmentos.map(s => (
            <button
              key={s.value}
              onClick={() => { setRole(s.value); setErro('') }}
              style={{
                flex: 1,
                padding: '7px 12px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-sans)',
                fontWeight: role === s.value ? 'var(--weight-medium)' : 'var(--weight-regular)',
                background: role === s.value ? 'var(--surface-card)' : 'transparent',
                color: role === s.value ? 'var(--text-strong)' : 'var(--text-muted)',
                boxShadow: role === s.value ? 'var(--shadow-xs)' : 'none',
                transition: 'all 120ms ease',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <h1 style={{ margin: '0 0 4px', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)', letterSpacing: 'var(--tracking-tight)' }}>
          {role === 'clinica' ? 'Entrar na sua conta' : 'Acesso administrativo'}
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          {role === 'clinica' ? 'Gestão de consultório simplificada' : 'Painel de gestão de clínicas'}
        </p>

        {erro && (
          <div style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', color: 'var(--danger-600)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
            {erro}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={role === 'clinica' ? 'clinica@email.com' : 'admin@cliniq.com'}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={inputStyle}
          />
        </div>

        <Button onClick={handleLogin} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        {role === 'clinica' && (
          <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 16 }}>
            Ainda não tem conta?{' '}
            <Link href="/cadastro" style={{ color: 'var(--brand)' }}>Criar conta gratuita</Link>
          </p>
        )}
      </div>
    </div>
  )
}