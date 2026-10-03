import { tailwindExtend } from '@/sample-guide/tokens'

export function buildSandboxFiles(code: string): Record<string, string> {
  return {
    '/App.tsx': `import GeneratedComponent from './GeneratedComponent'

export default function App() {
  return (
    <main className="p-6">
      <GeneratedComponent />
    </main>
  )
}`,
    '/GeneratedComponent.tsx': code,
  }
}

const TAILWIND_CONFIG_SCRIPT = `window.tailwind=window.tailwind||{};tailwind.config=${JSON.stringify({ theme: { extend: tailwindExtend } })};`

export function buildSandboxOptions() {
  return {
    externalResources: [
      'https://cdn.tailwindcss.com',
      `data:text/javascript,${encodeURIComponent(TAILWIND_CONFIG_SCRIPT)}`,
    ],
  }
}
