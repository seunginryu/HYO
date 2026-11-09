import './SegmentTabs.css'

/** 탭 버튼바 (주문내역·편지보관함·부모님 정보 공용). 선택 탭: 연파랑 배경 + 파란 테두리 */
export function SegmentTabs({ tabs, value, onChange, className = '' }: {
  tabs: string[]
  value: number
  onChange: (i: number) => void
  className?: string
}) {
  return (
    <div className={`segtabs ${className}`} role="tablist" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map((t, i) => (
        <button key={t} role="tab" aria-selected={i === value} className={`segtabs__tab ${i === value ? 'is-on' : ''}`} onClick={() => onChange(i)}>
          {t}
        </button>
      ))}
    </div>
  )
}
