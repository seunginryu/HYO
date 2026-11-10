import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplyLayout } from '../../components/ApplyLayout'
import { Button } from '../../components/Button'
import { BubbleCharacter } from '../../components/Characters'
import { OptionButton } from '../../components/Controls'
import { Modal } from '../../components/Overlay'
import { getDraft, markSent, restartWaiting } from '../../lib/apply'
import phoneChar from '../../assets/char/character_phone.png'
import checkBubble from '../../assets/char/bubble_only.png'
import './Apply.css'

/** C-2 (2/4) 부모님께 설문 전송 + C-2-1 발송 완료 모달 */
export default function ApplyContact() {
  const navigate = useNavigate()
  const d = getDraft()
  const [sent, setSent] = useState<'sms' | 'kakao' | null>(null)

  const send = (via: 'sms' | 'kakao') => {
    markSent(via)
    setSent(via)
  }
  // 팝업을 닫으면 C-3(응답 대기)부터 보여주고, 그때부터 15초 뒤 응답 도착
  const goWait = () => {
    restartWaiting()
    navigate('/apply/wait')
  }

  return (
    <ApplyLayout title="세탁 신청" step={2} onBack={() => navigate('/apply')}
      cta={<Button onClick={() => (getDraft().sentAt ? navigate('/apply/wait') : send('sms'))}>다음 단계</Button>}>
      <div className="c2">
        <div className="c2__who">
          <p className="c2__name">{d.parentName || '김엄마'}</p>
          <p className="c2__phone">{d.phone || '010-1234-5678'}</p>
        </div>
        <p className="c2__desc">
          부모님께 설문지를 전송하여
          <br />
          희망하시는 수거 일정을 여쭙습니다.
        </p>
        <p className="c2__ask">이 번호가 맞나요?</p>
        <div className="c2__opts">
          {/* 연락처 앱 연결 전: 눌러도 이동하지 않음 */}
          <OptionButton onClick={() => {}}>번호가 달라요. 연락처에서 직접찾기</OptionButton>
          <OptionButton onClick={() => send('sms')}>문자로 보내기</OptionButton>
          <OptionButton onClick={() => send('kakao')}>카카오톡으로 보내기</OptionButton>
        </div>
      </div>

      <Modal open={!!sent} onClose={goWait}>
        <div className="c21">
          <BubbleCharacter body={phoneChar} bubble={checkBubble}
            bodyPos={{ x: 154.5, y: 300, w: 83.5, h: 123.5 }} bubblePos={{ x: 143, y: 297, w: 93, h: 129 }} bubbleOrigin="16% 45%"
            style={{ position: 'absolute', left: 143 - 36 - 1, top: 297 - 260 - 1 }} />
          <h2 className="c21__title">{sent === 'kakao' ? '카카오톡' : '문자'} 발송 완료!</h2>
          <p className="c21__desc">
            설문이 부모님께 도착했어요!
            <br />
            이 핑계로 부모님께 전화드리는 건 어때요?
          </p>
          <button type="button" className="c21__call" onClick={() => navigate('/apply/call')}>전화로 확인하기</button>
        </div>
      </Modal>
    </ApplyLayout>
  )
}
