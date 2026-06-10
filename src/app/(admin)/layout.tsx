import Link from 'next/link'
import LogoutButton from '@/components/admin/LogoutButton'

export default function AdminLayout({
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
            <div>
              <span className="text-sm font-medium">Cliniq</span>
              <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">admin</span>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          <Link
            href="/admin"
            className="text-sm px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
          >
            Tenants
          </Link>
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