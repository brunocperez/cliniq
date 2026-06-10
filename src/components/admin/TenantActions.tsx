'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ui/ConfirmModal'

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
  const [senhaReset, setSenhaReset] = useState('')
  const [mostrarSenhaReset, setMostrarSenhaReset] = useState(false)
  const [copiado, setCopiado] = useState(false)

  async function handleToggle() {
    await supabase
      .from('tenants')
      .update({ is_active: !isActive })
      .eq('id', tenantId)

    setMostrarModalBloqueio(false)
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
          style={{ background: 'rgba(0,0,0,0.4)' }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div
            className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-sm font-medium mb-4">Senha redefinida</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">Nova senha temporária</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono flex-1">
                  {mostrarSenhaReset ? senhaReset : '••••••••••'}
                </p>
                <button
                  onClick={() => setMostrarSenhaReset(!mostrarSenhaReset)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 border border-gray-200 rounded"
                >
                  {mostrarSenhaReset ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(senhaReset)
                  setCopiado(true)
                  setTimeout(() => setCopiado(false), 2000)
                }}
                className="flex-1 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                {copiado ? 'Copiado!' : 'Copiar senha'}
              </button>
              <button
                onClick={() => {
                  const conteudo = `Cliniq — Nova Senha\n\nConsultório: ${tenantName}\nNova senha: ${senhaReset}\n\nAcesse: ${window.location.origin}/login`
                  const blob = new Blob([conteudo], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `nova-senha-${tenantName.toLowerCase().replace(/\s+/g, '-')}.txt`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="flex-1 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Baixar .txt
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mb-4">O e-mail foi enviado para o cliente.</p>
            <button
              onClick={() => { setSenhaReset(''); setMostrarSenhaReset(false); setCopiado(false) }}
              className="w-full text-white rounded-lg py-2 text-sm font-medium"
              style={{ backgroundColor: '#0F6E56' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setMostrarModalBloqueio(true)}
          className={`text-xs px-3 py-1 rounded-full border ${
            isActive
              ? 'border-red-200 text-red-600 hover:bg-red-50'
              : 'border-green-200 text-green-600 hover:bg-green-50'
          }`}
        >
          {isActive ? 'Bloquear' : 'Desbloquear'}
        </button>
        <button
          onClick={() => setMostrarModalReset(true)}
          disabled={loadingReset}
          className="text-xs px-3 py-1 rounded-full border text-white"
          style={{ borderColor: '#0F6E56', backgroundColor: '#0F6E56' }}
        >
          Resetar senha
        </button>
      </div>
    </>
  )
}