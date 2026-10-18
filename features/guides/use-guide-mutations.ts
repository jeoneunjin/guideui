'use client'

import { useMutation } from '@tanstack/react-query'
import { uploadGuideDocument } from './upload-document'

export function useUploadGuideDocument() {
  return useMutation({ mutationFn: uploadGuideDocument })
}
