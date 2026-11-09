// 서버 없이 저장하는 간단한 저장소 (보관 방식은 kv.ts)
import { kv } from './kv'
export type User = {
  name: string
  email: string
  provider: 'email' | 'kakao' | 'google' | 'apple'
  joinedAt: string // ISO
}

/** 진행 단계: 접수 → 수거 → 세탁중 → 포장 → 배송중 */
export const ORDER_STEPS = ['접수', '수거', '세탁중', '포장', '배송중'] as const
export type OrderStep = 0 | 1 | 2 | 3 | 4

export type Order = {
  id: string
  /** requesting: 신청 중(부모님 응답 전) · accepted: 접수됨(진행 중) · done: 배송 완료 */
  status: 'requesting' | 'accepted' | 'done'
  step: OrderStep
  createdAt: string // ISO
  items: string[]
  /** 받는 사람 (부모님) */
  recipient?: { name: string; phone: string; address: string }
  /** 도착(예정)일 ISO */
  arriveAt?: string
  /** A/S 신청 마감 ISO (배송 완료 후) */
  asUntil?: string
  /** 신청 중일 때 신청 단계 (n/4) */
  applyStep?: 1 | 2 | 3 | 4
}

/** 저장한 부모님 정보 (E-3에서 관리) */
export type Parent = { id: string; label: string; name: string; phone: string; zip: string; address: string }

const DEMO_PARENTS: Parent[] = [
  { id: 'mom', label: '엄마', name: '김엄마', phone: '010-1234-5678', zip: '세종특별자치시 시청대로 123 (12345)', address: '000동 000호' },
]

const KEY = {
  parents: 'hyo.parents',
  user: 'hyo.user',
  orders: 'hyo.orders',
  guideClosed: 'hyo.guideClosed',
  notify: 'hyo.notify',
} as const

function read<T>(key: string): T | null {
  try {
    const raw = kv.get(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    kv.set(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: ignore */
  }
}

function remove(key: string) {
  try {
    kv.remove(key)
  } catch {
    /* ignore */
  }
}

export const storage = {
  getUser: () => read<User>(KEY.user),
  setUser: (u: User) => write(KEY.user, u),
  clearUser: () => remove(KEY.user),

  getOrders: () => read<Order[]>(KEY.orders) ?? [],
  setOrders: (o: Order[]) => write(KEY.orders, o),

  getParents: () => read<Parent[]>(KEY.parents) ?? DEMO_PARENTS,
  setParents: (p: Parent[]) => write(KEY.parents, p),

  /** 로그인·가입 직후: 주문/신청/편지/안내 닫음 기록을 비워 최초 홈부터 */
  resetActivity: () => {
    for (const k of [KEY.orders, KEY.guideClosed, 'hyo.applyDraft', 'hyo.letters', 'hyo.notiRead', 'hyo.notiLive']) remove(k)
  },

  getNotifySettings: () => read<{ progress: boolean; response: boolean }>(KEY.notify) ?? { progress: true, response: true },
  setNotifySettings: (v: { progress: boolean; response: boolean }) => write(KEY.notify, v),

  isGuideClosed: () => read<boolean>(KEY.guideClosed) ?? false,
  setGuideClosed: (v: boolean) => write(KEY.guideClosed, v),
}

/** 효도 횟수/마지막 날짜: 신청 중(응답 전)은 제외 */
export function hyodoStats(orders: Order[]) {
  const counted = orders.filter((o) => o.status !== 'requesting')
  const last = counted.map((o) => o.createdAt).sort().at(-1)
  return { count: counted.length, last: last ? new Date(last) : null }
}

/* ── 데모 데이터 (홈 3가지 상태를 미리 보기 위한 샘플) ── */
export type HomeDemo = 'first' | 'before' | 'after'

export function seedHomeDemo(state: HomeDemo) {
  const done: Order = { id: 'HY260917-01', status: 'done', step: 4, createdAt: '2026-09-17T10:00:00+09:00', items: ['겨울 이불'] }
  const washing: Order = { id: 'HY261028-01', status: 'accepted', step: 2, createdAt: '2026-10-28T10:00:00+09:00', items: ['겨울 이불'] }
  storage.setOrders(state === 'first' ? [] : state === 'before' ? [done] : [done, washing])
  storage.setGuideClosed(false)
}
