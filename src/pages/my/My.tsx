import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { BottomNav } from '../../components/BottomNav'
import { Header } from '../../components/Header'
import { storage } from '../../lib/storage'
import './My.css'

const MENUS = [
  { title: '부모님 정보 관리', sub: '부모님 정보를 수정, 추가 할 수 있어요.', to: '/my/parents' },
  { title: '주문 내역 관리', sub: '주문 진행 상황을 확인하고 관리 할 수 있어요.', to: '/orders' },
  { title: '알림 설정', sub: '진행과정 등 알림 수신 여부를 관리할 수 있어요.', to: '/my/notifications' },
]

export const Chevron = () => (
  <svg className="chev-r" width="12" height="22" viewBox="0 0 12 22" fill="none" aria-hidden>
    <path d="M1.5 1.5L10.5 11L1.5 20.5" stroke="var(--brand-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** 가입한 날을 1일째로 */
const daysWith = (iso?: string) => {
  if (!iso) return 1
  const start = new Date(iso)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(1, Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1)
}

/** E-1 마이페이지 */
export default function My() {
  const navigate = useNavigate()
  const user = storage.getUser()
  return (
    <div className="my">
      <Header title="마이페이지" onBack={() => navigate('/home')} />
      <div className="my__body">
        <div className="my__profile">
          <Avatar className="my__avatar" onEdit={() => navigate('/my/profile')} />
          <p className="my__name">
            <b>{user?.name ?? '효도어'}</b> 님
          </p>
          <p className="my__sub">
            효도어와 함께 <span>효도한 지 {daysWith(user?.joinedAt)}일 째</span>
          </p>
        </div>
        <div className="my__menus">
          {MENUS.map((m) => (
            <button key={m.to} className="my__menu" onClick={() => navigate(m.to)}>
              <span className="my__menuTitle">{m.title}</span>
              <span className="my__menuSub">{m.sub}</span>
              <Chevron />
            </button>
          ))}
        </div>
      </div>
      <BottomNav active="my" />
    </div>
  )
}
