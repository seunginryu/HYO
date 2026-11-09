import { kv } from './kv'
import { DEMO_RESPONSE_MS, getDraft, hasResponse } from './apply'

export type NotiKind = 'delivery' | 'packing' | 'washing' | 'pickup' | 'response'

export type Noti = {
  id: string
  kind: NotiKind
  title: string
  sub: string
  at: number
  read: boolean
  /** 눌렀을 때 갈 곳 (없으면 읽음 처리만) */
  to?: string
}

const READ = 'hyo.notiRead'
const LIVE = 'hyo.notiLive'
const DAY = 86_400_000
/** 데모 진행 알림이 가리키는 주문 (주문내역의 가장 최근 완료 주문) */
const DEMO_ORDER = '/orders/HY261020-16'

const getRead = (): string[] => {
  try {
    return JSON.parse(kv.get(READ) ?? '[]')
  } catch {
    return []
  }
}

type Live = { id: string; orderId?: string; at: number }
const getLive = (): Live[] => {
  try {
    return JSON.parse(kv.get(LIVE) ?? '[]')
  } catch {
    return []
  }
}

/** 데모 알림 (Figma F): 오늘 3건은 안 읽음, 어제·2일 전은 읽음 */
function demo(now: number): Omit<Noti, 'read'>[] {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const t = today.getTime()
  // 오늘 알림은 자정~지금 사이 (실제로 새로 온 알림이 항상 위로)
  const half = (r: number) => t + Math.floor((now - t) * r)
  return [
    { id: 'demo-delivery', kind: 'delivery', title: '배송이 시작 됐어요', sub: '안전하게 배송 후 다시 알려드릴게요.', at: half(0.5), to: DEMO_ORDER },
    { id: 'demo-packing', kind: 'packing', title: '세탁 후 포장이 완료됐어요', sub: '곧 배송이 시작됩니다.', at: half(0.4), to: DEMO_ORDER },
    { id: 'demo-washing', kind: 'washing', title: '세탁이 완료됐어요', sub: '진행과정을 사진으로 확인할 수 있어요.', at: half(0.3), to: DEMO_ORDER },
    { id: 'demo-pickup', kind: 'pickup', title: '부모님댁 이불을 수거했어요', sub: '세탁 후 다시 알려드릴게요.', at: t - DAY / 2 },
    { id: 'demo-response', kind: 'response', title: '부모님 응답이 도착했어요', sub: '수량과 일정을 확인하고 신청을 확정하세요.', at: t - DAY - DAY / 2 },
  ]
}
const DEMO_UNREAD = new Set(['demo-delivery', 'demo-packing', 'demo-washing'])

/** 알림 목록 (최신순): 데모 알림 + 실제로 도착한 부모님 응답 */
export function getNotifications(now = Date.now()): Noti[] {
  const read = new Set(getRead())
  const list: Omit<Noti, 'read'>[] = demo(now)
  const d = getDraft()
  const live = getLive()
  if (d.sentAt && hasResponse(d)) {
    const id = `response-${d.orderId ?? d.sentAt}`
    if (!live.some((n) => n.id === id)) {
      live.push({ id, orderId: d.orderId, at: new Date(d.sentAt).getTime() + DEMO_RESPONSE_MS })
      kv.set(LIVE, JSON.stringify(live))
    }
  }
  for (const n of live) {
    // 신청을 확정하기 전엔 응답 화면으로, 확정한 뒤엔 그 주문 상세로
    const pending = !!d.sentAt && d.orderId === n.orderId
    list.push({
      id: n.id,
      kind: 'response',
      title: '부모님 응답이 도착했어요',
      sub: '수량과 일정을 확인하고 신청을 확정하세요.',
      at: n.at,
      to: pending ? '/apply/wait' : n.orderId ? `/orders/${n.orderId}` : undefined,
    })
  }
  return list
    .map((n) => ({ ...n, read: read.has(n.id) || (n.id.startsWith('demo-') && !DEMO_UNREAD.has(n.id)) }))
    .sort((a, b) => b.at - a.at)
}

export function markRead(id: string) {
  const r = getRead()
  if (!r.includes(id)) kv.set(READ, JSON.stringify([...r, id]))
}

export const hasUnread = () => getNotifications().some((n) => !n.read)

/** 날짜 묶음 이름: 오늘 / 어제 / n일 전 */
export function dayLabel(at: number, now = Date.now()) {
  const a = new Date(at)
  a.setHours(0, 0, 0, 0)
  const b = new Date(now)
  b.setHours(0, 0, 0, 0)
  const n = Math.round((b.getTime() - a.getTime()) / DAY)
  return n <= 0 ? '오늘' : n === 1 ? '어제' : `${n}일 전`
}
