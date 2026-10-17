import { z } from 'zod'

// 업로드 영역 안내 문구("파일당 1MB 이하")와 동일한 값.
export const GUIDE_FILE_MAX_BYTES = 1 * 1024 * 1024

export const guideFileSchema = z
  .instanceof(File)
  .refine((f) => f.name.toLowerCase().endsWith('.md'), '마크다운(.md) 파일만 올릴 수 있어요.')
  .refine((f) => f.size > 0, '빈 파일은 올릴 수 없어요.')
  .refine((f) => f.size <= GUIDE_FILE_MAX_BYTES, '파일 하나는 1MB를 넘을 수 없어요.')
