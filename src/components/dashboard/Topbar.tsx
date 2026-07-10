import { createServerSupabaseClient } from '@/lib/supabase/server'
import ThemeToggle from '@/components/ThemeToggle'

export default async function Topbar() {
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('responsible_name, full_name')
    .single()

  const nome = profile?.responsible_name ?? profile?.full_name ?? ''
  const iniciais = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  return (
    <header style={{
      height: 56,
      borderBottom: '1px solid var(--border-divider)',
      background: 'var(--surface-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingInline: 32,
      gap: 12,
      flexShrink: 0,
    }}>
      <ThemeToggle />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--cliniq-50)',
          color: 'var(--brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 'var(--weight-semibold)',
          flexShrink: 0,
        }}>
          {iniciais || '?'}
        </div>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-body)' }}>
          {nome || 'Usuário'}
        </span>
      </div>
    </header>
  )
}