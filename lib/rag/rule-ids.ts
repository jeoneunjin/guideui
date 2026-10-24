// 가이드 규칙 ID 패턴(예: BTN-01, A11Y-09). 접두사에 숫자가 섞인 경우(A11Y)까지
// 잡아야 해서 [A-Z0-9]를 쓰되, 숫자만으로 된 접두사는 걸러내려고 lookahead로 알파벳이
// 최소 1개 있는지 확인한다.
const RULE_ID_PATTERN = /\b(?=[A-Z0-9]*[A-Z])[A-Z0-9]{2,6}-\d{2}\b/g

export function extractRuleIds(text: string): string[] {
  return Array.from(new Set(text.match(RULE_ID_PATTERN) ?? []))
}
