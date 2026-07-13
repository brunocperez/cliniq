'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PasswordInput, { senhaValida } from '@/components/ui/PasswordInput'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import { inputStyle, labelStyle } from '@/lib/styles'

export default function TrocarSenhaPage() {
  const supabase = createClient()

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleTrocar() {
    setErro('')

    if (!senhaValida(novaSenha)) {
      setErro('A senha não atende aos requisitos mínimos.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password: novaSenha })

    if (error) {
      setErro('Erro ao trocar senha.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('profiles')
      .update({ first_login: false })
      .eq('id', user?.id)

    await new Promise(resolve => setTimeout(resolve, 800))
    window.location.href = '/dashboard'
  }

    return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-app)' }}>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 360 }}>

        <div style={{ marginBottom: 24 }}>
          <Image src="/logo.svg" alt="Cliniq" width={120} height={36} />
        </div>

        <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Troque sua senha</h1>
        <p style={{ margin: '4px 0 24px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Por segurança, defina uma nova senha para o seu acesso.
        </p>

        {erro && (
          <div style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', color: 'var(--danger-600)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
            {erro}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <PasswordInput
            label="Nova senha"
            value={novaSenha}
            onChange={setNovaSenha}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Confirmar senha</label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={e => setConfirmarSenha(e.target.value)}
            placeholder="Repita a senha"
            onKeyDown={e => e.key === 'Enter' && handleTrocar()}
            style={inputStyle}
          />
        </div>

        <Button onClick={handleTrocar} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Salvando...' : 'Definir nova senha'}
        </Button>

      </div>
    </div>
  )
}