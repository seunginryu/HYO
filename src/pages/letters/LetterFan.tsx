import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Envelope } from '../../components/Envelope'
import { fmtLetterDate, type BoxLetter } from '../../lib/letters'

/* 부채꼴 기준(G-1, pt): 축 (148, 화면 아래 + 13), 반지름 283, 카드 간격 19°, 카드 117.6×202.5 */
const AXIS_X = 148
const AXIS_BELOW = 13
const R = 283
const STEP = 19
const PHASE = 6
const W = 117.6
const H = 202.5
const S = W / 208
/** 드래그: 이 거리(px)만큼 움직이면 한 칸 */
const PX_PER_SLOT = 90
/** 자동 회전 속도 (칸/초) */
const AUTO = 0.18
/** 손을 떼고 다시 자동 회전하기까지 */
const RESUME_MS = 2000
/** 첫 탭: 고른 카드가 가운데로 오는 시간 */
const CENTER_MS = 550
/** 화면에 그리는 각도 범위 */
const MIN_ANGLE = -75
const MAX_ANGLE = 95

export type FanOpen = { letter: BoxLetter; x: number; y: number; rotate: number; scale: number }

type Props = {
  letters: BoxLetter[]
  /** 열람 중이면 회전을 멈추고 그 카드는 숨김 */
  openSlot: number | null
  onOpen: (slot: number, info: FanOpen) => void
}

const mod = (a: number, n: number) => ((a % n) + n) % n

/** G-1 편지 부채꼴: 천천히 회전, 왼쪽으로 드래그, 무한 순환, 두 번 탭하면 열람 */
export function LetterFan({ letters, openSlot, onOpen }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const [axisY, setAxisY] = useState(600)
  const [phi, setPhi] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  /** 가운데로 옮긴 뒤에 튀어나옴 */
  const [lifted, setLifted] = useState<number | null>(null)

  // 애니메이션 상태 (렌더와 무관)
  const st = useRef({
    phi: 0,
    mode: 'auto' as 'auto' | 'drag' | 'settle' | 'center',
    // 선택한 카드를 가운데로 옮기는 애니메이션
    from: 0, t0: 0, dur: 550,
    target: 0,
    resumeAt: 0,
    // 드래그
    id: -1, x0: 0, phi0: 0, moved: false, downSlot: null as number | null,
    hist: [] as { t: number; x: number }[],
  })
  const paused = selected !== null || openSlot !== null
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setAxisY(el.clientHeight + AXIS_BELOW)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const s = st.current
      if (s.mode === 'center') {
        // 부채꼴을 돌려 고른 카드를 가운데(기준 각)로 (0.55초, 감속)
        const p = Math.min(1, (now - s.t0) / s.dur)
        const e = 1 - Math.pow(1 - p, 3)
        s.phi = s.from + (s.target - s.from) * e
        if (p >= 1) {
          s.mode = 'auto'
          setLifted(s.target)
        }
      } else if (s.mode === 'settle') {
        const diff = s.target - s.phi
        s.phi += diff * Math.min(1, dt * 9)
        if (Math.abs(diff) < 0.002) {
          s.phi = s.target
          s.mode = 'auto'
          s.resumeAt = now + RESUME_MS
        }
      } else if (s.mode === 'auto' && !pausedRef.current && now >= s.resumeAt) {
        s.phi += AUTO * dt
      }
      setPhi(s.phi)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // 열람을 닫으면 선택 해제 후 잠시 뒤 다시 회전
  const prevOpen = useRef(openSlot)
  useEffect(() => {
    if (prevOpen.current !== null && openSlot === null) {
      setSelected(null)
      st.current.resumeAt = performance.now() + 1200
    }
    prevOpen.current = openSlot
  }, [openSlot])

  const n = letters.length
  const angleOf = (k: number) => (k - phi) * STEP + PHASE
  const kMin = Math.floor(phi + (MIN_ANGLE - PHASE) / STEP)
  const kMax = Math.ceil(phi + (MAX_ANGLE - PHASE) / STEP)
  const slots: number[] = []
  if (n) for (let k = kMin; k <= kMax; k++) slots.push(k)

  const slotAt = (t: EventTarget | null) => {
    const el = (t as HTMLElement | null)?.closest?.('[data-slot]') as HTMLElement | null
    return el ? Number(el.dataset.slot) : null
  }

  const onDown = (e: React.PointerEvent) => {
    if (openSlot !== null) return
    const s = st.current
    s.id = e.pointerId
    s.x0 = e.clientX
    s.phi0 = s.phi
    s.moved = false
    s.downSlot = slotAt(e.target)
    s.hist = [{ t: performance.now(), x: e.clientX }]
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    const s = st.current
    if (e.pointerId !== s.id) return
    const dx = e.clientX - s.x0
    if (!s.moved && Math.abs(dx) > 6) {
      s.moved = true
      s.mode = 'drag'
      setSelected(null)
    }
    if (s.moved) {
      s.phi = s.phi0 - dx / PX_PER_SLOT
      const now = performance.now()
      s.hist.push({ t: now, x: e.clientX })
      s.hist = s.hist.filter((h) => now - h.t < 120)
    }
  }
  const onUp = (e: React.PointerEvent) => {
    const s = st.current
    if (e.pointerId !== s.id) return
    s.id = -1
    if (s.moved) {
      // 관성 + 가장 가까운 편지 위치로 스냅
      const h = s.hist
      const v = h.length > 1 ? -(h[h.length - 1].x - h[0].x) / PX_PER_SLOT / Math.max(0.016, (h[h.length - 1].t - h[0].t) / 1000) : 0
      s.target = Math.round(s.phi + Math.max(-3, Math.min(3, v * 0.25)))
      s.mode = 'settle'
      return
    }
    // 탭
    const k = s.downSlot
    if (k === null) {
      if (selected !== null) {
        setSelected(null)
        s.resumeAt = performance.now() + 800
      }
      return
    }
    if (k === selected) {
      const card = box.current?.querySelector(`[data-slot="${k}"] .fan__lift`) as HTMLElement | null
      const r = card?.getBoundingClientRect()
      if (!r) return
      onOpen(k, {
        letter: letters[mod(k, n)],
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        rotate: angleOf(k) - 90,
        scale: S * 1.02,
      })
    } else {
      setSelected(k)
      setLifted(null)
      s.from = s.phi
      s.target = k
      s.t0 = performance.now()
      // 이미 가운데 가까우면 짧게 (최소 0.15초)
      s.dur = Math.max(150, CENTER_MS * Math.min(1, Math.abs(k - s.phi)))
      s.mode = 'center'
    }
  }

  return (
    <div
      ref={box}
      className="fan"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {slots.map((k, i) => {
        const l = letters[mod(k, n)]
        return (
          <div
            key={k}
            data-slot={k}
            className={`fan__card ${k === selected && k === lifted ? 'is-up' : ''} ${k === openSlot ? 'is-hidden' : ''}`}
            style={{
              left: AXIS_X - W / 2,
              top: axisY - R - H / 2,
              width: W,
              height: H,
              zIndex: i + 1,
              transformOrigin: `${W / 2}px ${R + H / 2}px`,
              transform: `rotate(${angleOf(k)}deg)`,
            }}
          >
            <div className="fan__lift">
              <Envelope
                color={l.color}
                date={fmtLetterDate(l.date, true)}
                label={l.label}
                style={{
                  position: 'absolute',
                  left: (W - 358) / 2,
                  top: (H - 208) / 2,
                  transform: `rotate(-90deg) scale(${S})`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
