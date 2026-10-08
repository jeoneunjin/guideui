import { create } from 'zustand'
import { code as defaultCode } from '@/mocks/workspace'
import { nextWorkspaceStatus, type WorkspaceEvent, type WorkspaceStatus } from './workspace-status'

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
  reset: () => void
}

const INITIAL_CODE = defaultCode.join('\n')

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  status: 'idle',
  dispatch: (event) => set((s) => ({ status: nextWorkspaceStatus(s.status, event) })),
  editorCode: INITIAL_CODE,
  previewCode: INITIAL_CODE,
  setCode: (code) => set({ editorCode: code, previewCode: code }),
  setEditorCode: (code) => set({ editorCode: code }),
  messages: [],
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  reset: () => set({ status: 'idle', editorCode: INITIAL_CODE, previewCode: INITIAL_CODE, messages: [] }),
}))
