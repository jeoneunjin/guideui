import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { env } from '@/lib/env'

export async function updateAnonymousSession(request: NextRequest) {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      // signInAnonymously는 실패해도 throw하지 않고 { error }를 반환하므로 직접 확인해야 함.
      const { error } = await supabase.auth.signInAnonymously()
      if (error) console.error('익명 로그인 실패:', error.message)
    }
  } catch (error) {
    // Supabase 대시보드에서 "Anonymous sign-ins"가 꺼져 있으면 여기서 에러가 나는데,
    // 그래도 사이트 전체가 500이 되면 안 되므로 삼키고 그대로 통과시킨다.
    console.error('익명 로그인 실패:', error)
  }

  return response
}
