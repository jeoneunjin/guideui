import { SearchPage } from '@/features/guides/search-page'
import { resolveDevState } from '@/lib/dev-state'

export default async function SearchRoute({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const params = await searchParams
  return <SearchPage initialState={resolveDevState(params.state)} />
}
