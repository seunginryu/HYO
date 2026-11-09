import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { BottomNav } from '../../components/BottomNav'
import { Header } from '../../components/Header'
import { TextField } from '../../components/TextField'
import { storage } from '../../lib/storage'
import './My.css'

export const PencilIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
    <path d="M12.2 2.6l3.2 3.2L6 15.2l-3.9.7.7-3.9 9.4-9.4Z" stroke="#8C8C8C" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

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
  const logout = () => {
    storage.clearUser()
    storage.resetActivity()
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
        </div>
      </div>
      <BottomNav active="my" />
    </div>
  )
}
