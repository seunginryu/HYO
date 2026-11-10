import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, restartWaiting } from '../../lib/apply'
import './ApplyCall.css'

/** C-2-1 → "전화로 확인하기": 아이폰 통화 화면을 본뜬 가짜 발신 화면. 끊으면 C-2로 */
export default function ApplyCall() {
  const navigate = useNavigate()
  const d = getDraft()
  const name = d.parentName || '김엄마'
  const [sec, setSec] = useState(-1) // -1: 연결 중
  const [speaker, setSpeaker] = useState(false)
  const [mute, setMute] = useState(false)
  const [ending, setEnding] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSec(0), 2400)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (sec < 0 || ending) return
    const t = setTimeout(() => setSec((s) => s + 1), 1000)
    return () => clearTimeout(t)
  }, [sec, ending])

  const hangUp = () => {
    if (ending) return
    setEnding(true)
    // 통화 후 C-2로 돌아온 시점부터 응답 대기 15초를 다시 셈
    restartWaiting()
    setTimeout(() => navigate('/apply/contact', { replace: true }), 700)
  }

  const status = ending
    ? '통화 종료'
    : sec < 0
      ? '통화 연결 중...'
      : `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`

  return (
    <div className={`call${ending ? ' is-ending' : ''}`}>
      <div className="call__bg" aria-hidden />
      <div className="call__top">
        <p className="call__status">{status}</p>
        <h1 className="call__name">{name}</h1>
      </div>

      <div className="call__pad">
        <CallBtn label="스피커" on={speaker} onClick={() => setSpeaker((v) => !v)} icon={<IcoSpeaker />} />
        <CallBtn label="영상 통화" icon={<IcoVideo />} />
        <CallBtn label="소리 끔" on={mute} onClick={() => setMute((v) => !v)} icon={<IcoMute />} />
        <CallBtn label="통화 추가" icon={<IcoAdd />} />
        <div className="call__cell">
          <button type="button" className="call__end" aria-label="통화 끊기" onClick={hangUp}>
            <IcoHandset />
          </button>
          <span className="call__label">종료</span>
        </div>
        <CallBtn label="키패드" icon={<IcoKeypad />} />
      </div>
    </div>
  )
}

function CallBtn({ label, icon, on, onClick }: { label: string; icon: React.ReactNode; on?: boolean; onClick?: () => void }) {
  return (
    <div className="call__cell">
      <button type="button" className={`call__btn${on ? ' is-on' : ''}`} aria-pressed={on} aria-label={label} onClick={onClick}>
        {icon}
      </button>
      <span className="call__label">{label}</span>
    </div>
  )
}

const s = { fill: 'currentColor' }
function IcoSpeaker() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <path {...s} d="M4 12.2h4.6L15 6.6c.7-.6 1.7-.1 1.7.8v17.2c0 .9-1 1.4-1.7.8l-6.4-5.6H4c-.6 0-1-.4-1-1v-5.6c0-.6.4-1 1-1z" />
      <path d="M20.5 11.5a6.4 6.4 0 0 1 0 9M23.8 8.2a11 11 0 0 1 0 15.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
function IcoVideo() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <rect {...s} x="3" y="9" width="18" height="14" rx="3.5" />
      <path {...s} d="M22.5 14.2 28 10.6c.7-.4 1.5.1 1.5.9v9c0 .8-.8 1.3-1.5.9l-5.5-3.6z" />
    </svg>
  )
}
function IcoMute() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <rect {...s} x="11.5" y="3.5" width="9" height="16" rx="4.5" />
      <path d="M7.5 15a8.5 8.5 0 0 0 17 0M16 23.5V28M12 28h8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M6 5l20 22" stroke="var(--call-slash, #4a4a4c)" strokeWidth="5" strokeLinecap="round" />
      <path d="M6 5l20 22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
function IcoAdd() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <circle {...s} cx="13" cy="10.5" r="5.5" />
      <path {...s} d="M2.5 26c0-5.2 4.7-8.6 10.5-8.6s10.5 3.4 10.5 8.6c0 .6-.4 1-1 1h-19c-.6 0-1-.4-1-1z" />
      <path d="M26 9v10M21 14h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
function IcoKeypad() {
  const dots = []
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 3; c++) if (r < 3 || c === 1) dots.push(<circle key={`${r}${c}`} {...s} cx={8 + c * 8} cy={4.5 + r * 7.7} r="2.6" />)
  return <svg viewBox="0 0 32 32" width="32" height="32">{dots}</svg>
}
function IcoHandset() {
  return (
    <svg viewBox="0 0 32 32" width="38" height="38">
      <path {...s} transform="rotate(135 16 16)"
        d="M10.2 4.3c.8-.3 1.7 0 2.1.8l2.2 4.6c.4.8.2 1.7-.5 2.2l-2.3 1.7c1 2.6 3.1 4.9 5.8 6.1l1.8-2.2c.6-.7 1.5-.9 2.3-.5l4.5 2.3c.8.4 1.1 1.3.8 2.1l-1 2.7c-.5 1.4-1.9 2.2-3.4 2C12.6 25.2 6.8 19.4 5.8 9.6c-.2-1.5.7-2.9 2-3.4z" />
    </svg>
  )
}
