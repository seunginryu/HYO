import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Logo } from '../../components/Logo'
import { storage } from '../../lib/storage'
import './Splash.css'

const DEMO_NAME = '김효도'

/** A-1 스플래시 (데모: 로그인 과정 없음) */
export default function Splash() {
  const navigate = useNavigate()
  // 데모: 로그인·회원가입 없이 데모 계정으로 바로 최초 홈
  // 데모: 로그인 없이 시작. 저장된 데이터가 있으면 그대로 이어서 (초기화는 내 정보 수정 > 데이터 초기화)
  const start = () => {
    if (!storage.getUser())
      storage.setUser({ name: DEMO_NAME, email: 'demo@hyodoer.app', provider: 'email', joinedAt: new Date().toISOString() })
    navigate('/home', { replace: true })
  }
  return (
    <main className="splash">
      <div className="splash__brand">
        <Logo animated />
        <p className="splash__copy">
          요즘 내가 부모님께 효도하는
          <br />
          가장 쉽고 빠른 방법
        </p>
      </div>

      <div className="splash__actions">
        <Button variant="gradient" size="md" flowing className="splash__start" onClick={start}>
          효도 시작하기
        </Button>
        {/* 데모: 로그인 과정이 없어 눌러도 넘어가지 않음 */}
        <button className="splash__login" type="button">
          이미 계정이 있다면? 로그인&gt;
        </button>
      </div>
    </main>
  )
}
