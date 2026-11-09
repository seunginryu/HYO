import type { HTMLAttributes } from 'react'
import './Card.css'

/** 흰 카드: 테두리 #EDEDED + box shadow + 모서리 4px */
export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...rest} />
}

/** 닫기 X (14×14, #525252) */
export function CloseButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button className={`close-x ${className}`} aria-label="닫기" onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M1.5 1.5L14.5 14.5M14.5 1.5L1.5 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  )
}
