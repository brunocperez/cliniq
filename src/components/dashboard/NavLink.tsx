'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  href: string
  children: React.ReactNode
  exact?: boolean
}

export default function NavLink({ href, children, exact = false }: Props) {
  const pathname = usePathname()
  const ativo = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className="text-sm px-3 py-2 rounded-lg transition-colors"
      style={{
        backgroundColor: ativo ? '#E1F5EE' : 'transparent',
        color: ativo ? '#0F6E56' : '#374151',
        fontWeight: ativo ? 500 : 400,
      }}
    >
      {children}
    </Link>
  )
}