// 앱 데이터 보관소.
// PERSIST = false: 메모리에만 저장 → 새로고침하면 처음 상태로 초기화 (데모용, 현재 설정)
// PERSIST = true : 브라우저 localStorage에 저장 → 새로고침해도 유지
const PERSIST = false

const mem = new Map<string, string>()

export const kv = {
  get(key: string): string | null {
    if (!PERSIST) return mem.get(key) ?? null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    if (!PERSIST) {
      mem.set(key, value)
      return
    }
    localStorage.setItem(key, value)
  },
  remove(key: string) {
    if (!PERSIST) {
      mem.delete(key)
      return
    }
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}

// 예전에 localStorage에 남아 있던 데이터 정리
if (!PERSIST) {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('hyo.'))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}

// 테스트용: sessionStorage 'hyo.seed'에 {키: 값} JSON이 있으면 한 번 불러오고 지움 (화면 비교 자동화용)
try {
  const seed = sessionStorage.getItem('hyo.seed')
  if (seed) {
    sessionStorage.removeItem('hyo.seed')
    for (const [k, v] of Object.entries(JSON.parse(seed) as Record<string, unknown>)) kv.set(k, JSON.stringify(v))
  }
} catch {
  /* ignore */
}
