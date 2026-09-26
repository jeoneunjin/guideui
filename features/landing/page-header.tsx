import type { ReactNode } from 'react'

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-fg-secondary">{description}</p>
      </div>
      {actions && <div className="flex items-center justify-between gap-4 sm:justify-end">{actions}</div>}
    </header>
  )
}
