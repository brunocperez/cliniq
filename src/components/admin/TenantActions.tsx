'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Button from '@/components/ui/Button'

interface Props {
  tenantId: string
  isActive: boolean
  userId: string
  tenantName: string
}

export default function TenantActions({ tenantId, isActive, userId, tenantName }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [mostrarModalBloqueio, setMostrarModalBloqueio] = useState(false)
  const [mostrarModalReset, setMostrarModalReset] = useState(false)
  const [loadingReset, setLoadingReset] = useState(false)
  const [loadingBloqueio, setLoadingBloqueio] = useState(false)
  const [senhaReset, setSenhaReset] = useState('')
  const [mostrarSenhaReset, setMostrarSenhaReset] = useState(false)
  const [copiado, setCopiado] = useState(false)

  async function handleToggle() {
    setLoadingBloqueio(true)
    await supabase
      .from('tenants')
      .update({ is_active: !isActive })
      .eq('id', tenantId)
    setMostrarModalBloqueio(false)
    setLoadingBloqueio(false)
    router.refresh()
  }

  async function handleResetSenha() {
    setLoadingReset(true)

    try {
      const res = await fetch('/api/tenants/reset-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tenantName }),
      })

      const text = await res.text()
      const data = JSON.parse(text)
      setLoadingReset(false)
      setMostrarModalReset(false)

      if (data.success) {
        setSenhaReset(data.senha)
      } else {
        alert(data.error || 'Erro ao resetar senha.')
      }
    } catch (err) {
      console.log('Erro:', err)
      setLoadingReset(false)
      setMostrarModalReset(false)
      alert('Erro ao resetar senha.')
    }
  }

  return (
    <>
      {mostrarModalBloqueio && (
        <ConfirmModal
          mensagem={isActive
            ? 'Tem certeza que deseja bloquear este tenant?'
            : 'Tem certeza que deseja desbloquear este tenant?'
          }
          onConfirmar={handleToggle}
          onCancelar={() => setMostrarModalBloqueio(false)}
        />
      )}

      {mostrarModalReset && (
        <ConfirmModal
          mensagem="Isso vai gerar uma nova senha e enviar por e-mail para o cliente. Confirmar?"
          onConfirmar={handleResetSenha}
          onCancelar={() => setMostrarModalReset(false)}
        />
      )}

      {senhaReset && (
        <div
          style={{ background: 'rgba(0,0,0,0.4)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
        >
          <div
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 24, width: '100%', maxWidth: 360, margin: '0 16px' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Senha redefinida</h2>
            <div style={{ background: 'var(--surface-app)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Nova senha temporária</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', flex: 1, color: 'var(--text-body)' }}>
                  {mostrarSenhaReset ? senhaReset : '••••••••••'}
                </p>
                <Button variant="secondary" size="sm" onClick={() => setMostrarSenhaReset(!mostrarSenhaReset)}>
                  {mostrarSenhaReset ? 'Ocultar' : 'Ver'}
                </Button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(senhaReset); setCopiado(true); setTimeout(() => setCopiado(false), 2000) }} style={{ flex: 1 }}>
                {copiado ? 'Copiado!' : 'Copiar senha'}
              </Button>
              <Button variant="secondary" onClick={() => {
                const conteudo = `Cliniq — Nova Senha\n\nConsultório: ${tenantName}\nNova senha: ${senhaReset}\n\nAcesse: ${window.location.origin}/login`
                const blob = new Blob([conteudo], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `nova-senha-${tenantName.toLowerCase().replace(/\s+/g, '-')}.txt`
                a.click()
                URL.revokeObjectURL(url)
              }} style={{ flex: 1 }}>
                Baixar .txt
              </Button>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', textAlign: 'center', marginBottom: 16 }}>O e-mail foi enviado para o cliente.</p>
            <Button onClick={() => { setSenhaReset(''); setMostrarSenhaReset(false); setCopiado(false) }} style={{ width: '100%' }}>
              Fechar
            </Button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setMostrarModalBloqueio(true)}
          disabled={loadingBloqueio}
          style={{
            fontSize: 'var(--text-xs)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            border: `1px solid ${isActive ? 'var(--danger-200)' : '#BBF7D0'}`,
            background: isActive ? 'var(--danger-50)' : '#F0FDF4',
            color: isActive ? 'var(--danger-600)' : '#15803D',
            cursor: loadingBloqueio ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-sans)',
            opacity: loadingBloqueio ? 0.5 : 1,
          }}
        >
          {loadingBloqueio ? '...' : isActive ? 'Bloquear' : 'Desbloquear'}
        </button>
        <Button size="sm" onClick={() => setMostrarModalReset(true)} disabled={loadingReset}>
          Resetar senha
        </Button>
      </div>
    </>
  )
}