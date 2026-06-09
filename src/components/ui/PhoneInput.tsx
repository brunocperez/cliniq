'use client'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function formatarTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)

  if (numeros.length <= 2) return numeros
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
  if (numeros.length <= 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
}

export default function PhoneInput({ value, onChange, placeholder, className }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(formatarTelefone(e.target.value))
  }

  return (
    <input
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder={placeholder ?? '(11) 99999-9999'}
      className={className}
    />
  )
}