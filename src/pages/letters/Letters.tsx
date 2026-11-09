import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BottomNav } from '../../components/BottomNav'
import { Envelope } from '../../components/Envelope'
import { Header } from '../../components/Header'
import { boxLetters, fmtLetterDate, type BoxLetter } from '../../lib/letters'
import { LetterFan } from './LetterFan'
import { LetterReader, type ReaderStart } from './LetterReader'
import './Letters.css'

const TABS = ['전체', '내가 쓴', '엄마', '아빠'] as const
const FROM = [null, 'me', 'mom', 'dad'] as const
const TITLE = ['모든 편지', '내가 쓴 편지', '엄마한테 받은 편지', '아빠한테 받은 편지']
// '내가 쓴' 보조 문구는 Figma(어머니께 받은…)가 다른 탭 문구라 보낸 편지 문구로 바꿈
const SUB = ['부모님께 보낸 편지를 확인해보세요.', '부모님께 보낸 편지를 확인해보세요.', '어머니께 받은 편지를 확인해보세요.', '아버지께 받은 편지를 확인해보세요.']

/** G 편지보관함: 전체 = 부채꼴(G-1), 나머지 탭 = 세로 목록(G-2/3/4) */
export default function Letters() {
  const navigate = useNavigate()
  const loc = useLocation()
  const initial = Number(new URLSearchParams(loc.search).get('tab') ?? 0)
  const [tab, setTab] = useState(initial >= 0 && initial < 4 ? initial : 0)
  const [reading, setReading] = useState<{ letter: BoxLetter; start: ReaderStart; slot: number | null; id: string } | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  const all = useMemo(boxLetters, [])
  const list = FROM[tab] ? all.filter((l) => l.from === FROM[tab]) : all

  const pick = (i: number) => {
    setTab(i)
    navigate(`/letters?tab=${i}`, { replace: true })
    const el = tabsRef.current?.children[i] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
  }

  const openFromList = (l: BoxLetter, el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    setReading({ letter: l, slot: null, id: l.id, start: { x: r.left + r.width / 2, y: r.top + r.height / 2, rotate: 0, scale: 1 } })
  }

  return (
    <div className={`lt ${tab === 0 ? 'lt--fan' : ''}`}>
      <Header title="편지 보관함" onBack={() => navigate('/home')} />
      <div className="lt__tabs" ref={tabsRef} role="tablist">
        {TABS.map((t, i) => (
          <button key={t} role="tab" aria-selected={i === tab} className={`lt__tab ${i === tab ? 'is-on' : ''}`} onClick={() => pick(i)}>
            {t}
          </button>
        ))}
      </div>
      <h2 className="lt__title">
        {TITLE[tab]} ({list.length}장)
      </h2>
      <p className="lt__sub">{SUB[tab]}</p>

      {list.length === 0 && <p className="lt__empty">아직 편지가 없어요.</p>}

      {tab === 0 ? (
        list.length > 0 && (
          <LetterFan
            letters={list}
            openSlot={reading?.slot ?? null}
            onOpen={(slot, o) => setReading({ letter: o.letter, slot, id: o.letter.id, start: { x: o.x, y: o.y, rotate: o.rotate, scale: o.scale, spaced: true } })}
          />
        )
      ) : (
        <div className="lt__list">
          {list.map((l) => (
            <button
              key={l.id}
              className={`lt__card ${reading?.id === l.id ? 'is-hidden' : ''}`}
              aria-label={`${fmtLetterDate(l.date)} ${l.label} 편지 열기`}
              onClick={(e) => openFromList(l, e.currentTarget)}
            >
              <Envelope color={l.color} date={fmtLetterDate(l.date)} label={l.label} />
            </button>
          ))}
        </div>
      )}

      <BottomNav active="letters" />
      {reading && <LetterReader letter={reading.letter} start={reading.start} onClosed={() => setReading(null)} />}
    </div>
  )
}
