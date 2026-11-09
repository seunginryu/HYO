import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplyLayout } from '../../components/ApplyLayout'
import { Button } from '../../components/Button'
import { BubbleCharacter, FloatImage } from '../../components/Characters'
import { Radio } from '../../components/Controls'
import { BottomSheet } from '../../components/Overlay'
import { DEMO_RESPONSE_MS, demoResponse, getDraft, getLetters, hasResponse, newId, saveDraft, saveLetter, type Letter } from '../../lib/apply'
import waitChar from '../../assets/char/character_wait_body.png'
import arriveChar from '../../assets/char/character_arrive.png'
import checkBubble2 from '../../assets/char/bubble2_only.png'
import paperBlue from '../../assets/letter/paper_blue.svg'
import paperLime from '../../assets/letter/paper_lime.svg'
import paperNavy from '../../assets/letter/paper_navy.svg'
import './Apply.css'

const PAPERS = [
  { key: 'blue', label: '블루', src: paperBlue },
  { key: 'lime', label: '라임', src: paperLime },
  { key: 'navy', label: '네이비', src: paperNavy },
] as const

const CameraIcon = () => (
  <svg width="24" height="22" viewBox="0 0 22 20" fill="none" aria-hidden>
    <path d="M2 7.2C2 6 3 5 4.2 5H6.6L8.1 2.8H13.9L15.4 5H17.8C19 5 20 6 20 7.2V16.3C20 17.5 19 18.5 17.8 18.5H4.2C3 18.5 2 17.5 2 16.3V7.2Z"
      stroke="#1C1B1F" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="11" cy="11.6" r="3.5" stroke="#1C1B1F" strokeWidth="1.6" />
    <path d="M18 0.8V4.4M16.2 2.6H19.8" stroke="#1C1B1F" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

/** C-3 (3/4) 부모님 응답 대기 → 응답 도착 · C-3-1/2 편지 바텀시트 */
export default function ApplyWait() {
  const navigate = useNavigate()
  const [d, setD] = useState(getDraft)
  // 응답 도착 시각이 지났는지 (실제 화면 전환은 편지를 다 쓴 뒤)
  const [due, setDue] = useState(() => hasResponse(getDraft()))
  const [sheet, setSheet] = useState<null | 'paper' | 'write' | 'response'>(null)
  const [paper, setPaper] = useState<Letter['paper'] | null>(null)
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState<string>()
  const fileRef = useRef<HTMLInputElement>(null)

  // 데모: 설문을 보낸 뒤 몇 초 지나면 응답 도착
  useEffect(() => {
    if (due) return
    let draft = getDraft()
    if (!draft.sentAt) {
      draft = { ...draft, sentAt: new Date().toISOString() }
      saveDraft(draft)
      setD(draft)
    }
    const left = DEMO_RESPONSE_MS - (Date.now() - new Date(draft.sentAt!).getTime())
    const t = setTimeout(() => setDue(true), Math.max(0, left))
    return () => clearTimeout(t)
  }, [due])

  // 편지를 쓰는 동안(시트가 열려 있는 동안)은 화면을 바꾸지 않음
  const [arrived, setArrived] = useState(due)
  const writing = sheet === 'paper' || sheet === 'write'
  useEffect(() => {
    if (due && !writing) setArrived(true)
  }, [due, writing])

  // 편지 쓰기 시작: 이미 저장한 편지가 있으면 이어서 고침
  const startLetter = () => {
    const saved = d.letterId ? getLetters().find((l) => l.id === d.letterId) : undefined
    if (saved) {
      setPaper(saved.paper)
      setText(saved.text)
      setPhoto(saved.photo)
    }
    setSheet('paper')
  }

  const saveAndClose = () => {
    if (!paper) return
    const letter: Letter = { id: d.letterId ?? newId('L'), paper, text, photo, createdAt: new Date().toISOString(), from: 'me', orderId: d.orderId }
    saveLetter(letter)
    const next = { ...d, letterId: letter.id }
    saveDraft(next)
    setD(next)
    setSheet(null)
  }

  const pickPhoto = (f?: File) => {
    if (!f) return
    const r = new FileReader()
    r.onload = () => setPhoto(String(r.result))
    r.readAsDataURL(f)
  }

  const res = demoResponse(d)

  return (
    <ApplyLayout title="부모님 응답 대기" step={3} labelBlue onBack={() => navigate('/apply/contact')}
      cta={arrived
        ? <Button onClick={() => navigate('/apply/confirm')}>다음 단계</Button>
        : <Button onClick={startLetter}>편지 쓰기</Button>}>
      {!arrived ? (
        <div className="c3">
          <h2 className="c3__head">앗!</h2>
          <p className="c3__sub">
            부모님께서 응답을 완료하기 전에는
            <br />
            다음단계를 진행할 수 없어요
          </p>
          <div className="c3__box">
            <FloatImage src={waitChar} w={82.5} h={122} style={{ position: 'absolute', left: 154 - 16, top: 325 - 304 }} />
            <p className="c3__boxTitle">응답 대기중</p>
            <p className="c3__boxDesc">
              부모님의 응답이 도착하면
              <br />
              푸쉬 알림을 드릴게요!
            </p>
          </div>
          <p className="c3__q">기다리는 동안 편지를 써볼까요?</p>
          <p className="c3__qs">{d.letterId ? '편지를 저장했어요. 다시 눌러 고칠 수 있어요' : '편지는 건너뛰어도 괜찮아요'}</p>
          {/* 사용자 요청: 눌러도 이동하지 않음 */}
          <button className="c3__home" type="button">홈으로 이동하여 대기 &gt;</button>
        </div>
      ) : (
        <div className="c3 c3--arrived">
          <h2 className="c3__head">오!</h2>
          <p className="c3__sub">부모님께서 응답을 완료하여 보내주셨어요.</p>
          <div className="c3__box">
            <BubbleCharacter body={arriveChar} bubble={checkBubble2}
              bodyPos={{ x: 157, y: 295.5, w: 85.5, h: 129 }} bubblePos={{ x: 150, y: 295, w: 112.5, h: 137 }} bubbleOrigin="83% 44%"
              style={{ position: 'absolute', left: 150 - 16, top: 295 - 279 }} />
            <p className="c3__boxTitle">응답 도착!</p>
            <p className="c3__boxDesc">
              부모님의 응답이 도착하여
              <br />
              다음 단계로 넘어갈 수 있어요.
            </p>
          </div>
          <ResponseCard onClick={() => setSheet('response')} sub="부모님이 어떤 내용을 골랐는 지 확인해보세요" />
          <button className="c3__home c3__letter" onClick={startLetter}>
            {d.letterId ? '편지 수정하기' : '편지 작성하기'} &gt;
          </button>
        </div>
      )}

      {/* C-3-1 편지지 고르기 */}
      <BottomSheet open={sheet === 'paper'} onClose={() => setSheet(null)}>
        <div className="sheet-paper">
          <h3 className="sheet__title">편지지를 골라주세요</h3>
          <p className="sheet__desc">
            편지지를 골라주세요.
            <br />
            추후 부모님께 세탁이 완료된 세탁물을 전달할 때
            <br />
            고르신 디자인으로 동봉하여 전달드립니다.
          </p>
          <div className="sheet-paper__list">
            {PAPERS.map((p) => (
              <button key={p.key} className={`sheet-paper__item ${paper === p.key ? 'is-on' : ''}`} onClick={() => setPaper(p.key)}>
                <span className="sheet-paper__thumb"><img src={p.src} alt="" /></span>
                <span className="sheet-paper__label">{p.label}</span>
                <Radio checked={paper === p.key} onChange={() => setPaper(p.key)} label={p.label} />
              </button>
            ))}
          </div>
          <Button className="sheet__btn" onClick={() => paper && setSheet('write')}>다음 단계</Button>
        </div>
      </BottomSheet>

      {/* C-3-2 편지 쓰기 */}
      <BottomSheet open={sheet === 'write'} onClose={() => setSheet(null)}>
        <div className="sheet-write">
          <h3 className="sheet__title">편지를 작성해볼까요?</h3>
          <p className="sheet__desc">편지를 작성하면 세탁 후 배송 시 부모님께 전달해드려요.</p>
          <div className="sheet-write__area">
            <textarea placeholder="내용을 입력하세요." value={text} onChange={(e) => setText(e.target.value)} />
            {photo && <img className="sheet-write__photo" src={photo} alt="첨부한 사진" />}
            <button className="sheet-write__cam" aria-label="사진 첨부" onClick={() => fileRef.current?.click()}>
              <CameraIcon />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickPhoto(e.target.files?.[0])} />
          </div>
          <Button className="sheet__btn" onClick={() => (text.trim() || photo) && saveAndClose()}>편지 저장후 돌아가기</Button>
        </div>
      </BottomSheet>

      {/* 부모님 응답 열람 (Figma 화면 없음: 응답 요약) */}
      <BottomSheet open={sheet === 'response'} onClose={() => setSheet(null)}>
        <ResponseSummary res={res} />
      </BottomSheet>
    </ApplyLayout>
  )
}

export function ResponseCard({ onClick, sub }: { onClick: () => void; sub: string }) {
  return (
    <button className="resp-card" onClick={onClick}>
      <span className="resp-card__title">부모님 응답 열람하기</span>
      <span className="resp-card__sub">{sub}</span>
      <svg className="resp-card__arrow" width="12" height="22" viewBox="0 0 12 22" fill="none" aria-hidden>
        <path d="M1.5 1.5L10.5 11L1.5 20.5" stroke="var(--brand-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export function ResponseSummary({ res }: { res: ReturnType<typeof demoResponse> }) {
  return (
    <div className="sheet-resp">
      <h3 className="sheet__title">부모님 응답</h3>
      <p className="sheet__desc">부모님께서 설문에 이렇게 답해주셨어요.</p>
      <dl className="sheet-resp__list">
        <dt>세탁물</dt><dd>{res.itemsText}</dd>
        <dt>수거 일정</dt><dd>{res.schedule}</dd>
        <dt>요청사항</dt><dd>{res.request}</dd>
      </dl>
    </div>
  )
}
