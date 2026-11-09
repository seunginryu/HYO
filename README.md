# HYO (효도어)

부모님 세탁 효도 모바일 웹앱 — React + Vite + TypeScript. 작업 지침은 `CLAUDE.md` 참고.

## 실행
```bash
npm install
npm run dev        # http://localhost:5173/hyo/
npm run build      # dist/ 생성
```

## 배포 (GitHub Pages)
1. `vite.config.ts`의 `REPO_NAME`을 저장소 이름으로 맞춥니다 (기본 `hyo`).
2. main 브랜치에 push → `.github/workflows/deploy.yml`이 자동 배포합니다.
3. 저장소 Settings → Pages → Source를 **GitHub Actions**로 설정합니다.
4. 주소: `https://<아이디>.github.io/<저장소이름>/`

## 진행 상황
- [x] 공통: 토큰(색·그림자 4종), Button / TextField / Header / SocialButton / Logo
- [x] A. 온보딩 (A-1 스플래시 모션, A-2 회원가입)
- [x] B. 홈 (최초 · 이용 전 · 이용 후, 탭바, 진행 단계 바)
- [x] C. 세탁 신청 (4단계, 발송 모달, 응답 대기·도착, 편지 바텀시트, 결제, 신청 완료)
- [x] D. 주문내역 (탭 3종 카드, 주문 상세 회전 다이얼)
- [x] E. 마이페이지 (메뉴, 내 정보 수정·로그아웃, 부모님 정보 관리, 알림 설정)
- [x] F. 알림 (오늘·어제·n일 전 묶음, 안 읽음 점, 누르면 해당 화면으로)
- [x] G. 편지보관함 (부채꼴 회전·드래그·순환, 두 번 탭 열람 모션, 탭별 목록)
