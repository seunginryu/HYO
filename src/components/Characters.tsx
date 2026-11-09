import type { CSSProperties } from 'react'
import './Characters.css'

type Pos = { x: number; y: number; w: number; h: number }

/** 핸드폰 든 캐릭터 + 체크 말풍선 깜빡임 (C-2-1, C-3 응답 도착 공통)
 *  말풍선: 페이드아웃 0.3s → 0.5s 대기 → 살짝 커지며 페이드인 0.3s, 무한 반복 */
export function BubbleCharacter({ body, bubble, bodyPos, bubblePos, bubbleOrigin = '50% 50%', style }: {
  body: string
  /** 말풍선만 있는 이미지 (캐릭터는 body로 따로) */
  bubble: string
  bodyPos: Pos
  bubblePos: Pos
  /** 말풍선이 커지는 중심 (말풍선 위치) */
  bubbleOrigin?: string
  style?: CSSProperties
}) {
  const ox = Math.min(bodyPos.x, bubblePos.x)
  const oy = Math.min(bodyPos.y, bubblePos.y)
  const w = Math.max(bodyPos.x + bodyPos.w, bubblePos.x + bubblePos.w) - ox
  const h = Math.max(bodyPos.y + bodyPos.h, bubblePos.y + bubblePos.h) - oy
  return (
    <div className="bchar" style={{ width: w, height: h, ...style }}>
      <img src={body} alt="" width={bodyPos.w} height={bodyPos.h} style={{ left: bodyPos.x - ox, top: bodyPos.y - oy }} />
      <img className="bchar__bubble" src={bubble} alt="" width={bubblePos.w} height={bubblePos.h}
        style={{ left: bubblePos.x - ox, top: bubblePos.y - oy, transformOrigin: bubbleOrigin }} />
    </div>
  )
}

/** 둥둥 떠다니는 이미지 (8px, 2초 왕복) */
export function FloatImage({ src, w, h, style }: { src: string; w: number; h: number; style?: CSSProperties }) {
  return <img className="float-img" src={src} alt="" width={w} height={h} style={style} />
}

/** 점프하는 캐릭터 + 그림자 (C-4-2) */
export function JumpCharacter({ src, w, h, style }: { src: string; w: number; h: number; style?: CSSProperties }) {
  return (
    <div className="jchar" style={{ width: w, height: h + 18, ...style }}>
      <span className="jchar__shadow" />
      <img className="jchar__body" src={src} alt="" width={w} height={h} />
    </div>
  )
}
