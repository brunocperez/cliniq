import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default async function TenantDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: tenant } = await adminSupabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single()

  if (!tenant) notFound()

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', id)
    .eq('role', 'client')
    .single()

  const { data: authUser } = await adminSupabase.auth.admin.getUserById(profile?.id ?? '')
  const email = authUser?.user?.email ?? '—'

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <a href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← Voltar</a>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-lg font-medium">{tenant.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              tenant.is_active
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {tenant.is_active ? 'ativo' : 'bloqueado'}
            </span>
          </div>
          <a
            href={`/admin/tenants/${id}/editar`}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            Editar
          </a>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-medium mb-4">Dados do consultório</h2>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Nome</p>
            <p className="text-sm">{tenant.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Especialidade</p>
            <p className="text-sm">{tenant.specialty ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">WhatsApp do consultório</p>
            <p className="text-sm">{tenant.whatsapp_consultorio ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Cadastrado em</p>
            <p className="text-sm">{new Date(tenant.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-medium mb-4">Dados do responsável</h2>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Nome do responsável</p>
            <p className="text-sm">{profile?.responsible_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">WhatsApp do responsável</p>
            <p className="text-sm">{profile?.whatsapp_responsavel ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">E-mail de acesso</p>
            <p className="text-sm">{email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}