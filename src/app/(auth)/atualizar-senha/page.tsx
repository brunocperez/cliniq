'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import PasswordInput, { senhaValida } from '@/components/ui/PasswordInput'
import { inputStyle, labelStyle } from '@/lib/styles'

export default function AtualizarSenhaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAtualizar() {
    setErro('')

    if (!senhaValida(novaSenha)) {
      setErro('A senha não atende aos requisitos mínimos.')
      return
    }

    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password: novaSenha })

    if (error) {
      setErro('Erro ao atualizar a senha. O link pode ter expirado.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

    return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-app)' }}>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 380 }}>
        <div style={{ marginBottom: 24 }}>
          <Image src="/logo.svg" alt="Cliniq" width={110} height={32} />
        </div>

        <h1 style={{ margin: '0 0 4px', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>
          Nova senha
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Escolha uma senha forte para sua conta.
        </p>

        {erro && (
          <div style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', color: 'var(--danger-600)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
            {erro}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <PasswordInput label="Nova senha" value={novaSenha} onChange={setNovaSenha} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Confirmar senha</label>
          <input
            type="password"
            value={confirmar}
            onChange={e => setConfirmar(e.target.value)}
            placeholder="Repita a senha"
            onKeyDown={e => e.key === 'Enter' && handleAtualizar()}
            style={inputStyle}
          />
        </div>

        <Button onClick={handleAtualizar} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Salvando...' : 'Definir nova senha'}
        </Button>
      </div>
    </div>
  )
}