import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@': import.meta.dirname } },
  test: { exclude: [...configDefaults.exclude, 'e2e/**'] },
})
