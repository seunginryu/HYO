import './Avatar.css'

/** 기본 프로필(회색 사람) + 연필 배지 (68px) */
export function Avatar({ onEdit, className = '' }: { onEdit?: () => void; className?: string }) {
  return (
    <div className={`avatar ${className}`}>
      <svg width="68" height="68" viewBox="0 0 68 68" aria-hidden>
        <defs>
          <clipPath id="avatar-clip">
            <circle cx="34" cy="34" r="34" />
          </clipPath>
        </defs>
        <circle cx="34" cy="34" r="34" fill="#D9D9D9" />
        <g clipPath="url(#avatar-clip)" fill="#AEAEAE">
          <circle cx="34.5" cy="26.8" r="13.75" />
          <ellipse cx="34" cy="74" rx="27" ry="24" />
        </g>
      </svg>
      <button className="avatar__badge" aria-label="프로필 수정" onClick={onEdit}>
        <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden style={{ marginLeft: -3.5 }}>
          <path d="M10.6 2.2a1.6 1.6 0 0 1 2.3 0l.9.9a1.6 1.6 0 0 1 0 2.3l-7.6 7.6-3.7.9.9-3.7 7.2-8Z" fill="var(--brand-blue)" />
          <path d="M3.3 10.3l2.4 2.4" stroke="#fff" strokeWidth="1.1" />
        </svg>
      </button>
    </div>
  )
}
