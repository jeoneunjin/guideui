import { parse } from '@babel/parser'
import { ALLOWED_IMPORT_SOURCES } from './allowed-imports'

export type ValidateImportsResult =
  | { valid: true }
  | { valid: false; reason: 'parse-error' }
  | { valid: false; reason: 'disallowed-import'; disallowed: string[] }

export function validateImports(code: string): ValidateImportsResult {
  let ast: ReturnType<typeof parse>
  try {
    ast = parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] })
  } catch {
    return { valid: false, reason: 'parse-error' }
  }

  const disallowed = ast.program.body
    .filter((node) => node.type === 'ImportDeclaration')
    .map((node) => node.source.value)
    .filter((source) => !ALLOWED_IMPORT_SOURCES.includes(source as (typeof ALLOWED_IMPORT_SOURCES)[number]))

  return disallowed.length === 0 ? { valid: true } : { valid: false, reason: 'disallowed-import', disallowed }
}
