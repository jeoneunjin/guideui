export function extractPartialCode(text: string): string | null {
  const match = text.match(/```[a-zA-Z]*\r?\n([\s\S]*?)(?:```|$)/)
  return match ? match[1] : null
}
