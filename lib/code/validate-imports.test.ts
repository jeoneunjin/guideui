import { describe, expect, it } from 'vitest'
import { validateImports } from './validate-imports'

describe('validateImports', () => {
  it('화이트리스트에 있는 import만 쓰면 통과한다', () => {
    const code = `import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'

export default function GeneratedComponent() {
  return (
    <Card>
      <CardContent>
        <Button>확인</Button>
      </CardContent>
    </Card>
  )
}`
    expect(validateImports(code)).toEqual({ valid: true })
  })

  it('import가 없는 코드도 통과한다', () => {
    const code = `export default function GeneratedComponent() {
  return <div>안내</div>
}`
    expect(validateImports(code)).toEqual({ valid: true })
  })

  it('허용되지 않은 import가 있으면 거부하고 목록을 돌려준다', () => {
    const code = `import { Button } from './components/ui/button'
import axios from 'axios'
import { Icon } from 'lucide-react'

export default function GeneratedComponent() {
  return <Button>확인</Button>
}`
    expect(validateImports(code)).toEqual({
      valid: false,
      reason: 'disallowed-import',
      disallowed: ['axios', 'lucide-react'],
    })
  })

  it('허용된 경로와 확장자가 다르면 거부한다', () => {
    const code = `import { Button } from './components/ui/button.tsx'

export default function GeneratedComponent() {
  return <Button>확인</Button>
}`
    expect(validateImports(code)).toEqual({
      valid: false,
      reason: 'disallowed-import',
      disallowed: ['./components/ui/button.tsx'],
    })
  })

  it('문법 오류가 있으면 parse-error를 돌려준다', () => {
    const code = `export default function GeneratedComponent() {
  return <div>
}`
    expect(validateImports(code)).toEqual({ valid: false, reason: 'parse-error' })
  })
})
