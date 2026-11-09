import { Link } from 'react-router-dom'
import { Header } from '../components/Header'

/** 아직 구현 전인 화면 자리 */
export default function Placeholder({ title, links = [] }: { title: string; links?: { to: string; label: string }[] }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Header title={title} />
      <div style={{ padding: 24, color: 'var(--text-sub)', fontSize: 15, lineHeight: 1.6 }}>
        <p>이 화면은 다음 단계에서 구현됩니다.</p>
        {links.map((l) => (
          <p key={l.to} style={{ marginTop: 12 }}>
            <Link to={l.to} style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>{l.label} &gt;</Link>
          </p>
        ))}
        <p style={{ marginTop: 12 }}>
          <Link to="/" style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>처음 화면으로 &gt;</Link>
        </p>
      </div>
    </div>
  )
}
