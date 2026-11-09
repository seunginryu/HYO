import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** primary: 브랜드 블루 / lime: 라임 / gradient: 파랑→네이비(스플래시 시작 버튼) */
  variant?: 'primary' | 'lime' | 'gradient' | 'blueGradient'
  /** lg 52px · md 48px */
  size?: 'lg' | 'md'
  /** 가로 그라디언트를 천천히 흐르게 (gradient 전용) */
  flowing?: boolean
}

export function Button({ variant = 'primary', size = 'lg', flowing, className = '', ...rest }: Props) {
  const cls = ['btn', `btn--${variant}`, `btn--${size}`, flowing ? 'btn--flowing' : '', className]
    .filter(Boolean)
    .join(' ')
  return <button type="button" className={cls} {...rest} />
}
