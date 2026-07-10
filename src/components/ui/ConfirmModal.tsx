'use client'

interface Props {
  mensagem: string
  onConfirmar: () => void
  onCancelar: () => void
}

export default function ConfirmModal({ mensagem, onConfirmar, onCancelar }: Props) {
  return (
    <div
      style={{ background: 'rgba(0,0,0,0.4)' }}
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onCancelar}
    >
      <div
        className="bg-[var(--surface-card)] rounded-xl border border-[var(--border-default)] p-6 w-full max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-sm text-[var(--text-body)] mb-6 text-center">{mensagem}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 text-sm px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--surface-app)]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 text-sm px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#0F6E56' }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}