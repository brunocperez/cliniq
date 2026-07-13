import { createServerSupabaseClient } from '@/lib/supabase/server'
import AdminTenantsView from '@/components/admin/AdminTenantsView'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*, profiles(id, full_name)')
    .order('created_at', { ascending: false })

  return <AdminTenantsView tenants={tenants ?? []} />
}