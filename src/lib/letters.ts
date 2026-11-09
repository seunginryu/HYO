import { getDraft, getLetters } from './apply'
import { findOrder } from './orders'
import { storage } from './storage'

export type PaperColor = 'blue' | 'lime' | 'navy'

/** 편지보관함에 보이는 편지 한 장 */
export type BoxLetter = {
  id: string
  color: PaperColor
  from: 'me' | 'mom' | 'dad'
  date: string // ISO
  text: string
  photo?: string
  /** 봉투에 쓰는 말: from. 엄마가 / to. 엄마에게 */
  label: string
  /** 편지지 끝 서명 */
  sign: string
}

const d = (s: string) => `${s}T12:00:00+09:00`

/** 데모 편지 (Figma G-2/3/4와 같은 색·날짜) */
const DEMO: BoxLetter[] = [
  {
    id: 'demo-mom-1029', color: 'blue', from: 'mom', date: d('2026-10-29'), label: 'from. 엄마가', sign: '엄마가',
    text: '이불 보내줘서 고마워.\n뽀송뽀송한 이불 덮고 자니까 잠이 솔솔 온다.\n바쁠 텐데 엄마 아빠 챙기느라 애썼어.\n밥 잘 챙겨 먹고, 감기 조심하고.\n주말에 시간 되면 얼굴 보러 와.',
  },
  {
    id: 'demo-dad-1029', color: 'navy', from: 'dad', date: d('2026-10-29'), label: 'from. 아빠가', sign: '아빠가',
    text: '덕분에 겨울 이불 걱정은 덜었다.\n일 너무 무리하지 말고, 건강이 먼저다.\n엄마랑 둘이 잘 지내고 있으니 걱정 말아라.\n다음에 오면 맛있는 거 먹으러 가자.',
  },
  {
    id: 'demo-me-1029', color: 'lime', from: 'me', date: d('2026-10-29'), label: 'to. 엄마에게', sign: '',
    text: '엄마, 날이 많이 추워졌죠?\n겨울 이불 세탁 맡겨뒀어요. 깨끗하게 해서 보내드릴게요.\n요즘 자주 연락 못 드려서 미안해요.\n이번 달엔 꼭 한 번 내려갈게요. 사랑해요!',
  },
  {
    id: 'demo-me-0618a', color: 'blue', from: 'me', date: d('2026-06-18'), label: 'to. 엄마에게', sign: '',
    text: '엄마, 여름 이불로 바꿀 때가 됐어요.\n무거운 이불은 제가 세탁 맡길게요.\n허리 조심하시고 무리하지 마세요.',
  },
  {
    id: 'demo-me-0618b', color: 'navy', from: 'me', date: d('2026-06-18'), label: 'to. 아빠에게', sign: '',
    text: '아빠, 요즘 운동 잘 하고 계세요?\n이불 세탁 맡겼으니 이번 주말엔 푹 쉬세요.\n다음 달에 같이 등산 가요!',
  },
  {
    id: 'demo-mom-0618', color: 'lime', from: 'mom', date: d('2026-06-18'), label: 'from. 엄마가', sign: '엄마가',
    text: '여름 이불 잘 받았어.\n햇볕 냄새가 나는 것 같아서 기분이 좋더라.\n더운데 물 많이 마시고, 에어컨 바람 너무 쐬지 마.\n항상 고맙다.',
  },
]

/** 내가 쓴 편지(신청 중 작성) + 데모 편지, 최신순 */
export function boxLetters(): BoxLetter[] {
  const draft = getDraft()
  const mine: BoxLetter[] = getLetters().map((l) => {
    const name = (l.orderId && findOrder(l.orderId)?.recipient?.name) || draft.parentName || '부모님'
    return {
      id: l.id, color: l.paper, from: 'me', date: l.createdAt, text: l.text, photo: l.photo,
      label: `to. ${name}${name === '부모님' ? '께' : '님께'}`, sign: storage.getUser()?.name ?? '',
    }
  })
  const me = storage.getUser()?.name ?? ''
  return [...mine, ...DEMO.map((l) => (l.from === 'me' ? { ...l, sign: me } : l))].sort((a, b) => b.date.localeCompare(a.date))
}

/** 26.10.29 (spaced: 26. 10. 29) */
export function fmtLetterDate(iso: string, spaced = false) {
  const t = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  const parts = [String(t.getFullYear()).slice(2), p(t.getMonth() + 1), p(t.getDate())]
  return parts.join(spaced ? '. ' : '.')
}
