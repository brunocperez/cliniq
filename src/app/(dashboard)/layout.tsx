import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">

      {/* Menu lateral */}
      <aside className="w-56 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-gray-200">
          <span className="text-sm font-medium">ClinicSaaS</span>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          <Link href="/dashboard" className="text-sm px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            Visão geral
          </Link>
          <Link href="/dashboard/pacientes" className="text-sm px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            Pacientes
          </Link>
          <Link href="/dashboard/agenda" className="text-sm px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            Agenda
          </Link>
          <Link href="/dashboard/servicos" className="text-sm px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            Serviços
          </Link>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 bg-gray-50 p-8">
        {children}
      </main>

    </div>
  )
}