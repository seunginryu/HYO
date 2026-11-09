import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Controls.css'

/** 체크박스 (22px, 흰 사각 + box shadow) */
export function Checkbox({
  checked,
  onChange,
  children,
  className = '',
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children?: ReactNode
  className?: string
}) {
  return (
    <label className={`chk ${checked ? 'is-on' : ''} ${className}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="chk__box" aria-hidden>
        <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
          <path d="M1.5 5.5L5.2 9L12.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {children && <span className="chk__label">{children}</span>}
    </label>
  )
}

/** 라디오 (24px 원) */
export function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className={`radio ${checked ? 'is-on' : ''}`}>
      <input type="radio" checked={checked} onChange={onChange} aria-label={label} />
      <span className="radio__dot" aria-hidden />
    </label>
  )
}

/** 선택지 버튼 (연락 방법 / 세탁물 종류 칩). 선택되면 파란 테두리 */
export function OptionButton({
  selected,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return <button type="button" className={`optbtn ${selected ? 'is-on' : ''} ${className}`} aria-pressed={selected} {...rest} />
}
