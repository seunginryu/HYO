import { useId } from 'react'
import { LOGO_SYMBOL_D, LOGO_TYPE_D } from './logoPaths'
import './Logo.css'

type Props = {
  /** 렌더 폭(px). 원본 200×58 */
  width?: number
  /** 스플래시 순차 등장 모션 */
  animated?: boolean
  className?: string
}

/** HYO 콤비네이션 로고 (심볼 + 로고타입). 색: brand blue */
export function Logo({ width = 200, animated = false, className = '' }: Props) {
  const clipId = `logo-clip-${useId().replace(/:/g, '')}`
  return (
    <svg
      className={`logo ${animated ? 'logo--animated' : ''} ${className}`}
      width={width}
      height={(width * 58) / 200}
      viewBox="0 0 200 58"
      fill="none"
      role="img"
      aria-label="HYO"
    >
      <defs>
        {/* 글자가 심볼 뒤에서 빠져나오도록, 심볼 중심보다 오른쪽만 보이게 */}
        <clipPath id={clipId}>
          <rect className="logo__reveal" x="28.5" y="-4" width="200" height="66" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g className="logo__type">
          {LOGO_TYPE_D.map((d, i) => (
            <path key={i} d={d} fill="var(--brand-blue)" />
          ))}
        </g>
      </g>
      <g className="logo__symbol-pos">
        <path className="logo__symbol" d={LOGO_SYMBOL_D} fill="var(--brand-blue)" />
      </g>
    </svg>
  )
}

/** 심볼만 */
export function LogoSymbol({ size = 58, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 58 58" fill="none" aria-hidden>
      <path d={LOGO_SYMBOL_D} fill="var(--brand-blue)" />
    </svg>
  )
}
