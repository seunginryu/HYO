import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BottomNav } from '../../components/BottomNav'
import { Button } from '../../components/Button'
import { Dial } from '../../components/Dial'
import { Header } from '../../components/Header'
import { findOrder, fmtMD, fmtYMD, orderNo } from '../../lib/orders'
import pickup from '../../assets/order/pickup.jpg'
import washing from '../../assets/order/washing.jpg'
import packing from '../../assets/order/packing.jpg'
import delivery from '../../assets/order/delivery.jpg'
import '../../components/Overlay.css'
import './Orders.css'

/** 단계별 사진: 접수(없음) / 수거 / 세탁중 / 포장 / 배송중 */
const PHOTOS: (string | null)[] = [null, pickup, washing, packing, delivery]

/** D-1-1 주문 상세 (진행 단계 다이얼) */
export default function OrderDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const order = id ? findOrder(id) : undefined
  const current = order?.step ?? 0
  const [sel, setSel] = useState<number>(current)
  const [zoom, setZoom] = useState(false)
  if (!order) return <Navigate to="/orders" replace />

  const r = order.recipient ?? { name: '김엄마', phone: '010-1234-5678', address: '세종특별자치시 시청대로210 000동 000호' }
  const photo = PHOTOS[sel]

  return (
    <div className="odetail">
      <Header title="주문 상세 보기" onBack={() => navigate(-1)} />
      <div className="odetail__body">
        <section className="odetail__card odetail__card--date">
          <h3 className="odetail__k">주문 일자</h3>
          <p className="odetail__v">{fmtYMD(order.createdAt)}</p>
          <p className="odetail__s">주문번호 {orderNo(order)}</p>
        </section>
        <section className="odetail__card odetail__card--to">
          <h3 className="odetail__k">받는 사람</h3>
          <p className="odetail__v">{r.name}/ {r.phone}</p>
          <p className="odetail__s odetail__s--dark">{r.address}</p>
          <p className="odetail__s odetail__s--blue">
            {fmtMD(order.arriveAt)} {order.status === 'done' ? '도착' : '도착 예정'}
          </p>
        </section>
        <section className="odetail__card odetail__card--dial">
          <h3 className="odetail__k">진행 단계</h3>
          <Dial current={current} selected={sel} onSelect={setSel} />
          <p className="odetail__cap">각 단계를 클릭하면 레버가 돌아가며 사진이 나옵니다.</p>
        </section>
        <div className="odetail__photo">
          {photo ? (
            <button className="odetail__photoBtn" onClick={() => setZoom(true)} aria-label="사진 크게 보기">
              <img key={sel} src={photo} alt={`${['주문접수', '수거', '세탁중', '포장', '배송중'][sel]} 사진`} />
            </button>
          ) : (
            <svg key="none" className="odetail__ph" viewBox="0 0 358 206" preserveAspectRatio="none" aria-label="사진 없음">
              <path d="M0 0L358 206M358 0L0 206" stroke="#E4E4E4" strokeWidth="1" />
            </svg>
          )}
        </div>
        {photo && <p className="odetail__photoCap">사진을 누르면 확대해서 볼 수 있습니다.</p>}
        <Button className="odetail__share">부모님께 공유하기</Button>
      </div>
      <BottomNav active="apply" />

      {/* 사진 크게 보기: 잘린 부분까지 전체. 사진 밖을 누르면 닫힘 */}
      {zoom && photo && (
        <div className="ovl ovl--photo" onClick={() => setZoom(false)}>
          <img className="photo-pop" src={photo} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
