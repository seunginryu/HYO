import type { ButtonHTMLAttributes } from 'react'
import kakaoIcon from '../assets/icon/icon_kakaotalk.png'
import googleIcon from '../assets/icon/icon_google.png'
import appleIcon from '../assets/icon/icon_apple.png'
import './SocialButton.css'

type Provider = 'kakao' | 'google' | 'apple'

const META: Record<Provider, { label: string; icon: string; w: number; h: number }> = {
  kakao: { label: '카카오로 시작하기', icon: kakaoIcon, w: 16.5, h: 16.5 },
  google: { label: '구글로 시작하기', icon: googleIcon, w: 19, h: 19 },
  apple: { label: '애플로 시작하기', icon: appleIcon, w: 14, h: 17 },
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { provider: Provider }

export function SocialButton({ provider, className = '', ...rest }: Props) {
  const m = META[provider]
  return (
    <button type="button" className={`social social--${provider} ${className}`} {...rest}>
      <img className="social__icon" src={m.icon} width={m.w} height={m.h} alt="" />
      <span>{m.label}</span>
    </button>
  )
}
