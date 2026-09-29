import { Workspace } from '@/features/workspace/workspace'
import { resolveDevState } from '@/lib/dev-state'

export default async function WorkspaceRoute({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const params = await searchParams
  return <Workspace initialState={resolveDevState(params.state)} />
}
