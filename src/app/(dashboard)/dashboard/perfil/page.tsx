import { createServerSupabaseClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'

export default async function PerfilPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tenants(name, specialty, whatsapp_consultorio)')
    .single()

  const tenant = Array.isArray(profile?.tenants)
    ? profile.tenants[0]
    : profile?.tenants

  const nome = profile?.responsible_name ?? profile?.full_name ?? ''
  const iniciais = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Perfil do consultório</h1>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Suas informações e configurações</p>
      </div>

      {/* Avatar */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--cliniq-50)', color: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'var(--weight-bold)', fontSize: 18,
            flexShrink: 0,
          }}>
            {iniciais || '?'}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>{nome || '—'}</p>
            <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{tenant?.name ?? '—'}</p>
          </div>
        </div>
      </Card>

      <Card title="Dados do consultório" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Nome do consultório</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{tenant?.name ?? '—'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Especialidade</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{tenant?.specialty ?? '—'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>WhatsApp do consultório</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{tenant?.whatsapp_consultorio ?? '—'}</p>
          </div>
        </div>
      </Card>

      <Card title="Dados do responsável">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Nome do responsável</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{profile?.responsible_name ?? '—'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>WhatsApp do responsável</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{profile?.whatsapp_responsavel ?? '—'}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>E-mail de acesso</p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{user?.email ?? '—'}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}