import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplyLayout } from '../../components/ApplyLayout'
import { Button } from '../../components/Button'
import { Checkbox, OptionButton } from '../../components/Controls'
import { TextField } from '../../components/TextField'
import { ITEM_OPTIONS, getDraft, saveDraft, type ItemOption } from '../../lib/apply'
import { storage } from '../../lib/storage'
import './Apply.css'

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length < 4) return d
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="8.2" cy="8.2" r="6.6" stroke="var(--brand-blue)" strokeWidth="2" />
    <path d="M13 13L18.3 18.3" stroke="var(--brand-blue)" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)

/** C-1 (1/4) 부모님 정보 + 세탁물 종류 */
export default function ApplyForm() {
  const navigate = useNavigate()
  const [d, setD] = useState(getDraft)
  const [useSaved, setUseSaved] = useState(false)
  const [error, setError] = useState('')
  const update = (patch: Partial<typeof d>) => {
    const next = { ...d, ...patch }
    setD(next)
    saveDraft(next)
    setError('')
  }

  const loadSaved = (on: boolean) => {
    setUseSaved(on)
    if (!on) return
    const p = storage.getParents()[0]
    // 배송지(주소)만 채움. 성함·번호는 직접 입력
    if (p) update({ zip: p.zip, address: p.address })
  }

  const toggleItem = (it: ItemOption) =>
    update({ items: d.items.includes(it) ? d.items.filter((x) => x !== it) : [...d.items, it] })

  const next = () => {
    if (!d.parentName.trim() || d.phone.replace(/\D/g, '').length < 10) return setError('부모님 성함과 전화번호를 입력해주세요.')
    if (!d.zip.trim()) return setError('주소를 입력해주세요.')
    if (!d.items.length) return setError('세탁물 종류를 하나 이상 골라주세요.')
    navigate('/apply/contact')
  }

  return (
    <ApplyLayout title="세탁 신청" step={1} onBack={() => navigate('/home')} cta={<Button onClick={next}>다음 단계</Button>}>
      <div className="c1">
        <TextField className="tf--46" label="부모님 성함" placeholder="수혜인의 성함을 입력하세요." value={d.parentName}
          onChange={(e) => update({ parentName: e.target.value })} autoComplete="off" />
        <TextField className="tf--46" label="전화번호" placeholder="수혜인의 전화번호를 입력하세요." inputMode="tel" value={d.phone}
          onChange={(e) => update({ phone: formatPhone(e.target.value) })} />
        <TextField className="tf--46" label="주소" placeholder="우편번호 찾기" value={d.zip} trailing={<SearchIcon />}
          onChange={(e) => update({ zip: e.target.value })} />
        <TextField className="tf--46 c1__detail" placeholder="상세주소" value={d.address} onChange={(e) => update({ address: e.target.value })} />

        <div className="c1__saved">
          <Checkbox checked={useSaved} onChange={loadSaved}>저장한 배송지 불러오기</Checkbox>
        </div>

        <p className="c1__label">세탁물 종류(복수 선택 가능)</p>
        <div className="c1__chips">
          {ITEM_OPTIONS.map((it) => (
            <OptionButton key={it} selected={d.items.includes(it)} onClick={() => toggleItem(it)}>
              {it}
            </OptionButton>
          ))}
        </div>
        <p className="c1__note">수량 및 수거 일정은 부모님이 확인해요</p>
        {error && <p className="apply-error" role="alert">{error}</p>}
      </div>
    </ApplyLayout>
  )
}
