import { GuidesPage } from '@/features/guides/guides-page'
import { resolveDevState } from '@/lib/dev-state'

export default async function Page({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const params = await searchParams
  return <GuidesPage state={resolveDevState(params.state)} />
}
