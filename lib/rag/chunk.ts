export type GuideChunk = {
  headingPath: string
  content: string
  tokenCount: number
}

const MIN_CHUNK_TOKENS = 80
const MAX_CHUNK_TOKENS = 800
const TARGET_CHUNK_TOKENS = 650
const OVERLAP_TOKENS = 75

type RawSection = {
  headingPath: string
  content: string
}

// Gemini 등 실제 토크나이저를 새로 붙이지 않고 청크 크기 판단용 근사치만 구한다.
// 한글 글자는 SentencePiece류 토크나이저에서 글자당 1개 이상의 토큰으로 쪼개지는 경우가
// 많아 /1.5, 영문·숫자·코드는 /4로 나눠서 더한다.
export function estimateTokenCount(text: string): number {
  const korean = text.match(/[가-힣]/g)?.length ?? 0
  const other = text.length - korean
  return Math.ceil(korean / 1.5 + other / 4)
}

function stripFrontmatter(markdown: string): string {
  const match = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/)
  return match ? markdown.slice(match[0].length) : markdown
}

function buildHeadingPath(stack: string[]): string {
  const segments = stack.filter((s): s is string => !!s)
  const deduped: string[] = []
  for (const segment of segments) {
    while (deduped.length > 0 && segment.startsWith(deduped[deduped.length - 1])) {
      deduped.pop()
    }
    deduped.push(segment)
  }
  return deduped.join(' > ')
}

function splitByHeading(markdown: string): RawSection[] {
  const lines = markdown.split('\n')
  const sections: RawSection[] = []
  const stack: string[] = []
  let currentPath = ''
  let buffer: string[] = []
  let inFence = false

  function closeCurrentSection() {
    const content = buffer.join('\n').trim()
    if (content) sections.push({ headingPath: currentPath, content })
    buffer = []
  }

  for (const line of lines) {
    if (/^```/.test(line.trim())) inFence = !inFence

    const headingMatch = !inFence ? line.match(/^(#{1,6})\s+(.+?)\s*$/) : null
    if (headingMatch) {
      closeCurrentSection()
      const level = headingMatch[1].length
      stack.length = level - 1
      stack[level - 1] = headingMatch[2].trim()
      currentPath = buildHeadingPath(stack)
      continue
    }

    buffer.push(line)
  }
  closeCurrentSection()

  return sections
}

function mergeShortSections(sections: RawSection[]): RawSection[] {
  if (sections.length <= 1) return sections

  const merged: RawSection[] = []
  let pending: string | null = null

  for (const section of sections) {
    const content: string = pending ? `${pending}\n\n${section.content}` : section.content
    pending = null
    if (estimateTokenCount(content) < MIN_CHUNK_TOKENS) {
      pending = content
      continue
    }
    merged.push({ headingPath: section.headingPath, content })
  }

  if (pending !== null) {
    if (merged.length > 0) {
      merged[merged.length - 1] = {
        ...merged[merged.length - 1],
        content: `${merged[merged.length - 1].content}\n\n${pending}`,
      }
    } else {
      merged.push({ headingPath: sections[sections.length - 1].headingPath, content: pending })
    }
  }

  return merged
}

function splitIntoParagraphs(content: string): string[] {
  const lines = content.split('\n')
  const paragraphs: string[] = []
  let buffer: string[] = []
  let inFence = false

  function flush() {
    if (buffer.length > 0) {
      paragraphs.push(buffer.join('\n'))
      buffer = []
    }
  }

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence
      buffer.push(line)
      if (!inFence) flush()
      continue
    }
    if (!inFence && line.trim() === '') {
      flush()
      continue
    }
    buffer.push(line)
  }
  flush()

  return paragraphs
}

function splitOversizedParagraph(paragraph: string): string[] {
  if (estimateTokenCount(paragraph) <= MAX_CHUNK_TOKENS) return [paragraph]

  const lines = paragraph.split('\n')
  const pieces: string[] = []
  let buffer: string[] = []

  for (const line of lines) {
    buffer.push(line)
    if (estimateTokenCount(buffer.join('\n')) >= TARGET_CHUNK_TOKENS) {
      pieces.push(buffer.join('\n'))
      buffer = []
    }
  }
  if (buffer.length > 0) pieces.push(buffer.join('\n'))

  return pieces
}

function takeOverlapTail(paragraphs: string[]): string[] {
  const tail: string[] = []
  let tokens = 0
  for (let i = paragraphs.length - 1; i >= 0 && tokens < OVERLAP_TOKENS; i--) {
    tail.unshift(paragraphs[i])
    tokens += estimateTokenCount(paragraphs[i])
  }
  return tail
}

function resplitSection(section: RawSection): RawSection[] {
  if (estimateTokenCount(section.content) <= MAX_CHUNK_TOKENS) return [section]

  const paragraphs = splitIntoParagraphs(section.content).flatMap(splitOversizedParagraph)

  const chunks: string[][] = []
  let current: string[] = []

  for (const paragraph of paragraphs) {
    const candidate = [...current, paragraph]
    if (current.length > 0 && estimateTokenCount(candidate.join('\n\n')) > TARGET_CHUNK_TOKENS) {
      chunks.push(current)
      current = [...takeOverlapTail(current), paragraph]
    } else {
      current = candidate
    }
  }
  if (current.length > 0) chunks.push(current)

  return chunks.map((paragraphGroup) => ({
    headingPath: section.headingPath,
    content: paragraphGroup.join('\n\n'),
  }))
}

export function chunkMarkdown(markdown: string): GuideChunk[] {
  const withoutFrontmatter = stripFrontmatter(markdown)
  const sections = mergeShortSections(splitByHeading(withoutFrontmatter))
  const resplit = sections.flatMap(resplitSection)

  return resplit.map((section) => ({
    headingPath: section.headingPath,
    content: section.content,
    tokenCount: estimateTokenCount(section.content),
  }))
}
