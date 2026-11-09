import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../../components/BottomNav'
import { Header } from '../../components/Header'
import { dayLabel, getNotifications, markRead, type Noti, type NotiKind } from '../../lib/notifications'
import './Notifications.css'

/** 원형 테두리 안 아이콘 (24 그리드, 선 굵기 2) */
const GLYPH: Record<NotiKind, ReactNode> = {
  delivery: (
    <>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </>
  ),
  packing: (
    <>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 7.7 4.73a2 2 0 0 0 2 0L20.7 7" />
      <path d="m7.5 4.27 9 5.15" />
    </>
  ),
  washing: (
    <>
      <path d="M21.8 10A10 10 0 1 1 17 3.34" />
      <path d="m9 11 3 3L22 4" />
    </>
  ),
  pickup: null,
  response: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
}
GLYPH.pickup = GLYPH.packing

/** 캡처에 맞춘 아이콘 크기 (선 굵기는 화면에서 약 1.8pt로 같게) */
const SIZE: Record<NotiKind, number> = { delivery: 30, packing: 27, pickup: 27, washing: 22, response: 25 }

function NotiIcon({ kind, unread }: { kind: NotiKind; unread: boolean }) {
  const s = SIZE[kind]
  return (
    <span className="nt__icon">
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={(1.8 * 24) / s} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {GLYPH[kind]}
      </svg>
      {unread && <span className="nt__dot" aria-label="안 읽음" />}
    </span>
  )
}

/** F 알림: 오늘 / 어제 / n일 전 묶음 */
export default function Notifications() {
  const navigate = useNavigate()
  const [list, setList] = useState(getNotifications)

  const groups: { label: string; items: Noti[] }[] = []
  for (const n of list) {
    const label = dayLabel(n.at)
    const g = groups[groups.length - 1]
    if (g && g.label === label) g.items.push(n)
    else groups.push({ label, items: [n] })
  }

  const open = (n: Noti) => {
    markRead(n.id)
    setList(getNotifications())
    if (n.to) navigate(n.to)
  }

  return (
    <div className="nt">
      <Header title="알림" onBack={() => navigate(-1)} />
      <div className="nt__body">
        {groups.map((g) => (
          <section key={g.label} className="nt__group">
            <h2 className="nt__day">{g.label}</h2>
            <ul className="nt__list">
              {g.items.map((n) => (
                <li key={n.id}>
                  <button className="nt__item" onClick={() => open(n)}>
                    <NotiIcon kind={n.kind} unread={!n.read} />
                    <span className="nt__text">
                      <span className="nt__title">{n.title}</span>
                      <span className="nt__sub">{n.sub}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <BottomNav active="my" />
    </div>
  )
}
