export function extractCode(responseText: string): string {
  const match = responseText.match(/```[a-zA-Z]*\r?\n([\s\S]*?)```/)
  if (!match) return responseText.trim()
  return match[1].trim()
}
