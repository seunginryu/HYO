import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BottomNav } from '../../components/BottomNav'
import { Header } from '../../components/Header'
import { OrderCard } from '../../components/OrderCard'
import { SegmentTabs } from '../../components/SegmentTabs'
import { getDraft, hasResponse } from '../../lib/apply'
import { allOrders } from '../../lib/orders'
import './Orders.css'

const TABS = ['신청중 주문', '접수된 주문', '완료된 주문']
const STATUS = ['requesting', 'accepted', 'done'] as const
const TITLE = ['신청중인 주문', '접수되어 진행중인 주문', '배송 완료된 주문']

/** D-1 주문내역 관리 (신청중 / 접수된 / 완료된 주문) */
export default function Orders() {
  const navigate = useNavigate()
  const loc = useLocation()
  const initial = Number(new URLSearchParams(loc.search).get('tab') ?? 1)
  const [tab, setTab] = useState(Number.isFinite(initial) ? initial : 1)

  const draft = getDraft()
  const list = allOrders()
    .filter((o) => o.status === STATUS[tab])
    .sort((a, b) => (b.arriveAt ?? b.createdAt).localeCompare(a.arriveAt ?? a.createdAt))

  // 완료된 주문은 월별로 묶음
  const groups: { month: string; items: typeof list }[] = []
  for (const o of list) {
    const m = `${new Date(o.arriveAt ?? o.createdAt).getMonth() + 1}월`
    const g = groups.at(-1)
    if (g && g.month === m) g.items.push(o)
    else groups.push({ month: m, items: [o] })
  }

  const resume = () => navigate(draft.sentAt ? '/apply/wait' : '/apply')

  return (
    <div className="orders">
      <Header title="주문내역 관리" onBack={() => navigate(-1)} />
      <div className="orders__body">
        <SegmentTabs tabs={TABS} value={tab} onChange={(i) => {
          setTab(i)
          navigate(`/orders?tab=${i}`, { replace: true })
        }} />
        <h2 className="orders__title">{TITLE[tab]} ({list.length}건)</h2>
        <p className="orders__sub">최근 6개월간의 주문내역을 확인 할 수 있습니다.</p>

        {list.length === 0 && <p className="orders__empty">아직 주문이 없어요.</p>}

        {tab < 2 ? (
          <div className="orders__list">
            {list.map((o) => (
              <OrderCard key={o.id} order={o}
                applyStep={o.id === draft.orderId && hasResponse(draft) ? 3 : 2}
                onResume={resume} />
            ))}
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.month} className="orders__month">
              <h3>{g.month}</h3>
              <div className="orders__list">
                {g.items.map((o) => <OrderCard key={o.id} order={o} />)}
              </div>
            </section>
          ))
        )}
      </div>
      <BottomNav active="apply" />
    </div>
  )
}
