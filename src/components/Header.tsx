import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'

type Props = {
  title?: ReactNode
  /** 뒤로가기 표시 (기본 true) */
  back?: boolean
  onBack?: () => void
  right?: ReactNode
  /** 제목 대신 넣을 내용 (홈 로고 등) */
  children?: ReactNode
}

/** 상태바 영역 + 헤더(뒤로가기 < + 제목), 흰 배경 + bar shadow */
export function Header({ title, back = true, onBack, right, children }: Props) {
  const navigate = useNavigate()
  return (
    <div className="hdr-space">
    <header className="hdr">
      <div className="hdr__status" />
      <div className="hdr__row">
        {back && (
          <button
            className="hdr__back"
            aria-label="뒤로가기"
            onClick={() => (onBack ? onBack() : navigate(-1))}
          >
            <svg width="12" height="21" viewBox="0 0 12 21" fill="none" aria-hidden>
              <path d="M10.5 1.5L1.5 10.5L10.5 19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {children ?? <h1 className="hdr__title">{title}</h1>}
        {right && <div className="hdr__right">{right}</div>}
      </div>
    </header>
    </div>
  )
}
