'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Users, BarChart2 } from 'lucide-react'
import AdminNavLink from '@/components/admin/NavLink'
import LogoutButton from '@/components/admin/LogoutButton'

export default function AdminSidebar() {
  const [expandido, setExpandido] = useState(true)

  return (
    <aside
      className="flex flex-col transition-all duration-200"
      style={{
        backgroundColor: '#0F6E56',
        width: expandido ? '224px' : '64px',
        flexShrink: 0,
      }}
    >
      <div className="px-3 py-4 border-b border-white/10 flex items-center">
        {expandido ? (
          <div className="flex items-center gap-2 flex-1">
            <Image src="/logo-white.svg" alt="Cliniq" width={90} height={28} />
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded">admin</span>
          </div>
        ) : (
          <Image src="/logo-icon.svg" alt="Cliniq" width={32} height={32} />
        )}
        <button
          onClick={() => setExpandido(!expandido)}
          className="rounded-lg p-1.5 hover:bg-white/10 transition-colors ml-auto"
          style={{ color: 'rgba(255,255,255,0.8)' }}
          aria-label="Toggle menu"
        >
          {expandido ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-2 flex-1">
        <AdminNavLink href="/admin" icon={<Users size={18} />} expandido={expandido} exact>
          Clínicas
        </AdminNavLink>
        <AdminNavLink href="/admin/metricas" icon={<BarChart2 size={18} />} expandido={expandido}>
          Métricas
        </AdminNavLink>
      </nav>

      <div className="p-2 border-t border-white/10">
        <LogoutButton expandido={expandido} />
      </div>
    </aside>
  )
}