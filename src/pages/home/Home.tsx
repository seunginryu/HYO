import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../../components/BottomNav'
import { Button } from '../../components/Button'
import { Card, CloseButton } from '../../components/Card'
import { StepBar } from '../../components/StepBar'
import { hyodoStats, seedHomeDemo, storage, type HomeDemo, type OrderStep } from '../../lib/storage'
import logoType from '../../assets/logo/logo_type.svg'
import bellUnread from '../../assets/icon/bell_unread.png'
import bellRead from '../../assets/icon/bell_read.png'
import { hasUnread } from '../../lib/notifications'
import bannerCharacter from '../../assets/home/banner_character.png'
import bannerGradient from '../../assets/home/banner_gradient.png'
import basketEmpty from '../../assets/basket/basket_empty.png'
import basketHalf from '../../assets/basket/basket_half_dirt.png'
import basketFull from '../../assets/basket/basket_full_dirt.png'
import washHold from '../../assets/char/new/wash_hold.webp'
import washPush from '../../assets/char/new/wash_push.webp'
import boxOpen from '../../assets/char/new/box_open.webp'
import boxClosed from '../../assets/char/new/box_closed.webp'
import truck from '../../assets/char/new/truck.webp'
import spaceKit from '../../assets/home/space_kit.png'
import spaceBlanket from '../../assets/home/space_blanket.png'
import './Home.css'

/** 홈 진행 카드의 4단계 (주문 단계 0~4 → 표시 단계 0~3) */
const HOME_STEPS = ['주문접수', '세탁중', '포장중', '배송시작']
const HOME_STEP_POS = [35.5, 121.5, 199.5, 277.5]
const toHomeStep = (step: number) => (step <= 1 ? 0 : step - 1)
/** 단계별 문구: [강조, 어미, 두 번째 줄] */
/** [강조, 뒷말, 설명 첫 줄, 설명 둘째 줄] — 11-10 Figma '신청 후 홈 화면 수정' */
const HOME_STEP_TEXT: [string, string, string, string][] = [
  ['접수 완료', '예요!', '부모님께서 안심할 수 있도록', '곧 세탁물을 가지러 가요.'],
  ['세탁 중', '이에요!', '부모님께서 안심할 수 있도록', '깨끗이 빨고 있어요.'],
  ['포장 중', '이에요!', '부모님께서 안심할 수 있도록', '깔끔하고 꼼꼼하게 포장하고 있어요.'],
  ['배송 중', '이에요!', '깨끗해진 부모님의 이불을', '빠르게 전해드릴게요.'],
]

/** 진행 카드 그림 자리 (카드 왼쪽 위 기준 pt, Figma에서 잰 값 · 카드 테두리 1 제외) */
type Rect = { left: number; top: number; width: number; height: number }
const R = (left: number, top: number, width: number, height: number): Rect => ({ left: left - 1, top: top - 1, width, height })
const SCENE = {
  washHold: R(69.69, -15.07, 219.43, 160.75),
  washPush: R(69.5, -14.3, 217.3, 155.13),
  boxOpen: R(77.82, -22.68, 193.33, 161.49),
  boxClosed: R(77.64, -24.11, 183.31, 163.1),
  truck: R(70.16, -21.75, 218.3, 163.44),
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** 바구니 이미지(2x)와 표시 크기. 바닥선을 맞추려고 높이를 따로 둠 */
const BASKETS = {
  empty: { src: basketEmpty, w: 214, h: 157 },
  half: { src: basketHalf, w: 211, h: 148 },
  full: { src: basketFull, w: 211, h: 172 },
}
/** 이용 전 카드: 바구니 바닥이 카드 위에서 121px (Figma 반쯤 찬 바구니 기준) */
const BASKET_BOTTOM = 121

/** B 홈 — 최초 / 이용 전 / 이용 후(진행 중) */
export default function Home() {
  const navigate = useNavigate()
  const user = storage.getUser()
  const [version, setVersion] = useState(0) // 데모 전환 시 다시 읽기
  const orders = useMemo(() => storage.getOrders(), [version])
  const [guideClosed, setGuideClosed] = useState(storage.isGuideClosed())

  const { count, last } = hyodoStats(orders)
  const inProgress = orders.find((o) => o.status === 'accepted')
  const state: HomeDemo = count === 0 ? 'first' : inProgress ? 'after' : 'before'

  const daysSince = last ? Math.floor((Date.now() - last.getTime()) / 86_400_000) : 0
  // 마지막 효도 이후 시간이 지날수록 바구니가 차오름: 8일 미만 빈 바구니 / 8~30일 반쯤 / 30일 초과 가득
  const basket = daysSince < 8 ? BASKETS.empty : daysSince <= 30 ? BASKETS.half : BASKETS.full

  const closeGuide = () => {
    setGuideClosed(true)
    storage.setGuideClosed(true)
  }

  // 데모: 로고를 누르면 최초 → 이용 전 → 이용 후 순서로 바뀜
  const cycleDemo = () => {
    const next: HomeDemo = state === 'first' ? 'before' : state === 'before' ? 'after' : 'first'
    seedHomeDemo(next)
    setGuideClosed(false)
    setVersion((v) => v + 1)
  }

  const homeStep = inProgress ? toHomeStep(inProgress.step) : 0

  // 데모: 신청 완료 후 홈에서 3초 뒤 '세탁 중' → 3초 뒤 '포장' → 2.5초 뒤 '배송 중' → 10초 뒤 배송 완료(바구니 카드)
  useEffect(() => {
    if (!inProgress) return
    // 배송 중(4)을 10초 보여준 뒤 배송 완료 → 진행 카드 대신 (빈) 바구니 카드
    if (inProgress.step >= 4) {
      const t = setTimeout(() => {
        const now = new Date()
        storage.setOrders(
          storage.getOrders().map((o) =>
            o.id === inProgress.id
              ? { ...o, status: 'done', arriveAt: now.toISOString(), asUntil: new Date(now.getTime() + 7 * 86_400_000).toISOString() }
              : o,
          ),
        )
        setVersion((v) => v + 1)
      }, 10000)
      return () => clearTimeout(t)
    }
    const next = (inProgress.step < 2 ? 2 : inProgress.step + 1) as OrderStep
    // 포장 중(3)은 2.5초 보여준 뒤 배송 시작(4)으로
    const wait = next === 4 ? 2500 : 3000
    const t = setTimeout(() => {
      storage.setOrders(storage.getOrders().map((o) => (o.id === inProgress.id ? { ...o, step: next } : o)))
      setVersion((v) => v + 1)
    }, wait)
    return () => clearTimeout(t)
  }, [inProgress])
  const goApply = () => navigate('/apply')

  return (
    <div className="home">
      <div className="hdr-space" />
      <header className="home-hdr">
        <div className="hdr__status" />
        <div className="home-hdr__row">
          <button className="home-hdr__logo" onClick={cycleDemo} aria-label="HYO">
            <img src={logoType} width={70} height={23} alt="HYO" />
          </button>
          <button className="home-hdr__bell" aria-label="알림" onClick={() => navigate('/notifications')}>
            <img src={hasUnread() ? bellUnread : bellRead} width={32} height={32} alt="" />
          </button>
        </div>
      </header>

      <section className="home-banner" style={{ backgroundImage: `url(${bannerGradient})` }}>
        <p className="home-banner__hello">
          효도어 <strong>{user?.name ?? '효도어'}</strong> 님,
        </p>
        <p className="home-banner__msg">
          오늘 빨래 핑계로
          <br />
          부모님께 안부 연락 어떠세요?
        </p>
        <img className="home-banner__char" src={bannerCharacter} width={167.5} height={132} alt="" />
      </section>

      <div className={`home-body is-${state}`}>
        <Card className="home-stats">
          <div className="home-stats__row">
            <span className="home-stats__label">
              우리가 <b>효도한 횟수</b>
            </span>
            <span className="home-stats__value">
              <em>{count}</em> 회
            </span>
          </div>
          <div className="home-stats__sep" />
          <div className="home-stats__row">
            <span className="home-stats__label">
              마지막으로 <b>효도한 날</b>
            </span>
            <span className="home-stats__value">
              <em>{last ? pad2(last.getMonth() + 1) : '00'}</em> 월 <em>{last ? pad2(last.getDate()) : '00'}</em> 일
            </span>
          </div>
        </Card>

        {state === 'first' && (
          <>
            {!guideClosed && <GuideCard first onClose={closeGuide} />}
            <Card className="home-start">
              {/* Figma에는 없음: 사용자 요청으로 최초 화면에도 바구니 (아직 한 번도 안 빨았으니 가득) */}
              <img className="home-basket__img home-start__basket" src={BASKETS.full.src} width={211} height={172} alt="" />
              <h2 className="home-start__title">시작이 반이죠!</h2>
              <p className="home-start__desc">
                아직 진행중인 효도가 없어요.
                <br />
                처음 효도하신다고요?! <b>첫 효도 지원 쿠폰</b> 드려요!
              </p>
              <Button variant="blueGradient" size="md" className="home-start__btn" onClick={goApply}>
                쿠폰 받고 세탁 신청하기
              </Button>
            </Card>
          </>
        )}

        {state === 'before' && (
          <>
            <Card className="home-basket" style={{ marginTop: Math.max(41.5, basket.h - BASKET_BOTTOM + 14) }}>
              <img
                className="home-basket__img"
                src={basket.src}
                width={basket.w}
                height={basket.h}
                style={{ top: BASKET_BOTTOM - basket.h, left: (356 - basket.w) / 2 }}
                alt=""
              />
              {daysSince === 0 ? (
                // 오늘 배송 완료된 날
                <p className="home-basket__desc">
                  <b>오늘 효도 완료!</b>
                  <br />
                  다음 빨래도 맡겨주세요.
                </p>
              ) : (
                <p className="home-basket__desc">
                  마지막으로 <b>효도한 지 {daysSince > 30 ? '한 달' : `${daysSince}일`}</b>이 지났어요.
                  <br />
                  오랜만에 빨래 해드리는 거 어때요?
                </p>
              )}
              <Button variant="blueGradient" size="md" className="home-basket__btn" onClick={goApply}>
                세탁 신청하기
              </Button>
            </Card>
            {!guideClosed && <GuideCard onClose={closeGuide} />}
          </>
        )}

        {state === 'after' && (
          <>
            <Card className="home-progress">
              <h2 className="home-progress__title">
                내 효도는 <span>{HOME_STEP_TEXT[homeStep][0]}</span>{HOME_STEP_TEXT[homeStep][1]}
              </h2>
              <p className="home-progress__desc">
                {HOME_STEP_TEXT[homeStep][2]}
                <br />
                {HOME_STEP_TEXT[homeStep][3]}
              </p>
              {/* 장면 (Figma 위치·크기 그대로, 투명 PNG) — 세탁 중: 이불 들기 → 넣기 / 포장 중: 상자 닫기 / 배송 중: 흔들리며 달리는 트럭 */}
              {inProgress!.step >= 4 ? (
                <span key="truck" className="home-scene home-scene--truck" aria-hidden>
                  <span className="home-truck__wind home-truck__wind--1" />
                  <span className="home-truck__wind home-truck__wind--2" />
                  <span className="home-truck__wind home-truck__wind--3" />
                  <img className="home-truck__body" src={truck} style={SCENE.truck} alt="" />
                </span>
              ) : inProgress!.step === 3 ? (
                <span key="box" className="home-scene home-scene--box" aria-hidden>
                  <img className="home-scene__a" src={boxOpen} style={SCENE.boxOpen} alt="" />
                  <img className="home-scene__b" src={boxClosed} style={SCENE.boxClosed} alt="" />
                </span>
              ) : (
                <span key="wash" className="home-scene home-scene--wash" aria-hidden>
                  <img className="home-scene__a" src={washHold} style={SCENE.washHold} alt="" />
                  <img className="home-scene__b" src={washPush} style={SCENE.washPush} alt="" />
                </span>
              )}
              <div className="home-progress__bar">
                <StepBar labels={HOME_STEPS} current={homeStep} positions={HOME_STEP_POS} />
              </div>
              <button className="home-progress__more" onClick={() => navigate(`/orders/${inProgress!.id}`)}>
                진행과정 사진 보기
              </button>
            </Card>
            {!guideClosed && <GuideCard onClose={closeGuide} />}
          </>
        )}

        <section className="home-space">
          <div className="home-space__head">
            <h2>효도어 스페이스</h2>
            <p>부모님께 공유하면 좋을만한 정보를 알려드려요.</p>
            <button className="home-space__more">더보기 &gt;</button>
          </div>
          <div className="home-space__list">
            <SpaceCard img={spaceKit} sub="이것 뭐예요?" title="세탁물 위탁 키트" />
            <SpaceCard img={spaceBlanket} sub="항상 이불을 포근하게!" title="고수의 이불 관리법" />
          </div>
        </section>
      </div>

      <BottomNav active="home" />
    </div>
  )
}

function SpaceCard({ img, sub, title }: { img: string; sub: string; title: string }) {
  return (
    <button className="home-space__card">
      <img src={img} width={171} height={148} alt="" />
      <span className="home-space__text">
        <span className="home-space__sub">{sub}</span>
        <span className="home-space__title">{title}</span>
      </span>
    </button>
  )
}

function GuideCard({ first, onClose }: { first?: boolean; onClose: () => void }) {
  return (
    <Card className="home-guide">
      <h2 className="home-guide__title">
        {first ? (
          <>
            <span>처음이라면</span> 이용 방법 부터!
          </>
        ) : (
          <>
            이용방법을 <span>다시 확인할 수 있어요</span>!
          </>
        )}
      </h2>
      <p className="home-guide__desc">준비할 것과 비용 기준을 살펴볼 수 있어요</p>
      <button className="home-guide__link">보러가기 &gt;</button>
      <CloseButton className="home-guide__close" onClick={onClose} />
    </Card>
  )
}
