import { Workspace } from '@/features/workspace/workspace'
import { resolveDevState } from '@/lib/dev-state'
import { getLatestSession } from '@/features/workspace/restore-session'

export default async function WorkspaceRoute({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const params = await searchParams
  const initialSession = await getLatestSession()
  return <Workspace initialState={resolveDevState(params.state)} initialSession={initialSession} />
}
