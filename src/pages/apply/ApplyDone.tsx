import { useNavigate } from 'react-router-dom'
import { ApplyLayout } from '../../components/ApplyLayout'
import { Button } from '../../components/Button'
import { JumpCharacter } from '../../components/Characters'
import jumpChar from '../../assets/char/character_jump.png'
import './Apply.css'

/** C-4-2 신청 완료 (점프 모션) */
export default function ApplyDone() {
  const navigate = useNavigate()
  const home = () => navigate('/home', { replace: true })
  return (
    <ApplyLayout title="신청 완료" step={4} label="신청완료!" nav={false} onBack={home}
      cta={<Button onClick={home}>홈으로 돌아가기</Button>}>
      <div className="c42">
        <JumpCharacter src={jumpChar} w={162.5} h={142.5} style={{ position: 'absolute', left: 118 - 16, top: 321 - 174 }} />
        <h2 className="c42__title">신청이 완료 됐어요!</h2>
        <p className="c42__desc">
          아래의 버튼을 눌러 접수 내역과
          <br />
          진행 상황을 확인 할 수 있어요!
        </p>
      </div>
    </ApplyLayout>
  )
}
