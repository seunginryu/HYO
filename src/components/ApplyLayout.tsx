import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { Header } from './Header'
import './ApplyLayout.css'

type Props = {
  title: string
  step: 1 | 2 | 3 | 4
  /** 진행 라벨 (기본: "신청완료 까지 n/4") */
  label?: string
  labelBlue?: boolean
  /** 하단 고정 버튼 */
  cta?: ReactNode
  /** 하단 탭바 표시 (C-4-2 신청 완료에는 없음) */
  nav?: boolean
  onBack?: () => void
  children: ReactNode
}

/** 세탁 신청 공통 틀: 헤더 + "신청완료까지 n/4" + 4칸 진행 바 + 하단 고정 버튼 + 탭바 */
export function ApplyLayout({ title, step, label, labelBlue, cta, nav = true, onBack, children }: Props) {
  return (
    <div className="apply">
      <Header title={title} onBack={onBack} />
      <div className="apply__progress">
        <p className={`apply__label ${labelBlue ? 'is-blue' : ''}`}>{label ?? `신청완료 까지 ${step}/4`}</p>
        <div className="apply__bars">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={i <= step ? 'is-done' : ''} />
          ))}
        </div>
      </div>
      <main className="apply__body">{children}</main>
      {cta && <div className="apply__cta">{cta}</div>}
      {nav && <BottomNav active="apply" />}
    </div>
  )
}
