import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplyLayout } from '../../components/ApplyLayout'
import { Button } from '../../components/Button'
import { Checkbox } from '../../components/Controls'
import { PACKAGE_DEPOSIT, SHIPPING_FEE, completePayment, demoResponse, getDraft } from '../../lib/apply'
import './Apply.css'

const won = (n: number) => n.toLocaleString('ko-KR')

/** C-4-1 결제 (가짜 결제) */
export default function ApplyPay() {
  const navigate = useNavigate()
  const res = demoResponse(getDraft())
  const [agree, setAgree] = useState(false)
  const [shake, setShake] = useState(false)
  const lines = [...res.lines, { label: '배송비', price: SHIPPING_FEE }, { label: '패키지 보증금', price: PACKAGE_DEPOSIT }]
  const total = lines.reduce((s, l) => s + l.price, 0)

  const pay = () => {
    if (!agree) {
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }
    completePayment()
    navigate('/apply/done', { replace: true })
  }

  return (
    <ApplyLayout title="결제" step={4} onBack={() => navigate('/apply/confirm')} cta={<Button onClick={pay}>결제 하기</Button>}>
      <div className="c41">
        <div className="card c41__cost">
          <h3 className="c41__title">비용</h3>
          {lines.map((l) => (
            <div key={l.label} className="c41__line">
              <span>{l.label}</span>
              <b>{won(l.price)} 원</b>
            </div>
          ))}
          <div className="c41__sep" />
          <div className="c41__total">
            <span>최종 결제 금액</span>
            <b>{won(total)} 원</b>
          </div>
        </div>
        <div className="card c41__payinfo">
          <div className="c41__payhead">
            <h3 className="c41__title">결제 정보</h3>
            <button className="c41__change">카드 변경 &gt;</button>
          </div>
          <div className="c41__card">
            <p className="c41__cardName">롯데카드</p>
            <p className="c41__cardNum">1234 **** ***** 5628</p>
          </div>
        </div>
        <div className={`c41__agree ${shake ? 'is-shake' : ''}`}>
          <Checkbox checked={agree} onChange={setAgree}>결제 내역을 확인 하였고 결제에 동의함</Checkbox>
        </div>
      </div>
    </ApplyLayout>
  )
}
