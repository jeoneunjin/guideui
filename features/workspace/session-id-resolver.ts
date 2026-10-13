export function createSessionIdResolver(deps: {
  getSessionId: () => string | null
  setSessionId: (id: string) => void
  createSession: () => Promise<string | null>
}) {
  let inFlight: Promise<string | null> | null = null

  async function ensureSessionId(): Promise<string | null> {
    const existing = deps.getSessionId()
    if (existing) return existing

    if (!inFlight) {
      inFlight = deps
        .createSession()
        .then((id) => {
          if (id) deps.setSessionId(id)
          return id
        })
        .catch((error) => {
          console.error('세션 생성 실패:', error)
          return null
        })
        .finally(() => {
          inFlight = null
        })
    }
    return inFlight
  }

  return { ensureSessionId }
}
