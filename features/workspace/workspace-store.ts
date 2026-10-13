import { create } from 'zustand'
import { code as defaultCode } from '@/mocks/workspace'
import { nextWorkspaceStatus, type WorkspaceEvent, type WorkspaceStatus } from './workspace-status'
import type { RestoredSession } from './restore-session'

export type { WorkspaceStatus }

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

interface WorkspaceState {
  status: WorkspaceStatus
  dispatch: (event: WorkspaceEvent) => void
  editorCode: string
  previewCode: string
  setCode: (code: string) => void
  setEditorCode: (code: string) => void
  messages: ChatMessage[]
  addMessage: (message: ChatMessage) => void
  requestError: string | null
  setRequestError: (error: string | null) => void
  sessionId: string | null
  setSessionId: (id: string) => void
  latestVersion: number
  incrementVersion: () => number
  hydrateSession: (session: RestoredSession | null) => void
  reset: () => void
}

const INITIAL_CODE = defaultCode.join('\n')

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  status: 'idle',
  dispatch: (event) => set((s) => ({ status: nextWorkspaceStatus(s.status, event) })),
  editorCode: INITIAL_CODE,
  previewCode: INITIAL_CODE,
  setCode: (code) => set({ editorCode: code, previewCode: code }),
  setEditorCode: (code) => set({ editorCode: code }),
  messages: [],
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  requestError: null,
  setRequestError: (error) => set({ requestError: error }),
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),
  latestVersion: 0,
  incrementVersion: () => {
    const next = get().latestVersion + 1
    set({ latestVersion: next })
    return next
  },
  hydrateSession: (session) => {
    if (!session) return
    set({
      sessionId: session.sessionId,
      messages: session.messages,
      editorCode: session.code ?? INITIAL_CODE,
      previewCode: session.code ?? INITIAL_CODE,
      latestVersion: session.latestVersion,
    })
  },
  reset: () =>
    set({
      status: 'idle',
      editorCode: INITIAL_CODE,
      previewCode: INITIAL_CODE,
      messages: [],
      requestError: null,
      sessionId: null,
      latestVersion: 0,
    }),
}))
