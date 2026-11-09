import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../../components/BottomNav'
import { Header } from '../../components/Header'
import { Toggle } from '../../components/Toggle'
import { storage } from '../../lib/storage'
import './My.css'

/** E-4 알림 설정 */
export default function NotificationSettings() {
  const navigate = useNavigate()
  const [s, setS] = useState(storage.getNotifySettings)
  const set = (patch: Partial<typeof s>) => {
    const next = { ...s, ...patch }
    setS(next)
    storage.setNotifySettings(next)
  }
  return (
    <div className="my">
      <Header title="알림 설정" onBack={() => navigate('/my')} />
      <div className="my__body my__body--noti">
        <div className="noti__row">
          <span>서비스 진행 알림</span>
          <Toggle label="서비스 진행 알림" checked={s.progress} onChange={(v) => set({ progress: v })} />
        </div>
        <div className="noti__row">
          <span>부모님 응답 알림</span>
          <Toggle label="부모님 응답 알림" checked={s.response} onChange={(v) => set({ response: v })} />
        </div>
        <p className="noti__note">* 기기 알림 권한이 꺼져 있다면 설정에서 켜주세요.</p>
        {/* 기기 설정 화면을 웹에서 열 수 없어 지금은 반응 없음 */}
        <button className="noti__device" aria-disabled>기기 알림 설정 열기</button>
        <div className="noti__info">
          <p className="noti__infoT">알림을 꺼도 확인할 수 있어요</p>
          <p className="noti__infoS">앱 내 주문 현황·알림함에서 확인</p>
        </div>
      </div>
      <BottomNav active="my" />
    </div>
  )
}
