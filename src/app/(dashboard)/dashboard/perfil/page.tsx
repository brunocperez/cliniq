import { createServerSupabaseClient } from '@/lib/supabase/server'

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

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-lg font-medium">Perfil do consultório</h1>
        <p className="text-sm text-gray-500">Suas informações e configurações</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-medium mb-4">Dados do consultório</h2>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Nome do consultório</p>
            <p className="text-sm">{tenant?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Especialidade</p>
            <p className="text-sm">{tenant?.specialty ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">WhatsApp do consultório</p>
            <p className="text-sm">{tenant?.whatsapp_consultorio ?? '—'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
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
            <p className="text-sm">{user?.email ?? '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}