import type { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function findDemoGuideSetId(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
): Promise<string | null> {
  if (!supabase) return null

  const { data: existing, error: selectError } = await supabase
    .from('guide_sets')
    .select('id')
    .eq('is_demo', true)
    .limit(1)
    .maybeSingle()
  if (selectError) throw selectError
  return existing ? (existing.id as string) : null
}

export async function getOrCreateDemoGuideSetId(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
): Promise<string | null> {
  const found = await findDemoGuideSetId(supabase)
  if (found) return found
  if (!supabase) return null

  const { data: created, error: insertError } = await supabase
    .from('guide_sets')
    .insert({ name: 'Sample DS', is_demo: true })
    .select('id')
    .single()
  if (insertError) throw insertError
  return created.id as string
}
