'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Image from 'next/image'

export default function BloqueadoPage() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-app)' }}>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div style={{ marginBottom: 24 }}>
          <Image src="/logo.svg" alt="Cliniq" width={110} height={32} />
        </div>

        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--faltou-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span style={{ color: 'var(--faltou-ink)', fontSize: 20 }}>✕</span>
        </div>

        <h1 style={{ margin: '0 0 8px', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)' }}>
          Acesso bloqueado
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 'var(--line-normal)' }}>
          Sua conta foi suspensa. Entre em contato com o suporte para reativar o acesso.
        </p>

        <a
          href="https://wa.me/5500000000000"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', marginBottom: 12 }}
        >
          <Button style={{ width: '100%' }}>Falar com o suporte</Button>
        </a>

        <Button variant="ghost" onClick={handleLogout} style={{ width: '100%' }}>
          Sair da conta
        </Button>
      </div>
    </div>
  )
}