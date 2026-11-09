import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Header } from '../../components/Header'
import { SocialButton } from '../../components/SocialButton'
import { TextField } from '../../components/TextField'
import { storage, type User } from '../../lib/storage'
import './Signup.css'

/** A-2 회원가입 */
export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const finish = (user: User) => {
    storage.setUser(user)
    storage.resetActivity()
    navigate('/home', { replace: true })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      setError('이름, 이메일, 비밀번호를 모두 입력해주세요.')
      return
    }
    finish({ name: name.trim(), email: email.trim(), provider: 'email', joinedAt: new Date().toISOString() })
  }

  // 소셜 로그인은 UI만: 가짜 계정으로 홈 이동
  const social = (provider: 'kakao' | 'google' | 'apple') =>
    finish({ name: '효도어', email: `${provider}@hyo.demo`, provider, joinedAt: new Date().toISOString() })

  return (
    <div className="signup">
      <Header title="회원 가입" onBack={() => navigate('/', { replace: true })} />

      <form className="signup__body" onSubmit={onSubmit} noValidate>
        <div className="signup__title">
          <h2>반가워요!</h2>
          <p>요즘 효도는 이렇게 한다면서요?</p>
        </div>

        <div className="signup__fields">
          <TextField label="이름" placeholder="이름을 입력해주세요." value={name}
            onChange={(e) => { setName(e.target.value); setError('') }} autoComplete="name" />
          <TextField label="이메일" placeholder="이메일 주소를 입력해주세요." type="email" inputMode="email"
            value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} autoComplete="email" />
          <TextField label="비밀번호" placeholder="비밀번호를 입력해주세요." type="password" value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }} autoComplete="new-password" />
        </div>

        {error && <p className="signup__error" role="alert">{error}</p>}

        <Button type="submit" className="signup__submit">계정 생성하기</Button>

        <div className="signup__or"><span>또는</span></div>

        <div className="signup__social">
          <SocialButton provider="kakao" onClick={() => social('kakao')} />
          <SocialButton provider="google" onClick={() => social('google')} />
          <SocialButton provider="apple" onClick={() => social('apple')} />
        </div>
      </form>
    </div>
  )
}
