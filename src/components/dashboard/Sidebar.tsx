'use client'

import { useState } from 'react'
import NavLink from '@/components/dashboard/NavLink'
import LogoutButton from '@/components/dashboard/LogoutButton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

export default function Sidebar() {
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
        <NavLink href="/dashboard" icon="home" expandido={expandido} exact>Visão geral</NavLink>
        <NavLink href="/dashboard/pacientes" icon="users" expandido={expandido}>Pacientes</NavLink>
        <NavLink href="/dashboard/agenda" icon="calendar" expandido={expandido}>Agenda</NavLink>
        <NavLink href="/dashboard/servicos" icon="briefcase" expandido={expandido}>Serviços</NavLink>
        <NavLink href="/dashboard/metricas" icon="chart" expandido={expandido}>Métricas</NavLink>
        <NavLink href="/dashboard/perfil" icon="user" expandido={expandido}>Perfil</NavLink>
      </nav>

      <div className="p-2 border-t border-white/10">
        <LogoutButton expandido={expandido} />
      </div>
    </aside>
  )
}