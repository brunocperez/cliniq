import AdminSidebar from '@/components/admin/AdminSidebar'
import ThemeToggle from '@/components/ThemeToggle'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header style={{
          height: 56,
          borderBottom: '1px solid var(--border-divider)',
          background: 'var(--surface-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingInline: 32,
          flexShrink: 0,
        }}>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-8 overflow-auto" style={{ background: 'var(--surface-app)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}