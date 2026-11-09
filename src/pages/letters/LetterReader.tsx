import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Envelope } from '../../components/Envelope'
import { fmtLetterDate, type BoxLetter } from '../../lib/letters'

export type ReaderStart = { x: number; y: number; rotate: number; scale: number; spaced?: boolean }

/** 봉투 가운데: 화면 가운데 + 64.5 (G-1-2) */
const CENTER_DY = 64.5
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * G-1-2 → G-1-3 → G-1-4 편지 열람.
 * step 0 원래 자리 / 1 가운데로 이동·확대 / 2 뚜껑 열림·편지지 나옴 / 3 편지지 펼침
 */
export function LetterReader({ letter, start, onClosed }: { letter: BoxLetter; start: ReaderStart; onClosed: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  /** 닫을 때: 뚜껑을 닫기 전에 편지지를 봉투 속으로 먼저 넣음 */
  const [tucked, setTucked] = useState(false)
  const [from, setFrom] = useState({ dx: 0, dy: 0 })
  const busy = useRef(true)

  useLayoutEffect(() => {
    const r = root.current!.getBoundingClientRect()
    setFrom({ dx: start.x - (r.left + r.width / 2), dy: start.y - (r.top + r.height / 2 + CENTER_DY) })
  }, [start])

  useEffect(() => {
    let alive = true
    ;(async () => {
      await sleep(30)
      if (!alive) return
      setStep(1)
      await sleep(430)
      if (!alive) return
      setStep(2)
      await sleep(560)
      if (!alive) return
      setStep(3)
      await sleep(450)
      busy.current = false
    })()
    return () => {
      alive = false
    }
  }, [])

  const close = async () => {
    if (busy.current) return
    busy.current = true
    // 편지지가 봉투 속으로 완전히 들어간 뒤 뚜껑을 닫음
    setTucked(true)
    setStep(2)
    await sleep(520)
    setStep(1)
    await sleep(520)
    setStep(0)
    await sleep(420)
    onClosed()
  }

  const boxTransform =
    step === 0
      ? `translate(${from.dx}px, ${from.dy}px) rotate(${start.rotate}deg) scale(${start.scale})`
      : step >= 2
        ? 'translateY(11.5px)'
        : 'none'

  return (
    <div ref={root} className={`lr ${tucked ? 'is-tucked' : ''}`} data-step={step} role="dialog" aria-modal aria-label="편지 읽기">
      <div className="lr__dim" onClick={() => step === 3 && close()} />
      <div className="lr__box" style={{ transform: boxTransform }}>
        <Envelope
          color={letter.color}
          date={fmtLetterDate(letter.date, step === 0 && !!start.spaced)}
          label={letter.label}
          datePos={step === 0 ? 'top' : 'bottom'}
          paper={
            <div className="lr__paper">
              <div className="lr__content">
                <p className="lr__date">{fmtLetterDate(letter.date)}</p>
                {letter.photo && <img className="lr__photo" src={letter.photo} alt="첨부 사진" />}
                <p className="lr__text">{letter.text}</p>
                {letter.sign && <p className="lr__sign">{letter.sign}</p>}
              </div>
            </div>
          }
        />
      </div>
      <button className="lr__back" onClick={close} tabIndex={step === 3 ? 0 : -1}>
        &lt; 다른 편지 읽기
      </button>
    </div>
  )
}
