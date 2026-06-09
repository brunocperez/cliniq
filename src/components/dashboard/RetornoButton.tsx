'use client'

import { useState } from 'react'
import RetornoModal from '@/components/dashboard/RetornoModal'

interface Props {
  consultaId: string
  pacienteId: string
  tenantId: string
}

export default function RetornoButton({ consultaId, pacienteId, tenantId }: Props) {
  const [mostrarModal, setMostrarModal] = useState(false)

  return (
    <>
      {mostrarModal && (
        <RetornoModal
          consultaId={consultaId}
          pacienteId={pacienteId}
          tenantId={tenantId}
          onFechar={() => setMostrarModal(false)}
        />
      )}
      <button
        onClick={() => setMostrarModal(true)}
        className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 w-full"
      >
        + Marcar retorno
      </button>
    </>
  )
}