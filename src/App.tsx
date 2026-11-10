import { HashRouter, MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { storage } from './lib/storage'
import Orders from './pages/orders/Orders'
import OrderDetail from './pages/orders/OrderDetail'
import My from './pages/my/My'
import Profile from './pages/my/Profile'
import Parents from './pages/my/Parents'
import NotificationSettings from './pages/my/Notifications'
import Notifications from './pages/notifications/Notifications'
import Letters from './pages/letters/Letters'
import Splash from './pages/onboarding/Splash'
import Home from './pages/home/Home'
import ApplyForm from './pages/apply/ApplyForm'
import ApplyContact from './pages/apply/ApplyContact'
import ApplyCall from './pages/apply/ApplyCall'
import ApplyWait from './pages/apply/ApplyWait'
import ApplyConfirm from './pages/apply/ApplyConfirm'
import ApplyPay from './pages/apply/ApplyPay'
import ApplyDone from './pages/apply/ApplyDone'

// 미리보기(claude.ai 페이지)에서는 주소 해시를 쓸 수 없어 메모리 라우터 사용
const Router = import.meta.env.VITE_PREVIEW ? MemoryRouter : HashRouter

/** 새로고침하면 데이터가 초기화되므로, 계정이 없으면 첫 화면으로 */
function RequireUser({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const open = pathname === '/'
  if (!open && !storage.getUser()) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Router>
      <div className="app-frame">
        <RequireUser>
        <Routes>
          {/* A. 온보딩 */}
          <Route path="/" element={<Splash />} />

          {/* B. 홈 */}
          <Route path="/home" element={<Home />} />
          {/* C. 세탁 신청 */}
          <Route path="/apply" element={<ApplyForm />} />
          <Route path="/apply/contact" element={<ApplyContact />} />
          <Route path="/apply/call" element={<ApplyCall />} />
          <Route path="/apply/wait" element={<ApplyWait />} />
          <Route path="/apply/confirm" element={<ApplyConfirm />} />
          <Route path="/apply/pay" element={<ApplyPay />} />
          <Route path="/apply/done" element={<ApplyDone />} />

          {/* D~G: 다음 단계에서 구현 */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/my" element={<My />} />
          <Route path="/my/profile" element={<Profile />} />
          <Route path="/my/parents" element={<Parents />} />
          <Route path="/my/notifications" element={<NotificationSettings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/letters" element={<Letters />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </RequireUser>
      </div>
    </Router>
  )
}
