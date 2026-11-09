import { useNavigate } from 'react-router-dom'
import { StepBar } from './StepBar'
import { asDaysLeft, fmtMD, maskName } from '../lib/orders'
import type { Order } from '../lib/storage'
import './OrderCard.css'

const HOME_STEPS = ['주문접수', '세탁중', '포장중', '배송시작']
const toHomeStep = (step: number) => (step <= 1 ? 0 : step - 1)

/** 주문 카드: 신청 중 / 접수된 / 배송 완료 */
export function OrderCard({ order, applyStep, onContact, onResume }: {
  order: Order
  /** 신청 중 카드의 현재 신청 단계 */
  applyStep?: number
  onContact?: () => void
  onResume?: () => void
}) {
  const navigate = useNavigate()
  const r = order.recipient ?? { name: '김엄마', phone: '010-0000-0000', address: '세종특별자치시 시청대로210 000동 000호' }
  const asLeft = asDaysLeft(order)

  return (
    <div className={`ocard ocard--${order.status}`}>
      <p className="ocard__name">{maskName(r.name)}/ {r.phone}</p>
      <p className="ocard__addr">{r.address}</p>
      <p className="ocard__eta">
        {fmtMD(order.arriveAt)} {order.status === 'done' ? '도착' : '도착 예정'}
      </p>

      {order.status === 'requesting' && (
        <>
          <p className="ocard__applyStep">신청단계 {applyStep ?? 2}/4</p>
          <div className="ocard__bars">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={i <= (applyStep ?? 2) ? 'is-done' : ''} />
            ))}
          </div>
          <p className="ocard__wait">{(applyStep ?? 2) >= 3 ? '부모님 응답 도착' : '부모님 응답 대기중'}</p>
          <div className="ocard__btns">
            <button className="ocard__btn" onClick={onContact}>부모님께 연락하기</button>
            <button className="ocard__btn is-blue" onClick={onResume}>신청 이어가기</button>
          </div>
        </>
      )}

      {order.status === 'accepted' && (
        <>
          <div className="ocard__stepbar">
            <StepBar labels={HOME_STEPS} current={toHomeStep(order.step)} positions={[35.5, 121.5, 199.5, 277.5]} />
          </div>
          <div className="ocard__btns">
            <button className="ocard__btn is-blue" aria-disabled>영수증 보기</button>
            <button className="ocard__btn is-blue" onClick={() => navigate(`/orders/${order.id}`)}>진행 과정 사진 보기</button>
          </div>
        </>
      )}

      {order.status === 'done' && (
        <div className={`ocard__btns ${asLeft ? '' : 'is-single'}`}>
          {asLeft && (
            <button className="ocard__btn" aria-disabled>
              A/S 신청하기{asLeft <= 3 ? ` (${asLeft}일 남음)` : ''}
            </button>
          )}
          <button className="ocard__btn is-blue" onClick={() => navigate(`/orders/${order.id}`)}>배송 완료 사진 보기</button>
        </div>
      )}
    </div>
  )
}

export { toHomeStep }
