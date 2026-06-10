'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  href: string
  children: React.ReactNode
  icon: React.ReactNode
  expandido: boolean
  exact?: boolean
}

export default function AdminNavLink({ href, children, icon, expandido, exact = false }: Props) {
  const pathname = usePathname()
  const ativo = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      title={expandido ? undefined : String(children)}
      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
      style={{
        backgroundColor: ativo ? 'rgba(255,255,255,0.15)' : 'transparent',
        color: 'white',
        fontWeight: ativo ? 500 : 400,
        opacity: ativo ? 1 : 0.8,
        justifyContent: expandido ? 'flex-start' : 'center',
      }}
      onMouseEnter={e => {
        if (!ativo) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)'
      }}
      onMouseLeave={e => {
        if (!ativo) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      {expandido && <span className="text-sm">{children}</span>}
    </Link>
  )
}