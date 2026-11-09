import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../../components/BottomNav'
import { Button } from '../../components/Button'
import { Header } from '../../components/Header'
import { TextField } from '../../components/TextField'
import { storage, type Parent } from '../../lib/storage'
import './My.css'

const DEFAULTS: Parent[] = [
  { id: 'mom', label: '엄마', name: '김엄마', phone: '010-1234-5678', zip: '세종특별자치시 시청대로 123 (12345)', address: '000동 000호' },
  { id: 'dad', label: '아빠', name: '', phone: '', zip: '', address: '' },
]

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length < 4) return d
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

/** E-3 부모님 정보 관리 (엄마 / 아빠 / + 추가) */
export default function Parents() {
  const navigate = useNavigate()
  const [list, setList] = useState<Parent[]>(() => {
    // 저장된 정보 + 엄마·아빠 탭은 항상 보이게
    const merged = [...storage.getParents()]
    for (const d of DEFAULTS) if (!merged.some((p) => p.id === d.id)) merged.push(d)
    return merged
  })
  const [idx, setIdx] = useState(0)
  const [saved, setSaved] = useState(false)
  const cur = list[idx]

  const update = (patch: Partial<Parent>) => {
    setSaved(false)
    setList((l) => l.map((p, i) => (i === idx ? { ...p, ...patch } : p)))
  }
  const add = () => {
    const n = list.length - 1
    const p: Parent = { id: `p${Date.now()}`, label: `가족 ${n}`, name: '', phone: '', zip: '', address: '' }
    setList((l) => [...l, p])
    setIdx(list.length)
  }
  const save = () => {
    storage.setParents(list.filter((p) => p.name.trim() || p.phone.trim()))
    setSaved(true)
  }

  return (
    <div className="my">
      <Header title="부모님 정보 관리" onBack={() => navigate('/my')} />
      <div className="my__body my__body--parents">
        <div className="ptabs">
          <div className="ptabs__scroll">
            {list.map((p, i) => (
              <button key={p.id} className={`ptabs__tab ${i === idx ? 'is-on' : ''}`} onClick={() => setIdx(i)}>
                {p.label}
              </button>
            ))}
          </div>
          <button className="ptabs__add" aria-label="부모님 추가" onClick={add}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              <path d="M8 1V15M1 8H15" stroke="#ACACAC" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="my__fields my__fields--parents">
          <TextField className="tf--50 tf--gray" label="이름" placeholder="이름을 입력하세요." value={cur.name} onChange={(e) => update({ name: e.target.value })} />
          <TextField className="tf--50 tf--gray" label="전화번호" placeholder="전화번호를 입력하세요." inputMode="tel" value={cur.phone}
            onChange={(e) => update({ phone: formatPhone(e.target.value) })} />
          <TextField className="tf--50 tf--gray" label="주소" placeholder="주소를 입력하세요." value={cur.zip} onChange={(e) => update({ zip: e.target.value })} />
          <TextField className="tf--50 tf--gray my__detail" placeholder="상세주소" value={cur.address} onChange={(e) => update({ address: e.target.value })} />
        </div>
        {saved && <p className="my__saved" role="status">저장했어요.</p>}
      </div>
      <div className="my__cta">
        <Button onClick={save}>부모님 정보 변경 및 저장</Button>
      </div>
      <BottomNav active="my" />
    </div>
  )
}
