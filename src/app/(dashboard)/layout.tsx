import NavLink from '@/components/dashboard/NavLink'
import LogoutButton from '@/components/dashboard/LogoutButton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0F6E56' }}>
              <span className="text-white text-xs font-medium">C</span>
            </div>
            <span className="text-sm font-medium">Cliniq</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          <NavLink href="/dashboard" exact>Visão geral</NavLink>
          <NavLink href="/dashboard/pacientes">Pacientes</NavLink>
          <NavLink href="/dashboard/agenda">Agenda</NavLink>
          <NavLink href="/dashboard/servicos">Serviços</NavLink>
          <NavLink href="/dashboard/metricas">Métricas</NavLink>
          <NavLink href="/dashboard/perfil">Perfil</NavLink>
        </nav>
        <div className="p-3 border-t border-gray-200">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 p-8">
        {children}
      </main>
    </div>
  )
}