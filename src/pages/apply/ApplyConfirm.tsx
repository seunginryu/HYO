import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplyLayout } from '../../components/ApplyLayout'
import { Button } from '../../components/Button'
import { BottomSheet } from '../../components/Overlay'
import { demoResponse, getDraft } from '../../lib/apply'
import { ResponseCard, ResponseSummary } from './ApplyWait'
import './Apply.css'

/** C-4 (4/4) 최종 확인 */
export default function ApplyConfirm() {
  const navigate = useNavigate()
  const d = getDraft()
  const res = demoResponse(d)
  const [open, setOpen] = useState(false)
  const address = [d.zip, d.address].filter(Boolean).join(' ') || 'oo시 oo동'
  const rows = [
    ['세탁물', res.itemsText],
    ['수거 일정', res.schedule],
    ['주소', address],
    ['요청사항', res.request],
  ]
  return (
    <ApplyLayout title="최종 확인 및 결제" step={4} onBack={() => navigate('/apply/wait')} cta={<Button onClick={() => navigate('/apply/pay')}>확인 했어요</Button>}>
      <div className="c4">
        <h2 className="c4__head">신청완료까지 한단계</h2>
        <p className="c4__sub">부모님 응답을 확인하고 신청을 확정해주세요</p>
        <div className="card c4__card">
          {rows.map(([k, v]) => (
            <div key={k} className="c4__row">
              <p className="c4__k">{k}</p>
              <p className="c4__v">{v}</p>
            </div>
          ))}
        </div>
        <ResponseCard onClick={() => setOpen(true)} sub="응답 내용과 일치하는 지 확인할 수 있어요" />
      </div>
      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <ResponseSummary res={res} />
      </BottomSheet>
    </ApplyLayout>
  )
}
