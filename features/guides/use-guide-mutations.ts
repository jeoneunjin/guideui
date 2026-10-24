'use client'

import { useMutation } from '@tanstack/react-query'
import { uploadGuideDocument } from './upload-document'
import { deleteGuideDocument } from './delete-document'

export function useUploadGuideDocument() {
  return useMutation({ mutationFn: uploadGuideDocument })
}

export function useDeleteGuideDocument() {
  return useMutation({ mutationFn: deleteGuideDocument })
}
