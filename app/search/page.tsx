import { SearchPage } from '@/components/search-page'

export default async function SearchRoute({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const params = await searchParams
  return <SearchPage initialState={params.state} />
}
