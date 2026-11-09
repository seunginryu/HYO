import { useNavigate } from 'react-router-dom'
import { getDraft } from '../lib/apply'
import homeOn from '../assets/nav/home_active.png'
import homeOff from '../assets/nav/home_default.png'
import letterOn from '../assets/nav/letter_active.png'
import letterOff from '../assets/nav/letter_default.png'
import applyOn from '../assets/nav/apply_active.png'
import applyOff from '../assets/nav/apply_default.png'
import myOn from '../assets/nav/my_active.png'
import myOff from '../assets/nav/my_default.png'
import './BottomNav.css'

export type NavKey = 'home' | 'letters' | 'apply' | 'my'

const ITEMS: { key: NavKey; label: string; to: string; on: string; off: string; offW: number }[] = [
  { key: 'home', label: '홈', to: '/home', on: homeOn, off: homeOff, offW: 32 },
  { key: 'letters', label: '편지보관함', to: '/letters', on: letterOn, off: letterOff, offW: 32 },
  { key: 'apply', label: '세탁신청', to: '/apply', on: applyOn, off: applyOff, offW: 33 },
  { key: 'my', label: '마이페이지', to: '/my', on: myOn, off: myOff, offW: 32 },
]

/** 하단 탭바: 현재 탭은 파란 원형 아이콘으로 강조 */
export function BottomNav({ active }: { active: NavKey }) {
  const navigate = useNavigate()
  return (
    <nav className="bnav" aria-label="하단 메뉴">
      <div className="bnav__inner">
        {ITEMS.map((it) => {
          const on = it.key === active
          return (
            <button
              key={it.key}
              className={`bnav__item ${on ? 'is-active' : ''}`}
              aria-current={on ? 'page' : undefined}
              onClick={() => !on && navigate(it.key === 'apply' && getDraft().sentAt ? '/apply/wait' : it.to)}
            >
              <span className="bnav__icon">
                {on ? (
                  <img src={it.on} width={48} height={48} alt="" />
                ) : (
                  <img src={it.off} width={it.offW} height={32} alt="" />
                )}
              </span>
              <span className="bnav__label">{it.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
