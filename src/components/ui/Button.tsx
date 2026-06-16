'use client'

import { useState } from 'react'

interface Props {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  style?: React.CSSProperties
  className?: string
}

const sizes = {
  sm: { padding: '4px 12px', fontSize: 'var(--text-xs)' },
  md: { padding: '8px 16px', fontSize: 'var(--text-sm)' },
  lg: { padding: '10px 20px', fontSize: 'var(--text-base)' },
}

const variants = {
  primary: {
    base: { background: 'var(--brand)', color: 'var(--text-on-brand)', border: '1px solid var(--brand)' },
    hover: { background: 'var(--brand-hover)', borderColor: 'var(--brand-hover)' },
  },
  secondary: {
    base: { background: 'var(--surface-card)', color: 'var(--text-body)', border: '1px solid var(--border-default)' },
    hover: { background: 'var(--surface-app)' },
  },
  ghost: {
    base: { background: 'transparent', color: 'var(--text-muted)', border: '1px solid transparent' },
    hover: { background: '#F3F4F6', color: 'var(--text-body)' },
  },
  danger: {
    base: { background: 'var(--surface-card)', color: 'var(--danger-600)', border: '1px solid var(--danger-200)' },
    hover: { background: 'var(--danger-50)' },
  },
}

export default function Button({
  children, variant = 'primary', size = 'md',
  disabled = false, type = 'button', onClick, style, className
}: Props) {
  const [hover, setHover] = useState(false)
  const v = variants[variant]

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--weight-medium)',
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 120ms ease, border-color 120ms ease',
        whiteSpace: 'nowrap',
        ...sizes[size],
        ...v.base,
        ...(hover && !disabled ? v.hover : {}),
        ...style,
      }}
    >
      {children}
    </button>
  )
}