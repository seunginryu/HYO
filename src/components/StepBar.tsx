import './StepBar.css'

type Props = {
  labels: string[]
  /** 현재 단계 index (0부터) */
  current: number
  /** 각 점의 가로 위치(px, 바 왼쪽 기준). 없으면 균등 배치 */
  positions?: number[]
  width?: number
}

/** 진행 단계 바: 지난 단계까지 파란 바 + 네이비 점, 남은 단계는 회색 */
export function StepBar({ labels, current, positions, width = 310 }: Props) {
  const pos = positions ?? labels.map((_, i) => ((i + 0.5) * width) / labels.length)
  const next = pos[current + 1]
  // 현재 단계 점을 지나 다음 단계 쪽으로 조금 더 채움 (Figma: 다음 점까지의 약 44%)
  const fill = next !== undefined ? pos[current] + (next - pos[current]) * 0.44 : width
  return (
    <div className="stepbar" style={{ width }}>
      <div className="stepbar__track">
        <div className="stepbar__fill" style={{ width: fill }} />
        {pos.map((x, i) => (
          <span key={i} className={`stepbar__dot ${i <= current ? 'is-done' : ''}`} style={{ left: x }} />
        ))}
      </div>
      <div className="stepbar__labels">
        {labels.map((l, i) => (
          <span key={l} className={`stepbar__label ${i <= current ? 'is-done' : ''}`} style={{ left: pos[i] }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}
