import { storage, type Order } from './storage'

const DAY = 86_400_000
const WEEK = ['일', '월', '화', '수', '목', '금', '토']
const pad = (n: number) => String(n).padStart(2, '0')

/** "10.20(화)" */
export const fmtMD = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}(${WEEK[d.getDay()]})`
}
/** "26. 10. 17 (토)" */
export const fmtYMD = (iso: string) => {
  const d = new Date(iso)
  return `${String(d.getFullYear()).slice(2)}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())} (${WEEK[d.getDay()]})`
}
/** 주문번호 HD + YYYYMMDD + 4자리 */
export const orderNo = (o: Order) => {
  const d = new Date(o.createdAt)
  const seq = o.id.replace(/\D/g, '').slice(-4).padStart(4, '0')
  return `HD${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${seq}`
}
/** 김엄마 → 김** */
export const maskName = (n: string) => (n ? n[0] + '**' : '김**')

/** A/S 남은 일수 (없으면 null = 기간 지남) */
export const asDaysLeft = (o: Order) => {
  if (!o.asUntil) return null
  const left = Math.ceil((new Date(o.asUntil).getTime() - Date.now()) / DAY)
  return left > 0 ? left : null
}

/** 데모: 지난 배송 완료 주문 4건 (Figma D-1과 같은 날짜) */
function demoHistory(): Order[] {
  const now = Date.now()
  const r = (name: string) => ({ name, phone: '010-0000-0000', address: '세종특별자치시 시청대로210 000동 000호' })
  const mk = (id: string, arrive: string, name: string, asUntil?: string): Order => ({
    id, status: 'done', step: 4, createdAt: new Date(new Date(arrive).getTime() - 9 * DAY).toISOString(),
    items: ['겨울 이불'], recipient: r(name), arriveAt: arrive, asUntil,
  })
  return [
    mk('HY261020-16', '2026-10-20T12:00:00+09:00', '김엄마', new Date(now + 20 * DAY).toISOString()),
    mk('HY260918-08', '2026-09-18T12:00:00+09:00', '김엄마', new Date(now + 1 * DAY - 60_000).toISOString()),
    mk('HY260811-03', '2026-08-11T12:00:00+09:00', '류아빠'),
    mk('HY260702-21', '2026-07-02T12:00:00+09:00', '김엄마'),
  ]
}

/** 주문내역 목록: 실제 주문 + 데모 지난 주문 */
export function allOrders(): Order[] {
  const mine = storage.getOrders()
  const ids = new Set(mine.map((o) => o.id))
  return [...mine, ...demoHistory().filter((o) => !ids.has(o.id))]
}

export function findOrder(id: string) {
  return allOrders().find((o) => o.id === id)
}
