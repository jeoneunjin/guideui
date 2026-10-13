'use client'

import { useMutation } from '@tanstack/react-query'
import { createSession, saveMessage, saveVersion } from './session-persistence'

export function useCreateSession() {
  return useMutation({ mutationFn: createSession })
}

export function useSaveMessage() {
  return useMutation({ mutationFn: saveMessage })
}

export function useSaveVersion() {
  return useMutation({ mutationFn: saveVersion })
}
