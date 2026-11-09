import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import './TextField.css'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode
  /** 주소 입력처럼 오른쪽 아이콘(검색 등) */
  trailing?: ReactNode
}

export function TextField({ label, trailing, className = '', id, ...rest }: Props) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={`tf ${className}`}>
      {label && (
        <label className="tf__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={`tf__box ${trailing ? 'tf__box--trailing' : ''}`}>
        <input id={inputId} className="tf__input" {...rest} />
        {trailing && <span className="tf__trailing">{trailing}</span>}
      </div>
    </div>
  )
}
