import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { BottomNav } from '../../components/BottomNav'
import { Button } from '../../components/Button'
import { Header } from '../../components/Header'
import { Modal } from '../../components/Overlay'
import { TextField } from '../../components/TextField'
import { storage } from '../../lib/storage'
import './My.css'

export const PencilIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
    <path d="M12.2 2.6l3.2 3.2L6 15.2l-3.9.7.7-3.9 9.4-9.4Z" stroke="#8C8C8C" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

/** 데이터 초기화 암호 (데모용: 화면에서 막는 장치일 뿐, 코드에서 보이는 값이라 보안용은 아님) */
const RESET_PASSWORD = 'seunghyo12!'

/** E-2 내 정보 수정 */
export default function Profile() {
  const navigate = useNavigate()
  const user = storage.getUser()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')

  const save = () => {
    if (!user) return
    storage.setUser({ ...user, name: name.trim() || user.name, email: email.trim() || user.email })
  }
  // 데모: 로그아웃은 첫 화면으로만 (데이터는 그대로, "효도 시작하기"로 이어서)
  const logout = () => navigate('/', { replace: true })

  // 데이터 초기화: 암호 확인 후 모든 데이터를 지우고 첫 화면으로
  const [resetOpen, setResetOpen] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const openReset = () => {
    setPw('')
    setPwError(false)
    setResetOpen(true)
  }
  const confirmReset = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw !== RESET_PASSWORD) {
      setPwError(true)
      return
    }
    storage.resetAll()
    setResetOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <div className="my">
      <Header title="내 정보 수정" onBack={() => navigate('/my')} />
      <div className="my__body my__body--profile">
        <div className="my__profile">
          <Avatar className="my__avatar" />
          <p className="my__name">
            <b>{name || user?.name}</b> 님
          </p>
        </div>
        <div className="my__fields">
          <TextField className="tf--50" label="이름" value={name} onChange={(e) => setName(e.target.value)} onBlur={save}
            trailing={<PencilIcon />} autoComplete="name" />
          <TextField className="tf--50" label="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            onBlur={save} trailing={<PencilIcon />} autoComplete="email" />
          <button className="my__logout" onClick={logout}>로그아웃</button>
          <button className="my__reset" onClick={openReset}>데이터 초기화</button>
        </div>
      </div>
      <BottomNav active="my" />

      <Modal open={resetOpen} onClose={() => setResetOpen(false)}>
        <form className="reset-pop" onSubmit={confirmReset}>
          <h2 className="reset-pop__title">데이터 초기화</h2>
          <p className="reset-pop__desc">
            주문·편지·부모님 정보 등 모든 데이터가 지워지고
            <br />
            처음 상태로 돌아가요. 암호를 입력해 주세요.
          </p>
          <input
            className={`reset-pop__input ${pwError ? 'is-error' : ''}`}
            type="password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value)
              setPwError(false)
            }}
            placeholder="암호"
            autoComplete="off"
            autoFocus
            aria-label="암호"
          />
          <p className="reset-pop__error" aria-live="polite">{pwError ? '암호가 맞지 않아요.' : ''}</p>
          <Button type="submit" className="reset-pop__btn" disabled={!pw}>
            초기화하기
          </Button>
        </form>
      </Modal>
    </div>
  )
}
