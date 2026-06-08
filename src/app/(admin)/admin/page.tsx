import { createServerSupabaseClient } from '@/lib/supabase/server'
import TenantActions from '@/components/admin/TenantActions'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Tenants</h1>
        <a
          href="/admin/tenants/novo"
          className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          + Novo tenant
        </a>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Nome</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Plano</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Criado em</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tenants && tenants.length > 0 ? (
              tenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{tenant.name}</td>
                  <td className="px-4 py-3 text-gray-500">{tenant.plan}</td>
                  <td className="px-4 py-3">
                    {tenant.is_active ? (
                      <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        ativo
                      </span>
                    ) : (
                      <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full">
                        bloqueado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <TenantActions tenantId={tenant.id} isActive={tenant.is_active} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nenhum tenant cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}