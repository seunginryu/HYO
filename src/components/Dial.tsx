import { useEffect, useRef, useState } from 'react'
import knob from '../assets/dial_knob.png'
import './Dial.css'

/** 단계 라벨 (접수 → 수거 → 세탁중 → 포장 → 배송중) */
const LABELS = ['주문접수', '수거', '세탁중', '포장', '배송중']
/** 각 단계 눈금 각도 (도, 오른쪽=0, 시계방향). Figma D-1-1 Frame 3465600 라벨 위치에서 잼 */
const ANGLES = [158.6, 184, 208.5, 331, 380.7]
const CX = 185.5 // 카드 기준 다이얼 중심
const CY = 134
const ARC_START = 135 // 파란 진행 호 시작 (트랙 왼쪽 아래 끝)
const ARC_MAX = 380.7 + 2
const ARC_LEN = (78.5 * Math.PI * (ARC_MAX - ARC_START)) / 180

const pt = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const
}
const arcPath = (r: number, from: number, to: number) => {
  const [x1, y1] = pt(from, r)
  const [x2, y2] = pt(to, r)
  return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`
}

/** 라벨과 트랙을 잇는 지시선 (카드 기준 좌표, 캡처에서 잼) */
const LEADERS = [
  'M 74 176.5 H 89 L 105 168', // 주문접수
  'M 55.5 129 H 99', // 수거
  'M 65 75 H 89 L 110 89.5', // 세탁중
  'M 305.5 74.5 H 281.5 L 260.5 90', // 포장
  'M 298 176.5 H 283 L 265.5 167.5', // 배송중
]
/** 라벨 위치 (카드 기준, 글자 박스 왼쪽/오른쪽 위) */
const LABEL_POS: { left?: number; right?: number; top: number }[] = [
  { left: 25.5, top: 167.5 },
  { left: 25.5, top: 119 },
  { left: 25.5, top: 66 },
  { right: 21, top: 64 },
  { right: 20, top: 168 },
]

type Props = {
  /** 실제 진행 단계 */
  current: number
  /** 보고 있는 단계 */
  selected: number
  onSelect: (i: number) => void
}

/** 진행 단계 다이얼: 가운데 메탈 원이 회전해서 단계를 가리킴 */
export function Dial({ current, selected, onSelect }: Props) {
  // 화면 진입: 접수에서 현재 단계까지 한 칸씩 (칸당 0.4s), 파란 호도 함께
  const [shown, setShown] = useState(0)
  const [entering, setEntering] = useState(true)
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    let i = 0
    const tick = () => {
      if (i >= current) {
        setEntering(false)
        return
      }
      i += 1
      setShown(i)
      setTimeout(tick, 400)
    }
    const t = setTimeout(tick, 250)
    return () => clearTimeout(t)
  }, [current])

  const pointing = entering ? shown : selected
  const rotation = ANGLES[pointing] - ANGLES[0]
  // 파란 호는 바늘이 가리키는 단계까지 (단계를 누르면 그 단계로 함께 이동)
  const arcEnd = ANGLES[pointing] + 2
  const [tx1, ty1] = pt(133.5, 86.5)
  const [tx2, ty2] = pt(45.7, 86.5)

  return (
    <div className="dial">
      <div className="dial__ring" style={{ left: CX - 74, top: CY - 74 }} />
      <img className="dial__knob" src={knob} alt="" width={110} height={110}
        style={{
          left: CX - 55, top: CY - 55,
          transform: `rotate(${rotation}deg)`,
          transition: `transform ${entering ? '0.4s cubic-bezier(0.22,1,0.36,1)' : '0.5s ease-in-out'}`,
        }} />
      <svg className="dial__svg" width="358" height="258" viewBox="0 0 358 258" aria-hidden>
        {/* 바깥 트랙 (아래쪽이 열린 원) + 끝 눈금 */}
        <path d={arcPath(86.5, 133.5, 405.7)} className="dial__track" />
        <path d={`M ${tx1} ${ty1} L ${pt(130, 92)[0]} ${pt(130, 92)[1]}`} className="dial__track" />
        <path d={`M ${tx2} ${ty2} L ${pt(49, 92)[0]} ${pt(49, 92)[1]}`} className="dial__track" />
        {LEADERS.map((d, i) => <path key={i} d={d} className="dial__leader" />)}
        {/* 파란 진행 호 */}
        <path d={arcPath(78.5, ARC_START, ARC_MAX)} className="dial__arc"
          style={{
            strokeDasharray: ARC_LEN,
            strokeDashoffset: ARC_LEN * (1 - (arcEnd - ARC_START) / (ARC_MAX - ARC_START)),
            transition: `stroke-dashoffset ${entering ? '0.4s cubic-bezier(0.22,1,0.36,1)' : '0.5s ease-in-out'}`,
          }} />
        {/* 단계 눈금 */}
        {ANGLES.map((a, i) => {
          const [x1, y1] = pt(a, 59.5)
          const [x2, y2] = pt(a, 69.5)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={`dial__tick ${i === pointing ? 'is-on' : ''}`} />
        })}
      </svg>
      {LABELS.map((l, i) => (
        <button key={l}
          className={`dial__label ${i === 0 ? 'is-muted' : i > current ? 'is-future' : i === pointing ? 'is-on' : ''}`}
          style={LABEL_POS[i]}
          disabled={i === 0 || i > current || entering}
          onClick={() => onSelect(i)}>
          {l}
        </button>
      ))}
    </div>
  )
}
