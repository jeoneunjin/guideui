import { GuidesPage } from '@/components/guides-page'

export default async function Page({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const params = await searchParams
  return <GuidesPage state={params.state} />
}
