'use client'

interface Props {
  value: number | null
  onChange: (valor: number | null) => void
  placeholder?: string
  style?: React.CSSProperties
}

function formatar(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function InputMoeda({ value, onChange, placeholder = 'R$ 0,00', style }: Props) {
  // Deriva os centavos direto do value (sem estado interno duplicado)
  const centavos = value != null ? Math.round(value * 100) : 0

  function handleKeyInput(e: React.ChangeEvent<HTMLInputElement>) {
    const digitos = e.target.value.replace(/\D/g, '')
    const novoCentavos = digitos ? parseInt(digitos, 10) : 0
    onChange(novoCentavos === 0 ? null : novoCentavos / 100)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={centavos === 0 ? '' : formatar(centavos)}
      onChange={handleKeyInput}
      placeholder={placeholder}
      style={style}
    />
  )
}