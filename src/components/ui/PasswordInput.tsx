'use client'

import { useState } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}

interface Requisito {
  label: string
  valido: boolean
}

function validarSenha(senha: string): Requisito[] {
  return [
    { label: 'Mínimo 8 caracteres', valido: senha.length >= 8 },
    { label: 'Letra maiúscula', valido: /[A-Z]/.test(senha) },
    { label: 'Letra minúscula', valido: /[a-z]/.test(senha) },
    { label: 'Número', valido: /[0-9]/.test(senha) },
    { label: 'Caractere especial (!@#$...)', valido: /[^A-Za-z0-9]/.test(senha) },
  ]
}

export function senhaValida(senha: string): boolean {
  return validarSenha(senha).every(r => r.valido)
}

export default function PasswordInput({ value, onChange, label, placeholder }: Props) {
  const [mostrar, setMostrar] = useState(false)
  const [tocado, setTocado] = useState(false)

  const requisitos = validarSenha(value)

  return (
    <div>
      {label && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        <input
          type={mostrar ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setTocado(true)}
          placeholder={placeholder ?? 'Mínimo 8 caracteres'}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <button
          type="button"
          onClick={() => setMostrar(!mostrar)}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 border border-gray-200 rounded-lg flex-shrink-0"
        >
          {mostrar ? 'Ocultar' : 'Ver'}
        </button>
      </div>

      {tocado && value.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {requisitos.map(r => (
            <div key={r.label} className="flex items-center gap-2">
              <span className={`text-xs ${r.valido ? 'text-green-600' : 'text-gray-400'}`}>
                {r.valido ? '✓' : '○'} {r.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}