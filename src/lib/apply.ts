// 세탁 신청 진행 상태. 결제가 끝나면 주문으로 옮기고 지움. (보관 방식은 kv.ts)
import { kv } from './kv'
import { storage, type Order } from './storage'

export const ITEM_OPTIONS = ['여름 이불', '겨울 이불', '베개'] as const
export type ItemOption = (typeof ITEM_OPTIONS)[number]

/** 품목 가격 (Figma: 겨울이불 1채 6,000원. 나머지는 임시값) */
export const ITEM_PRICE: Record<ItemOption, number> = { '여름 이불': 5000, '겨울 이불': 6000, 베개: 3000 }
export const SHIPPING_FEE = 5000
export const PACKAGE_DEPOSIT = 5000

export type Letter = {
  id: string
  paper: 'blue' | 'lime' | 'navy'
  text: string
  photo?: string // data URL
  createdAt: string
  from: 'me' | 'mom' | 'dad'
  orderId?: string
}

export type ApplyDraft = {
  parentName: string
  phone: string
  zip: string
  address: string
  items: ItemOption[]
  sentVia?: 'sms' | 'kakao'
  sentAt?: string
  orderId?: string
  letterId?: string
}

const KEY = 'hyo.applyDraft'
const LETTERS = 'hyo.letters'
/** 데모: 설문을 보내고 이 시간이 지나면 부모님 응답이 도착한 것으로 처리 */
export const DEMO_RESPONSE_MS = 15000

const empty: ApplyDraft = { parentName: '', phone: '', zip: '', address: '', items: [] }

export function getDraft(): ApplyDraft {
  try {
    const raw = kv.get(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : { ...empty }
  } catch {
    return { ...empty }
  }
}
export function saveDraft(d: ApplyDraft) {
  try {
    kv.set(KEY, JSON.stringify(d))
  } catch {
    /* ignore */
  }
}
export function clearDraft() {
  try {
    kv.remove(KEY)
  } catch {
    /* ignore */
  }
}

export function hasResponse(d: ApplyDraft) {
  return !!d.sentAt && Date.now() - new Date(d.sentAt).getTime() >= DEMO_RESPONSE_MS
}

/** 데모용 부모님 응답: 보낸 날 기준 사흘 뒤 14~16시 수거, 수량은 품목당 1 */
export function demoResponse(d: ApplyDraft) {
  const base = d.sentAt ? new Date(d.sentAt) : new Date()
  const pickup = new Date(base.getTime() + 3 * 86_400_000)
  const items = d.items.length ? d.items : (['겨울 이불'] as ItemOption[])
  const quilts = items.filter((i) => i !== '베개').map((i) => `${i} 1채`)
  const pillow = items.includes('베개') ? '베개커버 1개' : '베개커버 위탁 안 함'
  return {
    itemsText: [...quilts, pillow].join(' / '),
    schedule: `${pickup.getMonth() + 1}월 ${pickup.getDate()}일, 14시 - 16시`,
    request: '수거 가방이 없는 경우 연락주세요.',
    lines: items.map((i) => ({ label: `${i.replace(' ', '')} 1${i === '베개' ? '개' : '채'}`, price: ITEM_PRICE[i] })),
  }
}

export function newId(prefix: string) {
  const n = new Date()
  const p = (v: number) => String(v).padStart(2, '0')
  return `${prefix}${String(n.getFullYear()).slice(2)}${p(n.getMonth() + 1)}${p(n.getDate())}-${Math.floor(Math.random() * 90 + 10)}`
}

const recipientOf = (d: ApplyDraft) => ({ name: d.parentName, phone: d.phone, address: [d.zip, d.address].filter(Boolean).join(' ') })
/** 도착 예정: 수거일(보낸 날 + 3일) + 6일 */
const arriveOf = (d: ApplyDraft) => new Date((d.sentAt ? new Date(d.sentAt) : new Date()).getTime() + 9 * 86_400_000)

/** 설문 발송: '신청 중' 주문을 만들어 둠 */
export function markSent(via: 'sms' | 'kakao') {
  const d = getDraft()
  const orderId = d.orderId ?? newId('HY')
  // 보낼 때마다 응답 대기를 새로 시작
  const next = { ...d, sentVia: via, sentAt: new Date().toISOString(), orderId }
  saveDraft(next)
  const orders = storage.getOrders().filter((o) => o.id !== orderId)
  const o: Order = { id: orderId, status: 'requesting', step: 0, createdAt: new Date().toISOString(), items: next.items, recipient: recipientOf(next), applyStep: 2, arriveAt: arriveOf(next).toISOString() }
  storage.setOrders([...orders, o])
  return next
}

/** 응답 대기 시작 시각을 지금으로 (발송 완료 팝업을 닫는 순간부터 15초) */
export function restartWaiting() {
  saveDraft({ ...getDraft(), sentAt: new Date().toISOString() })
}

/** 결제 완료: 주문을 '접수됨'으로 */
export function completePayment() {
  const d = getDraft()
  const orders = storage.getOrders()
  const id = d.orderId ?? newId('HY')
  const rest = orders.filter((o) => o.id !== id)
  storage.setOrders([...rest, { id, status: 'accepted', step: 0, createdAt: new Date().toISOString(), items: d.items, recipient: recipientOf(d), arriveAt: arriveOf(d).toISOString() }])
  clearDraft()
}

export function getLetters(): Letter[] {
  try {
    return JSON.parse(kv.get(LETTERS) || '[]')
  } catch {
    return []
  }
}
export function saveLetter(l: Letter) {
  const all = getLetters().filter((x) => x.id !== l.id)
  try {
    kv.set(LETTERS, JSON.stringify([...all, l]))
  } catch {
    /* 사진이 너무 크면 저장 실패할 수 있음 */
    kv.set(LETTERS, JSON.stringify([...all, { ...l, photo: undefined }]))
  }
}
