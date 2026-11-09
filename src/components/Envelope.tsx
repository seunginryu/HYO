import { useId, type CSSProperties, type ReactNode } from 'react'
import { FLAP_PATH, POCKET_PATH, SYMBOL_PATHS } from './envelopePaths'
import './Envelope.css'

export type EnvelopeColor = 'blue' | 'lime' | 'navy'

type Props = {
  color: EnvelopeColor
  date: string
  label: string
  /** 날짜 위치: 목록·부채꼴은 왼쪽 위, 열람 화면(G-1-2)은 왼쪽 아래 */
  datePos?: 'top' | 'bottom'
  /** 편지지 (열람 모션에서만) — 봉투 안쪽, 앞주머니 뒤에 놓임 */
  paper?: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * 편지 봉투 358×208. 색은 CSS 변수(--env / --env-sym / --env-text)로 바꿈.
 * 층: 뒷면 → 편지지 → 앞주머니(열렸을 때) → 심볼 → 뚜껑 → 글자
 */
export function Envelope({ color, date, label, datePos = 'top', paper, className = '', style }: Props) {
  const uid = useId().replace(/:/g, '')
  const clip = `envc${uid}`
  const sh = `envs${uid}`
  return (
    <div className={`env env--${color} ${className}`} style={style}>
      <div className="env__back" />
      {paper && <div className="env__paperClip">{paper}</div>}
      <svg className="env__front" width="358" height="208" viewBox="0 0 358 208" aria-hidden>
        <defs>
          <clipPath id={clip}>
            <rect width="358" height="208" rx="4" />
          </clipPath>
          <filter id={sh} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodOpacity="0.2" />
          </filter>
        </defs>
        <g clipPath={`url(#${clip})`} fill="var(--env)">
          <rect x="-25" y="35" width="84" height="308" rx="15" filter={`url(#${sh})`} />
          <rect x="299" y="35" width="84" height="308" rx="15" filter={`url(#${sh})`} />
          <path d={POCKET_PATH} transform="translate(-8 -8)" filter={`url(#${sh})`} />
        </g>
      </svg>
      <div className="env__face">
        <svg className="env__symbol" width="198" height="192" viewBox="0 0 198 192" aria-hidden>
          {SYMBOL_PATHS.map((d, i) => (
            <path key={i} d={d} fill="var(--env-sym)" />
          ))}
        </svg>
      </div>
      <svg className="env__flap" width="358" height="208" viewBox="0 0 358 208" aria-hidden>
        <defs>
          <clipPath id={`${clip}f`}>
            <rect width="358" height="208" rx="4" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip}f)`}>
          <path d={FLAP_PATH} transform="matrix(1 0 0 -1 0 208)" fill="var(--env)" filter={`url(#${sh})`} />
        </g>
      </svg>
      <div className="env__text">
        <span className={`env__date env__date--${datePos}`}>{date}</span>
        <span className="env__label">{label}</span>
      </div>
    </div>
  )
}
