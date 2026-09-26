import { Workspace } from '@/features/workspace/workspace'

export default async function WorkspaceRoute({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const params = await searchParams
  return <Workspace initialState={params.state} />
}
