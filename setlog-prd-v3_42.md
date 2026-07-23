# Setlog Mobile Mini — PRD v3.41
> AI 역방향 워크플로우 기준 명세서 | 이 문서가 Single Source of Truth
> v3.40 → v3.41: **버그 수정 — 섹션6-7 상태별 노출 표 행 단위 재검증.** "디자인 시스템·조립 문법이 개발과 싱크가 맞는지"를 토큰 이름 대조를 넘어 실제 JSX 조건부 렌더링과 행 단위로 대조했다. 발견: CaptionLabel 행에서 "나"와 "친구"가 똑같이 "✅ (≠null, ...)"로 표기되어 있었으나 실제 동작은 다르다 — 친구는 caption이 없으면 완전히 숨겨지는 진짜 조건부 렌더(`{hasCaption && (...)}`)인 반면, "나"는 posted 상태면 항상 렌더되고 caption 유무에 따라 실제 캡션 또는 "캡션 추가" placeholder로 내용만 바뀐다(`{isPosted && (...)}` 안에서 삼항연산자로 분기). 같은 표기가 서로 다른 동작을 가리켜 혼동을 줄 수 있어 두 행을 실제 동작에 맞게 구분해 재작성. 그 외 StripBackground/NicknameLabel/StatusLabel/CountdownOverlay/BorderBeam/TimestampLabel/EmojiIcon/EditCaptionBtn 행과 버튼 조립 문법(Type A/D)은 전부 코드와 정확히 일치 확인.

---

## ⚙️-A AI 행동 지침 (이 문서를 받은 AI에게)

> **이 섹션은 이 문서를 받은 AI가 가장 먼저 읽어야 한다.**

### 역할 선언
너는 이 PRD를 받는 순간부터 **시니어 풀스택 앱 엔지니어**이자 **디자인 시스템 수호자**다.
기획자(주주)는 문서를 쓰고, 너는 그 문서를 코드로 정확히 옮긴다.

### 절대 규칙
1. 이 문서가 유일한 진실이다. 문서에 없는 것은 구현하지 않는다
2. 섹션 4의 TOKEN 범위를 벗어난 값은 코드에 단 한 줄도 쓰지 않는다
3. 명세가 모호하면 코드 짜기 전에 반드시 질문한다
4. 섹션 6 조립 문법을 항상 따른다. 새 UI는 반드시 6-8 체크리스트를 통과해야 한다
5. 수정 요청이 오면 부분 패치 금지 — App.js 전체 재생성

### 코드 생성 시 체크리스트
```
□ PRIMITIVE → TOKEN 참조 구조 준수 (TOKEN에 직접 hex/숫자/문자열 없음)
□ 컴포넌트 styles는 PRIMITIVE를 직접 참조하지 않는다 — 항상 TOKEN을 통해서만 값을 가져온다. 의미 있는 이름이 있으면 전용 TOKEN을, 없으면 TOKEN.space4/8/12/16/20/24·radiusSmall 같은 범용 유틸리티 토큰을 쓴다 (텍스트 shadow 고정값 등 섹션 6-3에 명시된 예외만 허용)
□ styles 안에 이름 없는 순수 숫자(매직넘버)를 쓰지 않는다 — PRIMITIVE에 해당 값이 없으면 새로 추가한다
□ 텍스트/라벨 없이 아이콘만 있는 터치 요소(TouchableOpacity)는 accessibilityRole="button" + accessibilityLabel 필수 (삭제/뮤트/뒤로가기/탭바 아이콘 등)
□ TVNoise 등 고빈도 setInterval로 다수 엘리먼트를 리렌더하는 컴포넌트는 fps를 필요 이상으로 높게 잡지 않는다 (TOKEN.motionNoise = 50ms/20fps 기준)
□ px 단위 미사용 (숫자 dp만)
□ useWindowDimensions() 사용 (Dimensions.get() 금지)
□ useSafeAreaInsets() + SafeAreaView edges={['top']}
□ 루트에 SafeAreaProvider 래핑
□ tabBarTotalH = TOKEN.tabBarH + safeAreaBottom (이중 차감 금지)
□ stripHeight = Math.floor((screenHeight - safeAreaTop - tabBarTotalH) / allCount) — allCount = 1+friends.length. "나"는 별도 플로팅 레이어이므로 allUsers 배열로 함께 렌더하지 않는다
□ 모든 터치 요소 TOKEN.minTouchTarget(44dp) 이상
□ 마지막 스트립 borderBottomWidth: 0
□ intervalRef clearInterval cleanup (useEffect return)
□ TVNoise setInterval clearInterval cleanup (useEffect return)
□ countdown > 0일 때만 카운트다운 렌더링
□ 섹션 6-7 상태별 노출 표 완전 준수 (isMe/isFriend 분리)
□ 모든 스트립 텍스트 TOKEN.textOnDark (white) 사용
□ 모달 카드 내부만 TOKEN.textPrimary / TOKEN.textSecondary 사용
□ 닉네임: 배경 없음, text shadow 고정값, fontWeight '600', TOKEN.fontNickname 사용
□ 타임스탬프: bottom TOKEN.nicknamePad, left TOKEN.nicknamePad (좌우상하 동일 여백으로 통일)
□ '캡션 추가' 텍스트: TOKEN.fontCaptionEmpty, opacity 0.6, fontWeight '300'
□ StatusLabel: TOKEN.fontStatus, 스트립 완전 중앙(레이어3, top/bottom/left/right:0 + justifyContent/alignItems center), opacity 1.0
□ CameraModal 사용 금지(죽은 코드로 남기지 말 것) — 나 스트립(waiting/shooting) 배경이 곧 CameraView다
□ 카메라 프리뷰: 나 status가 waiting 또는 shooting이면 스트립 배경이 상시 CameraView (facing:'back', mode:'video')
□ 나 스트립 wrapper 엘리먼트 타입은 상태와 무관하게 항상 동일해야 한다 — waiting/shooting/captioning/posted 전부 같은 TouchableOpacity로 감싸고, 탭 가능 여부는 onPress 핸들러 내부 가드(status!=='waiting'이면 return)로만 제어한다. 상태에 따라 반환 엘리먼트 타입 자체를 바꾸지 않는다 — React가 타입 변경을 감지해 서브트리를 통째로 언마운트/재마운트하며 CameraView가 파괴·재생성되는 버그를 유발한다
□ 카운트다운 시작은 cameraReady 상태값 + useEffect([me.status, cameraReady]) 단일 경로로만 트리거한다 — onCameraReady 콜백과 별도 타이머를 동시에 두는 이중 트리거 금지. CameraView가 리마운트되지 않으므로 onCameraReady는 앱 최초 카메라 초기화 시 한 번만 호출됨을 전제로 설계한다
□ startCameraCountdown 진입 시 이미 recordingPromiseRef.current가 있으면 재시작하지 않는다 (중복 실행 방지 가드)
□ 카운트다운 시작 조건: onCameraReady 콜백 이후에만 시작 (워밍업 버그 방지)
□ 카운트다운 표시: 1→2→3 카운트업 (영상 녹화 경과 시간을 보여주는 편이 직관적)
□ 카운트다운 폰트: 고정값 금지, screenHeight 기준 반응형 계산 사용 (섹션 5 참조)
□ recordAsync 타이밍: recordAsync()가 반환하는 Promise 자체를 recordingPromiseRef에 저장 → stopRecording() 이후 await로 resolve 대기 → uri 획득. 즉시-읽기 패턴 금지 (레이스 컨디션 유발)
□ triggerShutter는 useCallback으로 선언하고 triggerShutterRef.current에 매 렌더 최신 함수를 갱신 — setInterval 클로저가 stale state를 참조하는 문제 방지
□ triggerShutter: stopRecording() → recordingPromiseRef await → uri 획득 → 실패 시 파스텔 fallback
□ triggerShutter: recordAsync Promise에 5초 타임아웃 안전장치(Promise.race) + 원본 Promise에 빈 .catch() 부착 (늦은 unhandled rejection 경고 방지)
□ VideoStrip: key={uri} 필수 — uri 변경 시 player 인스턴스 강제 재생성 (재촬영 반복 시 이전 영상이 남는 버그 방지)
□ VideoStrip: playToEnd 이벤트 구독 + player.replay()로 수동 루프 — player.loop=true만 믿지 않는다 (expo-video loop 속성 신뢰성 문제 우회, Expo/Mux 공식 권장 패턴)
□ VideoStrip: AppState 'active' 복귀 시 player.play() 재호출
□ expo-screen-orientation: Expo Go 충돌로 제거, 스코프 OUT
□ expo-video VideoView: 피드 스트립에서 영상 재생, autoPlay, isLooping, isMuted 기본 true
□ 캡션 모달: visible이 false면 컴포넌트 자체를 렌더하지 않음 (if(!visible) return null) — 상시 마운트된 채 visible만 토글되면 TextInput autoFocus가 조기 발동하는 버그 방지
□ 캡션 모달: KeyboardAvoidingView가 화면 전체를 flex:1, justifyContent:'flex-end'로 감싸고 내부에 딤(탭하면 닫힘)과 카드를 배치
□ 캡션 모달 소리 Switch: 기본 false, ON이면 media.hasSound=true, trackColor true는 TOKEN.switchActiveColor
□ 소리 있는 영상(hasSound=true)인 친구 스트립: 뮤트 아이콘(🔇) 표시
□ 뮤트 아이콘 탭: 해당 스트립만 unmuted, 나머지 자동 muted (unmutedStripId)
□ "나" 자신의 posted 영상: media.hasSound === true면 자동으로 음소거 해제(뮤트 버튼 없음, unmutedStripId와 무관), false면 음소거
□ 설정탭 알림 토글 Switch: trackColor true는 TOKEN.switchActiveColor
□ 친구 스트립 waiting → TVNoise (40×15, opacity≤0.15)
□ "나" 스트립은 AppContent 루트의 항상-마운트 플로팅 레이어여야 한다 — {activeTab==='feed' && ...} 안에 가두지 말 것 (탭 전환 시 CameraView 파괴 방지)
□ shooting 진입 시 "나" 플로팅 레이어를 도킹→전체화면(screenHeight, 탭바 포함)으로 Animated.timing(useNativeDriver:false) 확대, captioning 진입 시 도킹으로 복귀
□ SafeAreaView(edges:['top']) 안쪽 좌표계는 이미 top 안전영역이 적용된 상태다 — 그 안에서 safeAreaTop을 top 좌표로 다시 더하지 않는다 ("나" 플로팅 레이어 도킹 top은 0, 전체화면 top은 -safeAreaTop)
□ BorderBeam·카운트다운 폰트 크기는 onLayout 측정값이 아니라 screenWidth/screenHeight를 직접 사용한다 (Animated 애니메이션 도중 onLayout이 갱신되지 않아 크기가 고정되는 버그 방지)
□ BorderBeam: 막대 하나가 4변을 도는 방식 금지 — react-native-svg로 둥근 사각형 경로를 그리고 완전 채색 베이스 라인 + 흰색 글로우 하이라이트(strokeDasharray/Offset)로 구현. TOKEN.borderBeamColors/Thickness/Length/Duration/CornerRadius/GlowColor/GlowOpacity 참조
□ TabBar onTabPress: me.status==='shooting'이면 무시
□ 앱 최초 진입 시 authStatus !== 'authenticated'면 AuthFlow를 렌더하고 메인 앱(AppContent)은 마운트하지 않는다
□ AuthFlow의 각 단계 화면은 정확히 하나의 입력 필드만 가진다 — 한 화면에 이메일+비밀번호를 동시에 받는 등 여러 정보를 한 화면에 몰지 않는다 (섹션 6-9 조립 문법 참조)
□ 가입/로그인은 실제 서버 요청 없이 세션 메모리(accounts 배열)로만 처리한다 — fetch, axios 등 네트워크 호출 코드를 작성하지 않는다 (섹션 12 OUT "서버·DB/실제 계정" 유효)
□ 로그인 상태(authStatus, accounts)는 앱을 완전히 리로드하면 초기화된다 — AsyncStorage 등 영구 저장소를 쓰지 않는다 (다른 콘텐츠 상태와 동일한 세션 한정 원칙)
□ authStatus가 'authenticated'로 바뀌는 시점에 AppContent를 새로 마운트하며 me.nickname을 가입/로그인 시점의 닉네임으로 초기화한다
□ 전체 초기화(기능8)는 accounts(계정 목록)에 영향을 주지 않는다 — handleReset은 AppContent 내부 함수이고 accounts는 RootController에만 존재해 구조적으로 접근 불가. 로그아웃(기능15)과 혼용하지 않는다
□ 스트립 배경: media.uri가 file://이면 Video 컴포넌트, 아니면 파스텔 View
□ Ionicons import from '@expo/vector-icons'
□ expo-camera: CameraView, useCameraPermissions import (나 스트립 내부에서 상시 사용, CameraModal 아님)
□ 탭바 Ionicons 아이콘 활성/비활성 분기
□ tabBarTotalH height + paddingBottom: safeAreaBottom
□ Share API: import { Share } from 'react-native'
□ capturedAt: Date.now() — posted 진입 시
□ formatTimestamp 함수 구현, TOKEN.fontTimestamp 사용, opacity 1.0
□ reactions: string[] — 게시물에 달린 이모지 배열 (중복 허용)
□ mySelection: { [stripId]: emoji | null } — 내가 각 게시물에 남긴 이모지 (AppContent에서 관리)
□ emojiBarOpen: { [stripId]: boolean } — 스트립별 이모지 바 열림 상태
□ 이모지 토글: 같은 이모지 재탭 → false, 다른 이모지 → 기존 false + 새 true
□ 이모지 선택 표시: scale 애니메이션만 (배경 하이라이트 사용 금지)
□ 이모지 바: flexDirection 'row' (세로 금지), gap TOKEN.emojiGap, 아이템너비 TOKEN.emojiItemW(44dp)
□ 이모지 UX: 💬아이콘(미선택) → 바확장(탭) → 단독표시(선택) → 바재오픈(재탭) 3단계
□ 이모지 바 컨테이너: TOKEN.emojiBarBg(white15) 배경 필수
□ 이모지 선택: reactions 배열에 push/filter, mySelection으로 내 선택 추적, emojiBarOpen으로 바 제어
□ 죽은 코드 금지: 정의됐지만 호출되지 않는 함수(예: 미사용 헬퍼) 남기지 말 것
□ 이모지 폰트: TOKEN.fontEmoji
□ 캡션: 레이어3 정중앙(posted 상태), numberOfLines=1, TOKEN.fontCaptionLarge 사용
□ 캡션 탭 가능 영역은 caption 유무와 무관하게 항상 존재 (null이면 "캡션 추가" 안내)
□ 캡션 탭 영역은 absoluteFillObject로 스트립 전체를 덮지 않음 — 이모지바/타임스탬프와 겹치지 않게 영역 분리
□ 캡션모달: 외부(딤드) 탭 시 닫힘
□ 캡션모달 TextInput: selectTextOnFocus:true (재수정 시 기존 텍스트 즉시 덮어쓰기 가능)
□ 캡션모달 TextInput/HintText: TOKEN.fontCaption/fontModalHint, Header: TOKEN.fontNicknameHeader
□ FriendRow 우측 아이콘 2개: camera-outline/checkmark + trash-outline(dangerColor)
□ 친구 최대 3명 (friends.length < 3 가드)
□ 친구탭/피드 모든 텍스트는 실제 nickname 필드 참조 ("친구"라는 라벨 하드코딩 금지)
□ 설정탭 닉네임 입력칸: 라벨 위 + TextInput 아래 세로배치, width:'100%', textAlign:'left' (우측정렬 금지)
□ stripHeight 변동에도 텍스트/아이콘이 고정 폰트+flex 정렬로 안전하게 배치 (비율 의존 금지)
□ EmojiUI: 3단계(💬아이콘/바확장/단독표시), Animated fade+slide, emojiBarOpen 상태로 제어
□ EmojiUI: posted 상태인 모든 스트립(나+친구 모두)에 렌더됨 — mySelection[stripId]=null+isOpen=false일 때 💬 아이콘 반드시 표시
□ TVNoise React.memo 최적화
□ App/RootController/AppContent 분리 구조 유지
□ 섹션 9 기능 8 리셋: mySelection → {} 초기화, emojiBarOpen → {} 초기화, 닉네임은 리셋 대상 아님, accounts는 영향받지 않음
```

### 이터레이션 수신 시 행동
- 수정된 PRD 전달 시: 변경 섹션 파악 → 영향 컴포넌트 식별 → App.js 전체 재생성
- 화면 문제 텍스트 설명 시: 어느 PRD 섹션에 규칙 추가할지 먼저 제안 → 확인 후 수정된 PRD 전체를 마크다운 코드블록으로 출력 → 재생성
- 에러 로그 전달 시: PRD 규칙 부재인지 단순 코드 버그인지 먼저 판별 → PRD 규칙 부재면 보완 후 재생성 / 단순 버그면 PRD 수정 없이 코드만 수정 후 재생성
- "왜 이렇게 됐어?" 질문 시: 원인 섹션 번호와 규칙 함께 설명
- PRD 없이 코드 요청이 오면: PRD를 먼저 요청한다. PRD 없이 코드를 생성하지 않는다
- "개선해줘" / "더 좋게 만들어줘" / UX 문제 언급 / QA 스크린샷에서 개선점 발견 시: 섹션 14-1 프로토콜 발동 → 코드 바로 수정 금지, 제안서 먼저 작성 → 승인 후 PRD 반영 → 재생성

---

## ⚙️-B PRD 수정 가이드 (이 문서를 수정하는 사람에게)

> AI 지침이 아니다. 직무와 관계없이 이 PRD를 수정하는 모든 사람이 읽는 섹션이다.

```
어떤 직무든 이 PRD를 직접 수정할 수 있다.
Figma 없이, 코드 없이 — PRD 텍스트만 바꾸면 된다.
수정 후 할 일은 하나다: 수정된 PRD를 AI에게 전달한다. AI가 App.js를 재생성한다.
코드는 절대 직접 건드리지 않는다.

무엇을 바꾸고 싶은가?
- 기능 동작을 바꾸고 싶다          → 섹션 9(기능 명세) 수정
- 화면 구성을 바꾸고 싶다          → 섹션 8(화면 구조) 수정
- 색상·간격 등 스타일을 바꾸고 싶다 → 섹션 4(디자인 시스템) 수정
  ⚠️ 단, 디자인 시스템은 PRIMITIVE → TOKEN 2계층 구조가 있다.
     구조를 모르면 직접 수정하지 말고 AI에게 "~색으로 바꾸고 싶어"라고 말한다.
     AI가 올바른 토큰 위치에 반영한다.
- 새 기능을 추가하고 싶다          → 섹션 12(스코프)에 먼저 추가
- UI/UX를 더 좋게 개선하고 싶다    → AI에게 "개선해줘"라고 말한다.
                                     AI가 섹션 14-1 프로토콜에 따라 제안서를 작성하고
                                     승인 후 PRD에 반영한다. 직접 코드를 건드리지 않는다.
- 뭘 건드려야 할지 모르겠다        → AI에게 "~를 바꾸고 싶어"라고 말한다.
                                     AI가 어느 섹션을 수정할지 안내한다
```

---

## 0. 버전 히스토리

| 버전 | 날짜 | 주요 변경 내용 |
|---|---|---|
| v1.0 | 2026-06-22 | 최초 PRD 작성 |
| v1.1 | 2026-06-22 | React Native 기술 정합성 수정 (px→dp, 상태 구조) |
| v1.2 | 2026-06-22 | 시니어 디자이너 관점 최적화 (토큰 2계층, 터치 영역) |
| v1.3 | 2026-06-22 | 3관점 크로스체크 (충돌 해소, 리셋, 친구 안전 처리) |
| v1.4 | 2026-06-22 | 이터레이션 워크플로우 관점 선제 보완 |
| v1.5 | 2026-06-22 | 컴포넌트 조립 문법 섹션 추가 |
| v1.6 | 2026-06-22 | AI 행동 지침 / 제품 철학 / 배포 사이클 / 자가승인 선언 |
| v1.7 | 2026-06-22 | 섹션 번호 오류, TOKEN 규칙, 텍스트 가독성, safeArea 이중차감, 레이스컨디션, 배포 환경 |
| v1.8 | 2026-06-22 | dim35 위 텍스트 오류, textWhite 중복 제거, TOKEN.sp16 누락, useState 초기값, SafeAreaProvider 누락, 백그라운드 카운트 계산 공식 |
| v1.9 | 2026-06-22 | TOKEN 교차검증 완료: 누락 키 추가, 데드 토큰 연결, PRIMITIVE 직접 참조 제거(nicknamePadH/V TOKEN화), fontCountdown 정리 |
| v2.0 | 2026-06-24 | ⚙️-A/⚙️-B 구조 분리: AI 행동 지침 명칭 변경, PRD 수정 가이드 신규 추가, 이터레이션 수신 행동 보완 |
| v2.1 | 2026-06-24 | 다크 캔버스 전환: PRIMITIVE gray700/gray800 추가, bgWaiting/bgNotifOff/bgControlBar/btnControl 토큰 전면 개정, 텍스트 가독성 규칙 재정의, 섹션 3 디자인 원칙 개정 |
| v2.2 | 2026-06-24 | 섹션 13 배포 사이클 상세화: 초기 세팅, SDK 54 호환, tunnel 필수, VSCode, GitHub 토큰 인증 등 실전 기반 보완 |
| v2.3 | 2026-06-25 | 섹션 15 AI 자율 개선 프로토콜 추가: 개선 가능/불가 범위 정의, 제안 형식, 발동 조건, PRD 반영 흐름 |
| v2.4 | 2026-06-25 | AI 개선 제안 6종 반영: 컨트롤 바 아이콘화, 이모지 바 fade+slide 등장, 배경 fade-in, 닉네임 pill 제거+shadow, StatusLabel 소형화, 카운트다운 pulse |
| v3.0 | 2026-06-25 | 전면 재설계: 탭바 멀티화면(피드/친구/설정), 나/친구 화면 분리, TV 노이즈, Ionicons, 친구 초대(Share API), 알림 설정 분리, 타임스탬프 |
| v3.1 | 2026-06-25 | UX/UI 개선: TV 노이즈 완화, 토글 accent 컬러, 이모지 바 외부 분리, 친구 롱프레스 삭제, StatusLabel 위치, FriendRow 아이콘화 |
| v3.2 | 2026-06-25 | 내 스트립 탭으로 촬영 트리거, 이모지 우하단 오버레이, 설정탭 촬영 섹션 제거 및 간격 수정 |
| v3.3 | 2026-06-25 | 알림 토글 버그 수정, 간격 확대, 캡션 중앙 큰 텍스트, 이모지 카운트 뱃지, 실제 카메라(expo-camera) |
| v3.4 | 2026-06-29 | 내 스트립 라이브 카메라 프리뷰, 이모지 토글(사용자당 1개), 친구 최대 3명, 삭제 아이콘 명시, TV 노이즈 완화(80×30), 캡션 완전 중앙, 텍스트 크기 조정, 간격 수정 |
| v3.5 | 2026-06-30 | 전체화면 카메라 모달 복귀(BeReal 패턴), 이모지 가로 배치+다중사용자 카운트, 캡션 사후수정, 텍스트 확대(StatusLabel/타임스탬프/캡션모달), 닉네임 실명화+설정 수정, 친구추가시 레이아웃 안전성 |
| v3.6 | 2026-06-30 | 코드 버그 수정: 다중사용자 카운트 제거(단순 토글 회귀), 캡션 항상 탭 가능(미입력시 추가 유도), 캡션모달 외부탭 닫힘, 카메라 워밍업 타이밍, 닉네임 입력칸 좌측정렬, 이모지 뱃지 겹침 수정 |
| v3.7 | 2026-06-30 | Typography 스케일 정합성 재정렬(fontCaptionLarge fs20→fs16, fontStatus fs28→fs20), 캡션 레이어5(좌하단)로 원복, 캡션 1줄 고정, 이모지 카운트 복원, 이모지 간격축소+반투명배경 |
| v3.8 | 2026-07-02 | 캡션 정중앙(레이어3, posted 상태), 이모지 UX 전면 변경(댓글남기기→바 확장→단독표시→재탭 변경), 닉네임 여백 확대(nicknamePad sp16), 카운트 공백 텍스트 제거 |
| v3.9 | 2026-07-02 | 캡션 폰트 확대(fs16→fs20), 캡션 터치영역 제한, 캡션모달 딤 고정+카드만 슬라이드, 닉네임 여백(sp16→sp20), 피드 ScrollView+MIN_STRIP_HEIGHT, 초대 링크 실제 URL |
| v3.10 | 2026-07-03 | 캡션 완전 정중앙(이모지 회피 제거), 캡션 없을 때 텍스트 스타일, 친구3 스트립 높이 버그, 초대 링크 GitHub, 캡션모달 카드 하단 고정, 친구 이모지 💬 버그 수정 |
| v3.11 | 2026-07-03 | 디폴트 친구 없음(나만), fontNickname fs14→fs16, 타임스탬프 left nicknamePad 통일, fontCaptionEmpty fs14 추가 |
| v3.12 | 2026-07-03 | 타임스탬프 bottom nicknamePad 통일, 캡션추가 opacity 0.6, 이모지 reactions 배열 구조 변경(중복 표시) |
| v3.13 | 2026-07-03 | fontCaptionEmpty fs14→fs16, 이모지 컨테이너 bottom nicknamePad로 통일(타임스탬프와 수직 정렬) |
| v3.14 | 2026-07-03 | 이모지 컨테이너 bottom sp12로 조정 (너무 높이 올라간 문제) |
| v3.15 | 2026-07-03 | 사진→3초 영상 전환, 가로 강제 전환(expo-screen-orientation), Video 자동루프 무음(expo-av), 캡션모달 소리 토글, 뮤트 아이콘+단일 소리 제어 |
| v3.16 | 2026-07-03 | expo-av→expo-video 교체, expo-screen-orientation 제거(Expo Go 충돌→스코프 OUT) |
| v3.17 | 2026-07-05 | **스코프 변경(승인)**: CameraModal 완전 제거 → 나 스트립 상시 라이브 카메라 프리뷰로 원복(v3.5 결정 재검토), 카운트다운 3→2→1을 1→2→3 카운트업으로 변경, recordAsync 레이스컨디션 버그 수정(recordingPromiseRef), triggerShutterRef로 setInterval 클로저 문제 해결, VideoStrip key={uri} 강제 재마운트, CaptionModal 조건부 렌더+KAV flex-end 구조 개선, switchActiveColor 토큰 신규 추가(토글 색상 분리), TVNoise 80×30→40×15 성능 개선 |
| v3.18 | 2026-07-05 | **버그 수정**: "나" 스트립 wrapper 엘리먼트 타입이 상태별로 바뀌며 CameraView가 리마운트되던 버그 수정(항상 동일 TouchableOpacity 유지), onCameraReady 이중 호출로 인한 recordAsync/카운트다운 중복 실행 버그 수정(cameraReady 상태 + useEffect 단일 트리거로 교체), setTimeout 눈속임 제거 |
| v3.19 | 2026-07-05 | **스코프 추가 + 안정성**: "나" 스트립을 AppContent 루트 레벨 플로팅 레이어로 분리(탭 전환에도 항상 마운트 유지), 촬영 시 전체화면 확대 애니메이션 + Border Beam 테두리 인터랙션 추가, 촬영 중 탭 전환 잠금, VideoStrip 재생 안정성(AppState 복귀 재생 재개), recordAsync 타임아웃 안전장치, expo-linear-gradient 패키지 추가 |
| v3.20 | 2026-07-05 | **버그 수정**: "나" 플로팅 레이어/친구 영역 top 좌표 SafeAreaView 이중계산 버그 수정(하단 탭바 가림 해결), BorderBeam/카운트다운 폰트 크기 계산을 onLayout 측정→screenWidth/screenHeight 직접 사용으로 변경(테두리가 엣지를 안 따라가던 버그 해결), "나" 자신의 영상 소리 재생 규칙 신규 정의(media.hasSound 기반 자동 음소거 해제), MeStripSized 제거 |
| v3.21 | 2026-07-05 | **버그 수정**: BorderBeam을 4변 고정 트랙 + 트랙별 슬라이딩 하이라이트 방식으로 재구현(좌우 변 회전 문제 해결, useNativeDriver:true 전환), recordAsync 직후 파일 flush 레이스 컨디션 완화용 짧은 버퍼 지연 추가 |
| v3.22 | 2026-07-05 | **디자인 조정**: BorderBeam 두께 4dp→8dp, 속도 2.4초→3.2초/바퀴(3초 촬영 시간에 동기화), TOKEN.borderBeamDuration 신규 추가 |
| v3.23 | 2026-07-05 | **버그 수정**: VideoStrip 루프 실패(마지막 프레임 정지) 버그 수정 — playToEnd 이벤트 구독 + player.replay() 수동 루프 추가(expo-video loop 속성 신뢰성 문제의 공식 권장 우회책), 효과 없던 250ms 버퍼 지연 제거 |
| v3.24 | 2026-07-05 | **디자인/기술 재구현**: BorderBeam을 SVG 둥근 사각형 경로 + stroke-dasharray 애니메이션으로 재구현(모서리 곡률 근사 대응), 두께 8→12dp, 속도 3.2→4.8초/바퀴, react-native-svg 추가, expo-linear-gradient 제거 |
| v3.25 | 2026-07-05 | **디자인 조정 + 설치 안내 수정**: BorderBeam에 상시 노출 베이스 트랙 추가(트랙+하이라이트 2-레이어 구조), 두께 12→8dp, 섹션 13 `npx expo uninstall`(존재하지 않는 명령) → `npm uninstall`로 수정 |
| v3.26 | 2026-07-05 | **디자인 재조정**: BorderBeam 베이스 트랙을 옅은 opacity(0.28)에서 완전 채색(그라데이션 100%)으로, 움직이는 요소를 그라데이션 하이라이트에서 흰색 글로우로 변경("네온 튜브/scanning glow" 패턴) |
| v3.27 | 2026-07-05 | **스코프 추가**: 진입/가입/로그인 온보딩 플로우 추가(시작화면→로그인/가입 선택→가입 3단계 또는 로그인 2단계, 한 화면 한 정보 방식). 로컬 세션 시뮬레이션(서버 없음), 설정탭에 로그아웃 추가 |
| v3.28 | 2026-07-06 | (v3.31에서 롤백됨) 하루 24시간 슬롯 촬영 메커니즘 + "기록" 탭 + 기기 저장(expo-media-library) 추가 시도 |
| v3.29 | 2026-07-06 | (v3.31에서 롤백됨) 파일 저장 대신 "오늘 다시보기" 인앱 재생으로 전환 시도 |
| v3.30 | 2026-07-06 | (v3.31에서 롤백됨) 기록 탭 시간대 그리드 제거, 캡션 스타일은 v3.29 유지 확정 |
| v3.31 | 2026-07-06 | **스코프 완전 삭제**: v3.28~v3.30의 시간대 슬롯/기록 탭/다시보기 기능 및 관련 인프라(logs, currentHour, 시간대 전환 감지)를 전부 제거. PRD/코드를 v3.27 기준으로 롤백 |
| v3.32 | 2026-07-06 | **버그 수정(외부 교차검증 반영)**: fontCaptionLarge 관련 stale 주석 수정(fs16 언급 제거, 실제 값 fs20으로 통일), "전체 초기화"가 accounts에 영향 없음을 명시적으로 문서화 |
| v3.33 | 2026-07-06 | **구조 정합성 정리(1차)**: 구 섹션15를 14-1로 병합(마스터 프롬프트 표준 구조 0~14 준수), ⚙️-A 체크리스트 91개 항목 버전 태그 전부 제거(현재 규칙만 남김), 섹션4 PRIMITIVE 주석 동일 정리. 섹션5~12 본문 인라인 버전 태그는 잔여 작업으로 남음 |
| v3.34 | 2026-07-06 | **버그 수정(PRD↔코드 실전 정합성 검증)**: 죽은 토큰 11개 제거(TOKEN 키 코드/PRD 62개 일치 확인), 섹션6 조립문법의 리네임된/미구현 토큰 참조 수정, 섹션11 컴포넌트 트리를 실제 함수명(FriendStrip/MeStrip/FriendsFeedArea)으로 수정 |
| v3.35 | 2026-07-06 | **구조 정합성 정리(2차, 완료)**: 섹션5~12 본문 인라인 버전 태그 전수 제거(BorderBeam ADR 히스토리는 의도적으로 보존), fontNickname stale 값 수정, 섹션6-8/6-9 중복 번호 분리, 섹션8 앱정보 화면 구조를 실제 코드에 맞게 수정 |
| v3.36 | 2026-07-06 | **버그 수정(섹션9 기능 15개 전수 대조)**: 기능3 삭제 트리거/친구 최소인원 규칙을 실제 코드에 맞게 수정, 기능5 이모지 핸들러 의사코드를 실제 함수 구조로 재작성, 기능7 null 가드 보완. 나머지 12개 기능 + 섹션7-1 AuthFlow 전이는 코드와 완전 일치 확인 |
| v3.37 | 2026-07-06 | **버그 수정(디자인 시스템 2계층 위반 발견)**: styles가 TOKEN 없이 PRIMITIVE를 직접 참조하던 20여 곳 발견 및 수정, 매직넘버(minHeight:64, gap:2) 제거, 범용 유틸리티 TOKEN(space4~24, radiusSmall, dotInactive, friendRowMinHeight) 신규 추가, 체크리스트 2개 보강 |
| v3.38 | 2026-07-06 | **버그 수정(접근성/성능/보안 검증)**: 아이콘 전용 터치 요소에 accessibilityLabel/Role 추가, TVNoise 리렌더 주기 16ms→50ms 완화, password 평문 저장을 알려진 한계로 문서화, 접근성 원칙/체크리스트 추가 |
| v3.39 | 2026-07-06 | **버그 수정(기획/디자인/개발 3파트 교차 점검)**: 섹션2 기술스택에 react-native-safe-area-context 누락 보완, 섹션10에 permission 상태 선언부 누락 보완. 섹션1 핵심가치 서술은 코드와 일치 재확인 |
| v3.40 | 2026-07-06 | **버그 수정(교차참조 무결성 + 설치안내 완전성)**: 섹션 X-Y 교차참조 전수 검증(끊어진 참조 없음), 섹션13 설치 안내에 expo-camera/expo-video 누락 발견 및 추가 |
| v3.41 | 2026-07-06 | **버그 수정(6-7 노출표 행 단위 재검증)**: CaptionLabel 행에서 "나"(항상 렌더+placeholder)와 "친구"(진짜 조건부, hasCaption&&)가 동일 표기로 혼동을 주던 것을 실제 동작에 맞게 구분. 나머지 노출 표 행과 버튼 조립 문법(Type A/D)은 코드와 일치 확인 |
| v3.42 | 2026-07-22 | **문서 공백 보완(Figma 디자인시스템 역추적 중 발견)**: 섹션4에 폰트 패밀리 규칙 신규 추가 — `fontFamily` 미지정은 실수가 아니라 React Native/iOS 시스템 기본 폰트(San Francisco) 채택을 의도한 것임을 명시적으로 확정. Figma 대응 폰트는 SF Pro로 통일 결정(ADR: 커스텀 한글 웹폰트 미검토 상태에서 시스템 폰트로 즉시 통일 — iOS 전용 한계 인지, Android 스코프 진입 시 재검토 필요) |
| v3.43 | 2026-07-23 | **버그 수정(코드 품질 실무 감사, 발견 95)** — setlog-drift-report.md F2에 이미 기록되어 있었으나 미반영이던 항목 7건을 코드에 실제로 반영: (1) FriendsScreen/SettingsScreen 인라인 `PRIMITIVE.sp*` 직접 참조 약 14곳을 `TOKEN.space*`로 교체(#21, space6 신규 토큰화), (2) 로그아웃·초기화 버튼의 `backgroundColor:PRIMITIVE.gray800` 직접 참조를 `TOKEN.btnDangerBg` 신설로 교체(#23), (3) 아이콘 크기의 `+4` 매직넘버 5곳을 `TOKEN.iconSizeLarge`(신규, `PRIMITIVE.size24`—섹션4에 이미 선언되어 있었으나 코드 미구현 상태였던 죽은 토큰을 실제로 구현) 및 탭바는 기존 `TOKEN.iconSize`로 대체(#14·#15), (4) TVNoise 스캔라인·카운트다운 딤·이모지 선택 하이라이트의 하드코딩 rgba 3건을 각각 `TOKEN.bgNoiseScanline`/`bgCountdownDim`/`emojiItemActiveBg`(신규)로 토큰화(#19·#20) — **카운트다운 딤은 §4의 죽은 토큰 `dim35`(0.35)가 아니라 화면에 이미 QA 승인된 실제 값 0.3 그대로 유지**(신규 `dim30`), TVNoise 셀 opacity도 이미 선언돼 있었으나 미사용이던 `TOKEN.bgNoiseOverlay`(0.15)를 실제로 연결, (5) 설정 화면에 하드코딩되어 있던 "v3.19" 문자열을 `APP_VERSION` 단일 상수(v3.41)로 교체(#22) — 이 상수를 향후 PRD 버전업 시 함께 갱신하는 것으로 재발 방지. 전부 값(픽셀·색상)은 화면에 보이던 그대로 유지한 순수 토큰화이며, 시각적 변화 없음을 esbuild 구문 검증 + 커밋 전후 diff로 확인 |
| v3.44 | 2026-07-23 | **문서 정리(발견 95 후속)** — §4에 선언만 되고 코드·design-tokens.json 어디에도 구현된 적 없던 죽은 PRIMITIVE 6개(`dim35`, `opacity50`, `opacity60`, `radius999`, `white50`, `white95`)를 §4에서 삭제. 코드-PRD-Figma JSON 세 곳의 PRIMITIVE 키 집합을 전수 대조해 완전히 일치함을 확인 후 진행(제거로 새로 깨지는 참조 없음). TOKEN(시맨틱 토큰) 레이어는 이미 세 곳 모두 77개로 완전 일치 상태였음 |

> **기록 규칙:** 문서 수정마다 이 표 업데이트. 버전은 문서 수정 기준.

---

## 1. 제품 철학

### 문제 정의
사람들은 정각마다 각자의 공간에서 서로 다른 순간을 살고 있다.
지금의 소셜 미디어는 너무 많은 편집과 연출을 요구한다.
**Setlog는 편집 없는 동시성의 기록이다.** 3초라는 제약이 연출을 불가능하게 만들고, 날것의 순간만 남긴다.

### 핵심 제약이 곧 가치다
- **3초 제한:** 생각할 시간이 없다. 순간이 그대로 찍힌다
- **취소 불가:** 한 번 시작하면 끝까지 간다
- **선택적 캡션:** 강요 없음. 사진만으로도 충분하다
- **상하 분할:** 모두가 같은 무게로 나란히 존재한다

### 디자인 판단 기준
> "이 요소가 없으면 핵심 가치가 훼손되는가?"
> 아니오라면 — 넣지 않는다.

---

## 2. 제품 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | Setlog Mobile Mini |
| 버전 | 3.41 |
| 기술 스택 | React Native (Expo) + StyleSheet + react-native-safe-area-context + @expo/vector-icons (Ionicons) + expo-camera + expo-video + react-native-svg |
| 산출물 | App.js 단일 파일 |
| GitHub | `crisis-designer/setlog-mobile-mini` |
| QA 환경 | Expo Go (iOS/Android 실기기 또는 시뮬레이터) — 웹 미사용 |
| 목표 | PRD → 코드 역방향 이터레이션 워크플로우 검증 |

**핵심 가치:** 강제 알림 트리거 → 3초 카운트다운 + 자동 촬영 → 선택적 캡션 → 상하 균등 분할 타임라인 → 이모지 리액션

**v3.0 구조 변경 핵심:**
- 단일 화면 + QA 컨트롤 바 → 탭바(피드/친구/설정) 기반 실제 앱 구조
- 나(isMe:true) / 친구(isMe:false) 화면 분리 — 친구 미촬영 시 TV 노이즈
- 친구 초대: React Native Share API (실제 동작)
- 알림 ON/OFF → 설정 탭으로 이동

---

## 3. 디자인 원칙

1. **다크 캔버스 우선:** 앱은 카메라다. 어두운 배경 위에 콘텐츠(파스텔 사진)가 빛난다. 대기 상태도 어두운 뷰파인더처럼 느껴져야 한다
2. **미니멀 우선:** 텍스트·선·여백만으로 구조 표현. 장식 요소 금지
3. **터치 우선:** 최소 터치 영역 44×44dp
4. **가독성 보장:** 어두운 배경 위 텍스트는 항상 white. 모달 카드(흰색)만 예외적으로 어두운 텍스트 사용
5. **반응형 레이아웃:** 고정값보다 비율 계산 우선
6. **상태 명확성:** 각 스트립 상태가 색상·텍스트로 즉시 구분 가능
7. **토큰 일관성:** 모든 값은 TOKEN을 통해서만 적용
8. **접근성:** 텍스트 없이 아이콘만 있는 터치 요소는 반드시 accessibilityLabel을 붙인다. 탭바는 accessibilityRole="tab" + accessibilityState({selected})로 선택 상태를 전달한다

---

## 4. 디자인 토큰 (2계층 구조)

> **규칙:** TOKEN은 반드시 PRIMITIVE를 통해서만 참조. TOKEN에 직접 hex·숫자·문자열 작성 금지.

### 폰트 패밀리 (v3.42 신규 — 기존 공백 보완)

**채택:** `fontFamily` 미지정 = React Native 시스템 기본 폰트 사용.
- iOS: San Francisco (SF Pro) — 한글은 iOS가 자동으로 시스템 한글 서체로 폴백 처리
- 코드(App.js) 전체에 `fontFamily` 속성이 단 한 곳도 없음 — 이는 실수로 빠진 게 아니라 **처음부터 시스템 기본값을 그대로 쓰기로 한 것**으로 이번에 명시적으로 확정함
- 커스텀 웹폰트(Pretendard 등)는 로드한 적 없고, 로드할 계획도 없음
- **Figma 디자인 시스템에서의 대응**: 텍스트 스타일의 폰트 패밀리는 **SF Pro**로 통일한다(iOS 전용 폰트라는 한계는 인지하고 있으며, 현재 스코프가 iOS/Expo Go 기준이라 실용적 선택으로 채택). Android 대응이 스코프에 들어올 경우 이 규칙부터 재검토 필요

### Layer 1 — Primitive

```js
const PRIMITIVE = {
  // Color
  black:          '#000000',
  white:          '#FFFFFF',
  gray100:        '#F3F4F6',
  gray200:        '#E5E7EB',
  gray300:        '#D1D5DB',
  gray400:        '#9CA3AF',
  gray500:        '#6B7280',
  gray700:        '#374151',  // notif_off 배경용
  gray800:        '#1F2937',  // waiting 배경용
  gray900:        '#111827',

  // Opacity
  dim10:          'rgba(0,0,0,0.10)',   // v3.43(발견 95) — TVNoise 스캔라인, 기존 하드코딩 정정
  dim30:          'rgba(0,0,0,0.3)',    // v3.43(발견 95) — 카운트다운 딤, 기존 하드코딩 정정. 화면에 이미 QA 승인된 실제 값(0.3)을 그대로 토큰화한 것
  dim60:          'rgba(0,0,0,0.60)',
  white80:        'rgba(255,255,255,0.80)',
  white20:        'rgba(255,255,255,0.2)',   // v3.43(발견 95) — 이모지 선택 하이라이트, 기존 하드코딩 정정
  white15:        'rgba(255,255,255,0.15)',  // 어두운 배경 위 서브틀 오버레이용
  transparent:    'transparent',

  // Radius
  radius4:        4,
  radius8:        8,
  radius16:       16,
  radius20:       20,

  // Spacing
  sp4:  4,
  sp6:  6,
  sp8:  8,
  sp12: 12,
  sp16: 16,
  sp20: 20,
  sp24: 24,

  // Font Size — 일관된 스케일 (11→12→14→16→20→24, 중간값 없음)
  fs11: 11,
  fs12: 12,
  fs14: 14,
  fs16: 16,
  fs20: 20,   // StatusLabel, fontCaptionLarge 등 강조 텍스트용
  fs24: 24,   // 이모지 전용 (그림 문자라 텍스트 스케일과 별도 취급)

  // Border
  border1: 1,

  // Fixed Sizes
  size16:         16,
  size20:         20,
  size24:         24,
  size36:         36,
  size44:         44,
  size49:         49,
  size56:         56,
  size64:         64,   // FriendRow 최소 높이용
  opacity30:      0.3,
  opacity15:      0.15,

  // Accent & Danger
  accent:         '#B5EAD7',  // 민트 — 파스텔 팔레트에서 선택, 향후 브랜드 강조색 용도로 보유(토글 색상 용도는 green으로 분리)
  green:          '#34C759',  // iOS 표준 그린, Switch(토글) 전용 활성 색상
  red:            '#FF3B30',  // iOS 표준 삭제 빨강
  beamCyan:       '#7DE8FF',  // Border Beam 그라데이션 색상 1
  beamPink:       '#FF9EE8',  // Border Beam 그라데이션 색상 2

  // Motion (컴포넌트 내부 인터랙션 전용)
  dur16:          16,
  dur50:          50,
  dur150:         150,
  dur300:         300,
}
```

### Layer 2 — Semantic

```js
const TOKEN = {
  // Background
  bgWaiting:            PRIMITIVE.gray800,
  bgTabBar:             PRIMITIVE.gray900,
  bgModalDim:           PRIMITIVE.dim60,
  bgModalCard:          PRIMITIVE.white,
  bgNoiseOverlay:       PRIMITIVE.opacity15,   // 눈 피로 감소를 위해 낮은 값 사용. v3.43(발견 95): 선언만 되고 실제로는 미사용(하드코딩 0.15)이던 것을 TVNoise 셀 opacity에 실제 연결
  bgNoiseScanline:      PRIMITIVE.dim10,       // v3.43(발견 95) 신규 — TVNoise 스캔라인 오버레이, 기존 하드코딩 정정
  bgCountdownDim:       PRIMITIVE.dim30,       // v3.43(발견 95) 신규 — 카운트다운 딤 배경, 기존 하드코딩 정정

  // Text
  textPrimary:          PRIMITIVE.gray900,
  textSecondary:        PRIMITIVE.gray500,
  textOnDark:           PRIMITIVE.white,
  textTabInactive:      PRIMITIVE.gray500,
  textTabActive:        PRIMITIVE.white,

  // Accent & Danger
  accentColor:          PRIMITIVE.accent,      // 민트 — 향후 브랜드 강조색 용도로 보유 (토글에는 사용 안 함)
  switchActiveColor:    PRIMITIVE.green,       // 모든 Switch(토글) trackColor true 전용
  dangerColor:          PRIMITIVE.red,         // 삭제 버튼 색상
  borderBeamColors:     [PRIMITIVE.beamCyan, PRIMITIVE.beamPink],  // SVG LinearGradient 2-stop

  // Border
  borderDefault:        PRIMITIVE.gray700,

  // Button
  btnPostBg:            PRIMITIVE.gray900,
  btnPostText:          PRIMITIVE.white,
  btnPrimaryBg:         PRIMITIVE.white,
  btnPrimaryText:       PRIMITIVE.gray900,
  btnPrimaryRadius:     PRIMITIVE.radius8,
  btnDisabledOpacity:   PRIMITIVE.opacity30,
  btnDangerBg:          PRIMITIVE.gray800,     // v3.43(발견 95) 신규 — 로그아웃·초기화 버튼, 기존 PRIMITIVE 직접 참조 정정

  // Interactive
  // Motion (컴포넌트 내부 인터랙션 전용)
  motionNoise:          PRIMITIVE.dur50,  // 성능: 600셀 그리드를 60fps(16ms)로 리렌더하면 저사양 기기에서 버벅임 우려 — 20fps(50ms)로도 "노이즈" 느낌은 충분해 완화
  motionFast:           PRIMITIVE.dur150,
  motionNormal:         PRIMITIVE.dur300,

  // Typography — 일관된 스케일 (11/12/14/16/20/24 6단계)
  fontTab:              PRIMITIVE.fs11,   // 탭바 라벨 (최소)
  fontEmojiCount:       PRIMITIVE.fs12,   // 이모지 카운트 숫자
  fontNickname:         PRIMITIVE.fs16,   // 닉네임
  fontBody:             PRIMITIVE.fs14,   // 본문
  fontCaption:          PRIMITIVE.fs14,   // 캡션모달 입력 (fontBody와 통일)
  fontModalHint:        PRIMITIVE.fs14,   // 캡션모달 안내
  fontTimestamp:        PRIMITIVE.fs14,   // 타임스탬프 (fontBody와 통일)
  fontCaptionLarge:     PRIMITIVE.fs20,   // 피드 캡션 텍스트
  fontCaptionEmpty:     PRIMITIVE.fs16,   // '캡션 추가' 텍스트
  fontSectionTitle:     PRIMITIVE.fs16,   // 섹션 타이틀
  fontNicknameHeader:   PRIMITIVE.fs16,   // 모달 헤더
  fontPostBtn:          PRIMITIVE.fs16,   // 올리기 버튼
  fontStatus:           PRIMITIVE.fs20,   // "탭해서 찍기" 등 상태 표시
  fontEmoji:            PRIMITIVE.fs24,   // 이모지 그림문자 (텍스트 스케일과 별도 취급)

  // Spacing & Size
  stripPad:             PRIMITIVE.sp8,
  nicknamePad:          PRIMITIVE.sp20,   // 닉네임 여백
  emojiGap:             PRIMITIVE.sp6,    // 이모지 간격
  emojiItemW:           PRIMITIVE.size44,
  emojiItemActiveBg:    PRIMITIVE.white20,    // v3.43(발견 95) 신규 — 이모지 선택 하이라이트, 기존 하드코딩 정정
  emojiBarBg:           PRIMITIVE.white15,    // 이모지 바 전체 반투명 배경 (가시성)
  tabBarH:              PRIMITIVE.size49,
  tabIconSize:          PRIMITIVE.size16,
  iconSize:             PRIMITIVE.size20,
  iconSizeLarge:        PRIMITIVE.size24,      // v3.43(발견 95) 신규 — 친구탭 액션·뒤로가기 아이콘, 기존 "+4" 매직넘버 정정(20+4=24). PRIMITIVE.size24 자체는 이미 §4에 선언되어 있었으나 TOKEN 매핑이 없어 코드가 못 쓰고 있었음
  borderWidth:          PRIMITIVE.border1,
  modalRadius:          PRIMITIVE.radius16,
  emojiBarRadius:       PRIMITIVE.radius20,
  nicknameLabelRadius:  PRIMITIVE.radius4,
  modalCardPadding:     PRIMITIVE.sp20,
  postBtnRadius:        PRIMITIVE.radius8,
  modalElementGap:      PRIMITIVE.sp8,
  postBtnTopMargin:     PRIMITIVE.sp16,
  sectionPad:           PRIMITIVE.sp16,

  // Touch
  minTouchTarget:       PRIMITIVE.size44,

  // 범용 유틸리티 스케일 (특정 컴포넌트 의미가 없는 간격/반경 — 컴포넌트가 PRIMITIVE를
  // 직접 참조하지 않고 이 계층을 통해서만 쓰도록 하는 탈출구. 의미 있는 이름을 붙일 수
  // 있는 값은 여기 대신 전용 의미 토큰을 새로 만든다)
  space4:               PRIMITIVE.sp4,
  space6:               PRIMITIVE.sp6,     // v3.43(발견 95) 신규 — friendStatus 등, 기존 인라인 PRIMITIVE.sp6 직접 참조 정정
  space8:               PRIMITIVE.sp8,
  space12:              PRIMITIVE.sp12,
  space16:              PRIMITIVE.sp16,
  space20:              PRIMITIVE.sp20,
  space24:              PRIMITIVE.sp24,
  radiusSmall:          PRIMITIVE.radius8,
  dotInactive:          PRIMITIVE.gray700,
  friendRowMinHeight:   PRIMITIVE.size64,

  // Border Beam
  borderBeamThickness:  PRIMITIVE.sp8,
  borderBeamGlowColor:  PRIMITIVE.white,         // 베이스 라인 위를 스치는 빛의 색상
  borderBeamGlowOpacity: 0.95,                   // 빛 하이라이트의 불투명도
  borderBeamLength:     PRIMITIVE.size56 * 2,   // 112dp — 코멧(대시) 길이
  borderBeamDuration:   4800,
  borderBeamCornerRadius: PRIMITIVE.size56,     // 56dp, 최신 스마트폰 화면 모서리 곡률 근사값 (기기별 정확한 값을 얻는 공식 API 없음)
}
```

---

## 5. 반응형 레이아웃 규칙

### 화면 크기 획득

```js
const { width: screenWidth, height: screenHeight } = useWindowDimensions()
// Dimensions.get() 사용 금지
```

### Safe Area 처리

```js
const { top: safeAreaTop, bottom: safeAreaBottom } = useSafeAreaInsets()
// SafeAreaView edges={['top']} 고정
```

### 탭바 높이 계산

```js
// 탭바 실제 높이 = TOKEN.tabBarH + safeAreaBottom
const tabBarTotalH = TOKEN.tabBarH + safeAreaBottom
```

### 피드 탭 레이아웃 계산

```js
// "나" 스트립은 피드 ScrollView 안에 포함되지 않는다 (AppContent 루트의 플로팅 레이어).
// stripHeight는 "나 포함 전체 인원 균등분할" 기준으로 계산해 도킹 크기/친구 크기를 통일시킨다.
const availableH = screenHeight - safeAreaTop - tabBarTotalH
const allCount = 1 + friends.length
const stripHeight = Math.floor(availableH / allCount)   // "나"의 도킹 높이 = 친구 1인당 높이와 동일

// 친구 목록 ScrollView: "나"의 도킹 높이만큼 상단 여백을 두고, 나머지 공간을 모두 차지
// position: 'absolute', top: stripHeight (safeAreaTop 더하지 않음 — 아래 "친구 목록 영역 좌표" 참조), left:0, right:0, bottom: tabBarTotalH
// 항상 ScrollView이며 스크롤 여부는 콘텐츠 높이로 자동 결정된다 (별도 최소높이/스크롤 토글 로직 없음)
```

### 최소 스트립 높이 가드

```js
// 나(1) + 친구 최대 3명 = 총 4명 최대
const canAddFriend = friends.length < 3 &&
  ((screenHeight - safeAreaTop - tabBarTotalH) / (friends.length + 2)) >= 120
// friends.length + 2: 나(1) + 현재친구수 + 추가될1
// 120dp 가드: StatusLabel(fs20) + 닉네임(fs14) + 캡션(fs16) + 이모지바(가로, height 44)가
// 겹치지 않고 들어갈 수 있는 최소 높이
```

### 친구 추가 시 레이아웃 안전성

```js
// 친구 추가/삭제로 stripHeight가 동적으로 변함
// 모든 텍스트·아이콘은 stripHeight 비율이 아닌 고정 폰트 크기 + flex 중앙정렬 사용
// → stripHeight가 작아져도 텍스트가 잘리지 않고 자동으로 좁은 영역에 맞게 배치됨
// 이모지바는 가로 배치 + flexWrap 없음 + minHeight 44dp 고정 (스트립 높이와 무관)
```

### "나" 플로팅 레이어 + 전체화면 확대

```js
// "나" 스트립을 AppContent 루트 레벨에서 항상 마운트 상태로 렌더한다.
// 탭을 friends/settings로 바꿔도 이 레이어는 언마운트되지 않는다 — 촬영 중 탭 전환으로
// CameraView가 파괴되던 문제를 근본적으로 없앤다.
// activeTab !== 'feed'일 때는 opacity:0 + pointerEvents:'none'으로 시각적으로만 숨긴다.

// 중요: 이 레이어는 <SafeAreaView edges={['top']}> 내부에 있으므로,
// 이 좌표계의 local y=0은 이미 실제 화면의 safeAreaTop 위치다. 즉 top 좌표에
// safeAreaTop을 또 더하면 안 된다 (이 실수는 하단 탭바가 가려지는 버그로 직결된다).
//
// 도킹 상태(기본): top: 0 (로컬 좌표 기준 — 실제 화면상으로는 safeAreaTop 지점), height: stripHeight
// 전체화면 상태(shooting): top: -safeAreaTop (SafeAreaView가 밀어둔 만큼 다시 끌어올려
//                          상태바/노치 영역까지 포함한 진짜 전체화면을 덮는다), height: screenHeight

const shootExpand = useRef(new Animated.Value(0)).current  // 0 = 도킹, 1 = 전체화면

useEffect(() => {
  Animated.timing(shootExpand, {
    toValue: me.status === 'shooting' ? 1 : 0,
    duration: TOKEN.motionNormal,
    useNativeDriver: false,   // top/height 애니메이션은 네이티브 드라이버 불가
  }).start()
}, [me.status])

const meTop = shootExpand.interpolate({ inputRange:[0,1], outputRange:[0, -safeAreaTop] })
const meHeight = shootExpand.interpolate({ inputRange:[0,1], outputRange:[stripHeight, screenHeight] })
```

### 친구 목록 영역 좌표

```js
// 친구 ScrollView 컨테이너도 SafeAreaView 내부 로컬 좌표계이므로 top에 safeAreaTop을
// 더하지 않는다. "나" 도킹 스트립의 로컬 bottom(=stripHeight, top:0 기준)과 정확히
// 이어지도록 top은 stripHeight 값 그대로 사용한다.
// position: 'absolute', top: stripHeight (safeAreaTop 더하지 않음), left:0, right:0, bottom: tabBarTotalH
```

### BorderBeam·카운트다운 크기 계산

```js
// onLayout으로 "나" 레이어의 실제 렌더 크기를 측정해 쓰면, shootExpand 애니메이션이
// 진행되는 동안 onLayout이 매 프레임 갱신되지 않아 도킹 크기(작은 값)에 고정된 채로
// 굳어버리는 문제가 있다 — 테두리가 화면 중간의 작은 사각형 경로를 도는 것처럼 보이는
// 버그로 이어진다. screenWidth/screenHeight는 이미 알고 있는 값이므로 측정 없이 그대로
// 사용한다. BorderBeam은 shooting(=항상 전체화면 대상) 상태에서만 렌더되므로 항상
// width: screenWidth, height: screenHeight 를 직접 전달한다 (섹션 9 기능10 참조).
// 카운트다운 폰트도 동일하게 screenHeight를 직접 사용한다 (측정 컴포넌트 불필요).
```

### 인라인 라이브 카메라

```js
// CameraModal 없음. 나 스트립 배경 자체가 상시 CameraView (waiting/shooting 상태 공통)
// "탭해서 찍기" 탭 → status: 'shooting' 전환. 스트립을 감싸는 wrapper 엘리먼트 타입은
// 상태와 무관하게 항상 동일(TouchableOpacity)해야 CameraView가 리마운트되지 않는다.
// 촬영 중에는 탭 전환 자체를 막는다 (TabBar onTabPress 가드, 섹션 9 기능1 참조)
const handleMeStripPress = async () => {
  if (!me.notifOn || me.status !== 'waiting') return
  if (!hasCameraPermission) {
    const result = await requestPermission()
    if (!result.granted) { Alert.alert('카메라 권한 필요', '...'); return }
  }
  setMe(prev => ({...prev, status:'shooting'}))
  // 카운트다운 시작은 여기서 하지 않는다 — cameraReady 상태 + useEffect가 단독으로 트리거한다
}
```

### 카운트다운 폰트 반응형

```js
// 카운트다운은 항상 "전체화면으로 확대된 상태"에서만 보이므로(섹션 7 상태 전이 참고)
// 전체화면 콘텐츠 높이를 기준으로 계산한다. 애니메이션 중간값과 동기화할 필요가 없다.
const fullScreenContentHeight = screenHeight   // 탭바까지 덮는 완전 전체화면 기준
const countdownFontSize = Math.min(80, Math.max(40, Math.floor(fullScreenContentHeight * 0.4)))
// countdown != null && countdown > 0일 때만 렌더링 (거의 항상 80으로 수렴)
```

### Border Beam (촬영 중 테두리 인터랙션)

```js
// shooting 상태에서만 렌더. "나" 플로팅 레이어(도킹↔전체화면 애니메이션 컨테이너)의
// StyleSheet.absoluteFillObject 위에 겹쳐서, 컨테이너의 현재 크기를 그대로 따라간다.
// react-native-svg로 둥근 사각형(Rect, rx/ry=TOKEN.borderBeamCornerRadius) 경로를
// 그리고, strokeDasharray(대시 길이=TOKEN.borderBeamLength, 나머지는 빈 구간)로 짧은
// 세그먼트만 보이게 한 뒤 strokeDashoffset을 Animated.timing(linear)으로 계속 이동시켜
// 대시가 경로를 따라 도는 것처럼 보이게 한다 — 경로 자체가 둥근 사각형이므로 모서리에서도
// 자연스럽게 곡선을 그린다 (직선을 이어붙이는 방식은 모서리를 표현할 수 없어 채택하지 않음).
// 색상은 react-native-svg의 LinearGradient(Defs)로 stroke에 그라데이션을 입힌다.
```

### 이모지 바 폭 (하단 중앙 배치)

```js
// 이모지 바 컨테이너 — 하단 중앙 고정
bottom: TOKEN.stripPad
alignSelf: 'center'
maxWidth: screenWidth * 0.85
```

---

## 6. 컴포넌트 조립 문법 (Design Grammar)

> **목적:** 디자이너 없이도 누구든 이 문서만으로 새 UI를 추가했을 때 디자인이 일관되게 유지됨.
>
> **자가승인 선언:** 이 섹션의 모든 규칙을 준수한 결과물은 별도 디자인 리뷰 없이 바로 승인된 것으로 간주한다.

---

### 6-1. 레이어 조립 규칙

```
레이어 1 (최하단) — Background
레이어 2           — 좌상단 고정 요소 (닉네임 등 식별 정보)
레이어 3           — 중앙 상태 표시 (상태별 조건부)
레이어 4           — 전체 덮는 오버레이 (카운트다운 등)
레이어 5           — 좌하단 텍스트 정보 (캡션)
레이어 6 (최상단) — 우하단 액션 컨트롤 (이모지 바)
```

새 요소 추가: 좌상단→L2 / 중앙 조건부→L3 / 전체 점유→L4 / 하단 텍스트→L5 / 하단 액션→L6

---

### 6-2. 배경 처리 규칙

| 유형 | 사용 조건 | 적용 |
|---|---|---|
| 실제 카메라 프리뷰 | 나: waiting, shooting | CameraView (expo-camera, facing:'back', mode:'video'), 권한 없으면 TOKEN.bgWaiting fallback |
| 실제 영상/파스텔 | 나: captioning/posted | VideoStrip(영상, file://) 또는 파스텔 View (media.uri가 '#'로 시작) |
| TV 노이즈 | 친구: waiting | TVNoise 컴포넌트 (40×15) |
| 실제영상/파스텔 | 친구: posted | media.uri (영상 또는 PHOTO_COLORS) |

```js
const PHOTO_COLORS = ['#A8D8EA','#AA96DA','#FCBAD3','#FFFFD2','#B5EAD7','#FFD7BA','#C7CEEA']

// TV 노이즈: 40×15 그리드, opacity 최대 0.15, scanline rgba(0,0,0,0.10)

// CameraModal 없음. 나 스트립은 waiting/shooting 내내 CameraView가 배경으로 상시 렌더된다.
// "탭해서 찍기" 탭 → status만 shooting으로 전환, 배경(CameraView)은 그대로 유지 + 카운트다운 오버레이(레이어4)만 추가
```

---

### 6-3. 텍스트 가독성 규칙

> **핵심 원칙:** 스트립 배경은 모두 어둡다(TOKEN.bgWaiting, 촬영본 영상/PHOTO_COLORS 파스텔 등).
> 따라서 스트립 위 텍스트는 배경 종류에 관계없이 **항상 TOKEN.textOnDark(white)** 를 사용한다.
> 모달 카드(TOKEN.bgModalCard, white)만 TOKEN.textPrimary/textSecondary 사용.
>
> 닉네임 라벨은 배경(pill) 없이, 모든 상태에서 text shadow로만 가독성을 확보한다.

**케이스 A — 닉네임 텍스트 (배경 없음, text shadow 적용):**

| 스트립 배경 | 닉네임 배경 | 닉네임 텍스트 | Shadow |
|---|---|---|---|
| 모든 상태 (waiting/notif_off/shooting/captioning/posted) | 없음 | TOKEN.textOnDark (white) | 고정값 적용 |

```
// 닉네임 text shadow (고정값 — TOKEN 밖 예외 허용)
textShadowColor: 'rgba(0,0,0,0.6)'
textShadowOffset: { width: 0, height: 1 }
textShadowRadius: 3
fontWeight: '600'
```

**케이스 B — StatusLabel (레이어3, 스트립 정중앙):**

| 스트립 배경 | 텍스트 | 크기 | Opacity | 위치 |
|---|---|---|---|---|
| bgWaiting (gray800) | TOKEN.textOnDark | TOKEN.fontStatus | 1.0 (불투명) | 수평+수직 완전 중앙 |

```
// StatusLabel — 스트립 정중앙 (레이어3 전용, 캡션과 자리 경합 없음)
position: 'absolute'
top: 0, bottom: 0, left: 0, right: 0
justifyContent: 'center', alignItems: 'center'
fontWeight: '700'
```

**케이스 C — CountdownOverlay (나 스트립 내부 레이어4, CameraModal 없음):**

| 배경 | 텍스트 |
|---|---|
| 나 스트립의 CameraView 위 dim 오버레이(레이어4, 스트립 전체 덮음) | TOKEN.textOnDark (white), 1→2→3 카운트업 |

**케이스 D — CaptionLabel (레이어3, 완전 정중앙):**

| 배경 | 텍스트 | 위치 | 줄수 |
|---|---|---|---|
| PHOTO_COLORS (파스텔) / 실제사진 | TOKEN.textOnDark (white) | 수평+수직 완전 중앙 | numberOfLines=1 고정 |

```
// CaptionLabel — 레이어3 완전 정중앙 (posted 상태에만 노출)
// 이모지바는 absolute로 캡션 위에 떠있어 겹쳐도 무방
// 좌우 여백을 동일하게 주어 텍스트가 진짜 정중앙에 오도록

// 포지셔너 wrapper (터치 없음):
position: 'absolute', top: 0, bottom: 0, left: 0, right: 0
justifyContent: 'center', alignItems: 'center'

// 실제 터치 영역 (내부 TouchableOpacity):
paddingVertical: sp8, paddingHorizontal: sp20  // 좌우 동일 여백
→ 터치 영역은 텍스트 크기로만 제한 (스트립 전체를 덮지 않음)

// 캡션 없을 때
color: TOKEN.textOnDark, opacity: 0.6, fontWeight: '300'
→ 있을 때와 명확히 구분되어야 함

fontSize: TOKEN.fontCaptionLarge (fs20)
numberOfLines: 1
textShadowColor: 'rgba(0,0,0,0.5)'
```

**케이스 E — 모달 카드 내부 (흰색 배경):**

| 배경 | 텍스트 |
|---|---|
| TOKEN.bgModalCard (white) | TOKEN.textPrimary (gray900) / TOKEN.textSecondary (gray500) |

---

### 6-4. 버튼 조립 규칙

#### Type A — Primary (올리기)
```
용도: 핵심 단일 액션 (올리기)
배경: TOKEN.btnPostBg (활성 눌림 피드백은 activeOpacity로 처리, 별도 pressed 배경색 없음)
텍스트: TOKEN.btnPostText, fontSize: TOKEN.fontPostBtn
높이: TOKEN.minTouchTarget
borderRadius: TOKEN.postBtnRadius
width: '100%'
```

#### Type B — TabBar
```
용도: 하단 탭바 탭 버튼
아이콘: Ionicons, size TOKEN.tabIconSize(16)
라벨: fontSize TOKEN.fontTab(11)
활성: color TOKEN.textTabActive (white)
비활성: color TOKEN.textTabInactive (gray500)
높이: TOKEN.tabBarH (패딩 제외)
flex: 1, alignItems: 'center', justifyContent: 'center'
```

**탭 아이콘 매핑 (Ionicons):**
```
피드 (활성)   → home          피드 (비활성) → home-outline
친구 (활성)   → people        친구 (비활성) → people-outline
설정 (활성)   → settings      설정 (비활성) → settings-outline
```

#### Type C — Emoji (BeReal 패턴 — 아이콘→바 확장→단독 표시→재탭)

**3단계 상태:**
```
상태 1 — 미선택 (emojiBarOpen: false, mySelection[stripId]: null)
  우하단에 작은 댓글 아이콘 버튼(💬)만 표시
  탭 → 상태 2로 전환 (이모지 바 확장)

상태 2 — 바 확장 (emojiBarOpen: true, mySelection[stripId]: null)
  이모지 5개 가로 바가 우하단에서 슬라이드 업
  배경: TOKEN.emojiBarBg (white15), borderRadius TOKEN.emojiBarRadius
  이모지 탭 → 해당 이모지 선택, 바 닫힘 → 상태 3
  바깥 영역 탭 → 바 닫힘 → 상태 1

상태 3 — 선택됨 (emojiBarOpen: false, mySelection[stripId]: '🔥' 등)
  선택된 이모지 하나만 우하단에 표시 (크게, scale 1.2)
  카운트/배지 없음
  탭 → 이모지 바 재오픈 → 상태 2 (다른 이모지로 변경 가능)
  같은 이모지 재탭 → 선택 취소 → 상태 1

애니메이션:
  상태 1→2: 이모지 바 fade+slideUp (TOKEN.motionNormal)
  상태 2→3: 바 fade out, 선택 이모지 scale bounce (TOKEN.motionFast)
  상태 3→1: 이모지 fade out (TOKEN.motionFast)
```

**댓글 아이콘 버튼 (상태 1):**
```
position: absolute, bottom: TOKEN.stripPad, right: TOKEN.stripPad
color: TOKEN.textOnDark, opacity: 0.7
fontSize: TOKEN.fontEmoji (fs24) — 아이콘 크기
```

**이모지 바 (상태 2):**
```
position: absolute, bottom: TOKEN.stripPad, right: TOKEN.stripPad
flexDirection: 'row', gap: TOKEN.emojiGap
backgroundColor: TOKEN.emojiBarBg (white15)
borderRadius: TOKEN.emojiBarRadius
paddingHorizontal: TOKEN.sp8, paddingVertical: TOKEN.sp4
각 아이템: 너비 TOKEN.emojiItemW (44dp), fontSize TOKEN.fontEmoji (fs24)
```

**선택된 이모지 (상태 3):**
```
position: absolute, bottom: TOKEN.stripPad, right: TOKEN.stripPad
fontSize: TOKEN.fontEmoji (fs24), scale: 1.2
배경 없음, 단독 표시
```

#### Type D — Primary Filled (친구 초대)
```
용도: 친구탭 초대 버튼
배경: TOKEN.btnPrimaryBg (white)
텍스트: TOKEN.btnPrimaryText (gray900)
borderRadius: TOKEN.btnPrimaryRadius
높이: TOKEN.minTouchTarget
paddingHorizontal: TOKEN.sectionPad
```

**공통 금지:** 그림자·테두리·아이콘 단독 사용 (라벨과 함께는 허용)

---

### 6-5. 오버레이 조립 규칙

#### Type A — 부분 오버레이
```
용도: 이모지 바
배경: TOKEN.emojiBarBg
position: absolute, 크기: 콘텐츠 맞춤
(닉네임 라벨은 배경 없음 — 텍스트만 + text shadow)
```

#### Type B — 전체 오버레이
```
용도: 카운트다운 (전체화면), 모달 딤드 (화면 전체)
배경: 카운트다운은 반투명 검정(dim), 모달은 TOKEN.bgModalDim
width: '100%', height: '100%' (또는 Modal 컴포넌트)
```

#### Type C — Border Beam (촬영 중 전용)
```
용도: shooting 상태에서 "나" 플로팅 레이어 테두리에 촬영 진행을 알리는 인터랙션
구현: react-native-svg Rect(rx/ry=TOKEN.borderBeamCornerRadius) 2겹 — 완전 채색 베이스 라인 + 흰색 글로우 strokeDasharray/Offset 애니메이션 하이라이트
배경: 없음 (그라데이션 코멧만), TOKEN.borderBeamColors, 두께 TOKEN.borderBeamThickness
position: absolute, StyleSheet.absoluteFillObject (부모 플로팅 레이어 크기를 그대로 따름)
애니메이션: Animated.loop, linear, 무한 반복 (정지 조건 없음 — shooting 동안 계속), TOKEN.borderBeamDuration
```

**공통 금지 (오버레이·모달 레벨):** blur / Modal animationType="slide" 외 모달 전환 애니메이션 / 오버레이 중첩
> 컴포넌트 내부 마이크로 인터랙션(터치 피드백, Animated API 등)은 섹션 14-1 프로토콜을 통해 제안 가능.

---

### 6-6. 간격·정렬 규칙

```
스트립 내 위치:
  좌상단: { position:'absolute', top: TOKEN.nicknamePad, left: TOKEN.nicknamePad }
  좌하단: { position:'absolute', bottom: TOKEN.stripPad, left: TOKEN.stripPad, right: TOKEN.stripPad }
  중앙:   { justifyContent:'center', alignItems:'center' }
  StatusLabel: { position:'absolute', top:0, bottom:0, left:0, right:0, justifyContent:'center', alignItems:'center' }

이모지 바 (가로 배치, 우하단):
  position: 'absolute', bottom: TOKEN.stripPad, right: TOKEN.stripPad
  flexDirection: 'row', gap: TOKEN.emojiGap

탭바 내부:
  각 탭 flex: 1
  아이콘 + 라벨 수직 중앙 정렬
  paddingBottom: safeAreaBottom

모달 카드 내부:
  패딩: TOKEN.modalCardPadding (사방)
  요소 간 수직 간격: TOKEN.modalElementGap
  PostButton 상단 여백: TOKEN.postBtnTopMargin

친구탭/설정탭 섹션:
  paddingHorizontal: TOKEN.sectionPad
  섹션 간 구분: borderBottom TOKEN.borderWidth TOKEN.borderDefault
```

---

### 6-7. 상태별 노출 표

**나(isMe:true) 스트립:**

| 요소 | waiting | shooting | captioning | posted |
|---|---|---|---|---|
| 플로팅 레이어 크기 | 도킹 (stripHeight) | 전체화면 (screenHeight, 애니메이션) | 도킹으로 복귀 | 도킹 |
| StripBackground | CameraView (라이브 프리뷰) | CameraView (동일, 유지됨) | 촬영본(영상/파스텔) | 촬영본(영상/파스텔) |
| NicknameLabel | ✅ shadow | ✅ shadow | ✅ shadow | ✅ shadow |
| StatusLabel | ✅ "탭해서 찍기" fs20 완전중앙(레이어3) | ❌ | ❌ | ❌ |
| CountdownOverlay (레이어4) | ❌ | ✅ 1→2→3 카운트업 | ❌ | ❌ |
| BorderBeam | ❌ | ✅ 테두리 순환 | ❌ | ❌ |
| CaptionLabel | ❌ | ❌ | ❌ | ✅ (항상 렌더 — caption≠null이면 실제 캡션, null이면 "캡션 추가" placeholder. 친구와 달리 조건부로 숨겨지지 않는다) |
| TimestampLabel | ❌ | ❌ | ❌ | ✅ 좌하단 fs14 |
| EmojiIcon/EmojiBar (우하단) | ❌ | ❌ | ❌ | ✅ (💬→바확장→단독표시) |
| EditCaptionBtn | ❌ | ❌ | ❌ | ✅ (캡션 유무 무관 항상 탭 가능) |

**친구(isMe:false) 스트립:**

| 요소 | waiting (미촬영) | posted (촬영완료) |
|---|---|---|
| StripBackground | TVNoise (40×15, opacity≤0.15) | 실제사진/파스텔 |
| NicknameLabel (실제 닉네임) | ✅ shadow | ✅ shadow |
| TimestampLabel | ❌ | ✅ 좌하단 fs14 |
| CaptionLabel | ❌ | ✅ (caption≠null일 때만 렌더 — "나"와 달리 placeholder 없이 완전히 숨겨짐, hasCaption && 조건부) |
| EmojiIcon/EmojiBar (우하단) | ❌ | ✅ (BeReal 패턴) |

---

### 6-8. 새 화면 추가 체크리스트

```
1. 섹션 12 스코프 IN 목록에 추가
2. 새 토큰 필요 시 섹션 4 PRIMITIVE 먼저 등록 → TOKEN Semantic 매핑
3. 섹션 6-7 노출 표에 새 요소 행 추가 (6개 상태 모두)
4. 섹션 6-1~6-6 문법 위반 여부 확인
5. 섹션 11 컴포넌트 트리에 새 노드 추가
6. 섹션 0 버전 히스토리 업데이트
7. 이 문서를 Claude에게 전달 → App.js 전체 재생성
```

**절대 금지:** 코드 먼저 수정 / TOKEN 밖 하드코딩 / 문서 없이 임의 추가

---

### 6-9. AuthFlow 단계 화면 조립 문법

```
용도: 진입/가입/로그인 온보딩의 모든 단계 화면(SignupEmail, SignupPassword, SignupNickname,
      LoginEmail, LoginPassword)이 공통으로 따르는 템플릿
배경: TOKEN.bgTabBar (앱 메인 화면과 동일한 다크 배경, 온보딩만 다른 톤 쓰지 않음)

레이아웃 (위→아래):
  1. 상단 바: 뒤로가기 화살표(Welcome/Choice 제외 모든 단계) + 진행 점(progress dots)
  2. 본문: 질문 텍스트(fs20~24, 굵게) + 입력 필드 1개 + 에러/힌트 텍스트
  3. 하단: 기본(Primary) 버튼 1개 — 유효성 통과 전까지 TOKEN.btnDisabledOpacity로 비활성

절대 규칙 — 한 화면 한 정보:
  한 단계 화면에는 입력 필드가 정확히 1개만 있어야 한다.
  이메일+비밀번호처럼 서로 다른 정보를 같은 화면에 함께 두지 않는다.
  "다음/가입하기/로그인" 버튼도 정확히 1개만 존재한다 (보조 버튼 없음).

진행 점(progress dots):
  가입 플로우: 점 3개 (이메일/비밀번호/닉네임), 로그인 플로우: 점 2개 (이메일/비밀번호)
  현재 단계 점 = TOKEN.accentColor, 나머지 = PRIMITIVE.gray700

공통 금지: 한 화면에 2개 이상의 TextInput / 선택지 버튼 2개 이상(다음 단계로 넘어가는 목적 외) / 뒤로가기 없이 이전 단계로 못 돌아가는 구조
```

---

## 7. 상태 정의 및 전이 규칙


### 나(isMe:true) 상태 전이

```
[waiting] ──[트리거]──▶ [shooting] ──[3초]──▶ [captioning] ──[올리기]──▶ [posted]
    ▲                                                                          │
    └──────────────────────────────[↺ 리셋]────────────────────────────────────┘
```

- 트리거: **피드탭에서 내 스트립(isMe:true)을 탭 → status: 'shooting' 전환 (CameraModal 없이 스트립 자체가 계속 카메라 뷰 유지, wrapper 엘리먼트 타입도 상태와 무관하게 항상 동일하게 유지 — CameraView 리마운트 방지)**
- **shooting 진입과 동시에 "나" 플로팅 레이어가 도킹 크기 → 전체화면으로 애니메이션 확대(TOKEN.motionNormal). captioning 진입 시 다시 도킹 크기로 축소**
- **shooting 상태에서는 탭 전환이 잠긴다 (TabBar onTabPress가 status==='shooting'이면 무시) — 촬영 중 다른 탭으로 이동해 CameraView/recordAsync 세션이 끊기는 사고 방지**
- shooting 중 탭(스트립 재탭) 무시 (이미 촬영 진행 중)
- 리셋: 설정탭에서 실행

### 친구(isMe:false) 상태 전이

```
[waiting] ──[촬영완료 수신]──▶ [posted]
    ↑
[리셋]
```

- 친구는 두 가지 상태만: waiting(미촬영) / posted(촬영완료)
- waiting 상태에서는 TV 노이즈 표시
- 실제 앱에서는 서버 푸시로 상태 업데이트 — 프로토타입에서는 시뮬레이션

### 상태 전환 트랜지션

| 전환 | 트랜지션 | TOKEN |
|---|---|---|
| waiting → posted (친구) | StripBackground TVNoise → photo컬러 fade-in | TOKEN.motionNormal |
| captioning → posted (나) | StripBackground fade-in | TOKEN.motionNormal |
| posted 진입 | EmojiBar fade+slideUp 등장 | TOKEN.motionNormal |
| shooting 진입 | "나" 플로팅 레이어 도킹→전체화면 확대 | TOKEN.motionNormal |
| captioning 진입 (나) | "나" 플로팅 레이어 전체화면→도킹 축소 | TOKEN.motionNormal |
| shooting 동안 | BorderBeam 테두리 순환 (무한 반복) | 별도 루프 (4.8초/바퀴) |
| shooting 매초 | CountdownOverlay scale pulse | TOKEN.motionFast |
| 이모지 탭 | 이모지 scale bounce | TOKEN.motionFast |

---

### 7-1. AuthFlow 상태 정의

```
authStatus 값:
  'welcome'          — 시작화면 (앱 최초 진입, 초대링크 진입 모두 동일하게 여기로)
  'choice'           — 로그인/가입 선택
  'signup-email'     — 가입 1/3: 이메일
  'signup-password'  — 가입 2/3: 비밀번호
  'signup-nickname'  — 가입 3/3: 닉네임
  'login-email'      — 로그인 1/2: 이메일
  'login-password'   — 로그인 2/2: 비밀번호
  'authenticated'    — 인증 완료, 메인 앱(AppContent) 렌더
```

**전이 규칙:**
```
welcome → (시작하기 탭) → choice
choice → (가입하기 탭) → signup-email
choice → (로그인 탭) → login-email
choice → (뒤로가기) → welcome

signup-email → (다음, 이메일 형식 유효 + 중복 아님) → signup-password
signup-password → (다음, 6자 이상) → signup-nickname
signup-nickname → (가입 완료, 1~10자) → accounts에 계정 추가 + authStatus: 'authenticated'
signup-* → (뒤로가기) → 바로 이전 signup 단계 (email은 choice로)

login-email → (다음, accounts에 존재하는 이메일) → login-password
login-password → (로그인, 비밀번호 일치) → authStatus: 'authenticated'
login-* → (뒤로가기) → 바로 이전 login 단계 (email은 choice로)

authenticated → (설정탭 로그아웃) → authStatus: 'welcome' (accounts는 세션 동안 유지, me/friends 등 콘텐츠 상태는 초기화)
```

**유효성 검사 실패 시:** 다음 버튼은 비활성 상태를 유지한다 (탭 자체가 막힘). 로그인 단계에서 이메일 미가입/비밀번호 불일치는 버튼을 눌렀을 때만 판별 가능하므로, 탭 후 에러 텍스트를 본문 하단에 표시한다.

---

## 8. 화면 구조

### 탭바 구조

```
탭바 (하단 고정)
├── 탭 1: 피드     (home / home-outline)
├── 탭 2: 친구     (people / people-outline)
└── 탭 3: 설정     (settings / settings-outline)
```

- 탭바 배경: TOKEN.bgTabBar (gray900)
- 상단 border: TOKEN.borderWidth, TOKEN.borderDefault
- 높이: TOKEN.tabBarH + safeAreaBottom
- 활성 탭: TOKEN.textTabActive (white)
- 비활성 탭: TOKEN.textTabInactive (gray500)
- **me.status==='shooting'이면 탭 전환 잠금 — onTabPress 핸들러가 무시하고 아무 동작도 하지 않음**

---

### 탭 1 — 피드 화면

"나" 스트립은 피드 스크롤 목록의 일부가 아니다. AppContent 루트에 항상 마운트된 플로팅 레이어이며, 피드 탭에서만 보이고(다른 탭에서는 opacity:0) waiting/captioning/posted일 땐 피드 상단에 도킹된 크기로, shooting일 땐 전체화면(탭바까지 포함)으로 애니메이션 확대된다. 친구 목록은 "나"의 도킹 높이만큼 상단 여백을 두고 별도 ScrollView로 그 아래 영역을 채운다.

**나 스트립 (isMe:true, 플로팅 레이어):**

| 상태 | 배경 | 내용 |
|---|---|---|
| waiting | CameraView (라이브 프리뷰), 도킹 크기 | 닉네임(실제 닉네임)+shadow / "탭해서 찍기" fs20 완전 중앙(레이어3) |
| shooting | CameraView (동일, 계속 유지), **전체화면으로 확대** | 카운트다운 1→2→3 오버레이(레이어4) + **BorderBeam 테두리 순환** |
| captioning | 촬영본(영상/파스텔), 도킹 크기로 복귀 | 닉네임+shadow |
| posted | 촬영본(영상/파스텔), 도킹 크기 | 닉네임+shadow / 타임스탬프(fs14, 좌하단) / 캡션(fs16, 좌하단, 1줄) / 이모지 우하단(가로) |

**친구 스트립 (isMe:false, "나" 도킹 높이만큼 아래에서 시작하는 별도 ScrollView):**

| 상태 | 배경 | 내용 |
|---|---|---|
| waiting | TVNoise (40×15, opacity≤0.15) | 닉네임(실제 닉네임)+shadow |
| posted | 실제사진/파스텔 | 닉네임+shadow / 타임스탬프(fs14, 좌하단) / 캡션(fs16, 좌하단, 1줄) / 이모지 우하단(가로) |

**StatusLabel "탭해서 찍기" 스타일:**
```
position: absolute, top:0, bottom:0, left:0, right:0
justifyContent: 'center', alignItems: 'center'
color: TOKEN.textOnDark
fontSize: TOKEN.fontStatus (fs20)
fontWeight: '700'
// 알림 꺼짐 상태에서도 동일 위치, 텍스트만 "알림 꺼짐"으로 교체
```

**캡션 스타일 (레이어5 좌하단, 1줄 고정):**
```
position: absolute
bottom: TOKEN.stripPad
left: TOKEN.stripPad
right: TOKEN.stripPad + (이모지바 가로 영역 — 자동으로 우측 분리)
color: TOKEN.textOnDark
fontSize: TOKEN.fontCaptionLarge (fs20)
fontWeight: '600'
numberOfLines: 1   // 필수 — 줄바꿈 금지, 넘치면 ... 처리
textShadowColor: 'rgba(0,0,0,0.5)'
```

**캡션 재수정 (캡션 유무와 무관하게 항상 탭 가능):**
```
// posted 상태 좌하단(캡션 자리)에 항상 존재하는 탭 가능 영역을 둔다
// — caption!=null 조건으로 렌더 자체를 막지 않음
//
// caption이 있을 때: 캡션 텍스트를 탭하면 모달 재오픈, 기존 caption으로 입력값 초기화
// caption이 없을 때: 같은 위치에 작은 안내 텍스트("캡션 추가")를 탭 가능하게 표시
//   → 탭하면 캡션 모달 오픈 (입력값 빈 문자열로 시작)
//
// 캡션 탭 영역은 좌하단 한정 (absoluteFillObject 사용 안 함)
// → 이모지 바(우하단)와는 처음부터 다른 코너라 터치 충돌 없음
```

**이모지 바 스타일 (가로 배치 + 반투명 배경):**
```
position: absolute, bottom: TOKEN.stripPad, right: TOKEN.stripPad
flexDirection: 'row', gap: TOKEN.emojiGap
backgroundColor: TOKEN.emojiBarBg (white15 — 어떤 배경에서도 가시성 확보)
borderRadius: TOKEN.emojiBarRadius
paddingHorizontal: TOKEN.sp8, paddingVertical: TOKEN.sp4
각 아이템 너비: TOKEN.emojiItemW (44dp)

각 이모지:
  fontSize: TOKEN.fontEmoji (fs24)
  선택 시: scale bounce 1.0→1.35→1.2 (TOKEN.motionFast)
  (카운트 숫자 없음 — BeReal 패턴: 아이콘→바확장→단독표시)
```

**타임스탬프 스타일:**
```
position: absolute, bottom: TOKEN.stripPad, left: TOKEN.stripPad
color: TOKEN.textOnDark, opacity: 1.0
fontSize: TOKEN.fontTimestamp (fs14)
fontWeight: '500'
```

**닉네임 표시 (실제 닉네임, "친구" 라벨 아님):**
```
// AUTO_NICKNAMES = ['친구1','친구2','친구3'] 는 그대로 두되,
// 이는 "기본값"일 뿐 실제로는 각 친구의 nickname 필드를 그대로 출력
// "친구1"이라는 표시 자체가 "임시로 정한 이름"이라는 의미이지, 라벨이 아님
// 사용자가 설정탭에서 닉네임을 바꾸면 화면 전체(피드/친구탭)에 즉시 반영
fontSize: TOKEN.fontNickname (fs16)
```

**인라인 라이브 카메라 플로우:**
```
1. 카메라 권한이 있으면 나 스트립(플로팅 레이어) 배경이 waiting 진입 시점부터 상시 CameraView(라이브 프리뷰), 도킹 크기
2. 피드탭 "탭해서 찍기" 텍스트(StatusLabel) 영역 탭 → status: 'shooting' 전환 (모달 없음, CameraView 그대로 유지)
   → 플로팅 레이어가 도킹→전체화면으로 애니메이션 확대(TOKEN.motionNormal), 탭 전환 잠김
3. onCameraReady 콜백 이후에만 카운트다운 시작 (워밍업 버그 방지)
   → 카운트다운 시작과 동시에 recordAsync({maxDuration:3}) 녹화 시작, Promise를 recordingPromiseRef에 저장
   → BorderBeam 테두리 순환 시작 (전체화면 레이어 위)
4. 카운트다운 1→2→3 (카운트업 — 녹화 경과 시간을 보여주는 편이 직관적)
5. 3 도달 → stopRecording() → recordingPromiseRef await → uri 획득 (실패 시 파스텔 fallback, 타임아웃 안전장치)
6. status: 'captioning' → 플로팅 레이어 전체화면→도킹 축소, 탭 전환 잠금 해제, 캡션 모달 자동 오픈
7. 올리기 → status: 'posted'
```

---

### 탭 2 — 친구 화면

**구성:**
```
ScrollView (padding sp20, gap sp24)
├── 섹션: 친구 초대
│   ├── 타이틀: "친구 초대" (fontSectionTitle, marginBottom sp12)
│   ├── 설명: "링크로 친구를 셋로그에 초대하세요" (fontBody)
│   └── 버튼 [Type D]: "초대 링크 보내기" (marginTop sp20)
│
└── 섹션: 친구 목록
    ├── 타이틀: "친구 목록 (N/3)"
    ├── 설명: "📷 아이콘으로 촬영완료 시뮬 · 🗑 아이콘으로 삭제"
    └── FriendRow × N (각 row minHeight 64dp, paddingVertical sp16)
        ├── 좌측: 닉네임(fontSectionTitle, fontWeight 600) + 상태(fontBody, marginTop sp6)
        └── 우측: 아이콘 2개 (각 44×44dp)
            ├── camera-outline / checkmark-circle (촬영 시뮬)
            └── trash-outline (dangerColor, 삭제)
```

---

### 탭 3 — 설정 화면

**구성:**
```
ScrollView (padding sp20, gap sp24)
├── 섹션: 내 정보
│   ├── 타이틀: "내 정보"
│   └── NicknameEditRow (세로 배치 — 라벨 위, 입력칸 아래 전체폭)
│       ├── 라벨: "닉네임" (위, marginBottom sp8)
│       └── TextInput (현재 닉네임 표시, width:'100%', textAlign:'left', 좌측 정렬,
│                       paddingHorizontal sp12, onBlur 시 저장)
│
├── 섹션: 알림
│   ├── 타이틀: "알림"
│   └── SettingRow: "알림 받기" + Switch (switchActiveColor)
│
├── 섹션: 계정
│   ├── 타이틀: "계정"
│   └── "로그아웃" 버튼 (dangerColor 텍스트, 확인 Alert 후 authStatus: 'welcome')
│
├── 섹션: 데이터
│   ├── 타이틀: "데이터"
│   └── "전체 초기화" 버튼 (dangerColor 텍스트)
│
└── 섹션: 앱 정보
    ├── "Setlog Mobile Mini"
    └── 버전 문자열 — 코드의 `APP_VERSION` 단일 상수 참조(v3.43(발견 95) 신규 규칙: 이 문서 버전이 오를 때마다 그 상수값도 함께 갱신한다. "v3.19" 하드코딩 방치가 재발한 원인이 별도 상수 자체가 없었던 것이므로, 상수화 + 이 규칙으로 재발을 막는다)
```

> **촬영은 설정탭에 없음** — 피드탭에서 "탭해서 찍기" 텍스트를 탭해서 전체화면 카메라로 촬영

---

### 캡션 모달 (공통, 신규작성+재수정 공용)

- `Modal` (transparent, animationType="none")
- **visible이 false면 컴포넌트 자체를 렌더하지 않음 (if(!visible) return null)** — autoFocus 조기 발동 버그 방지
- **딤과 카드 애니메이션 분리 + 카드 하단 고정:**
  - 딤(Animated.View, absoluteFillObject): fade in/out만, 슬라이드 없음
  - 카드: KeyboardAvoidingView 안, justifyContent:'flex-end'로 하단 고정
  - 카드 translateY 애니메이션: 300→0 (슬라이드 업)
- `KeyboardAvoidingView` (iOS: "padding", Android: "height")가 화면 전체를 flex:1, justifyContent:'flex-end'로 감싸고,
  내부에 딤 탭 영역(TouchableWithoutFeedback)과 카드를 함께 배치한다
- **외부 탭(딤드 영역): 모달 닫힘**
- 구성:
  - NicknameHeader: `"{nickname}의 캡션"`, TOKEN.textPrimary, TOKEN.fontNicknameHeader (fs16)
  - HintText: "사진 설명 (선택, 최대 50자)", TOKEN.textSecondary, TOKEN.fontModalHint (fs14)
  - TextInput: 기존 caption 값으로 초기화 (재수정 시), fontSize TOKEN.fontCaption (fs14)
  - TextInput: maxLength:50, autoFocus:true, returnKeyType:"done", selectTextOnFocus:true
  - **소리 포함 Switch:** 라벨 "소리 포함", 기본값 false, trackColor true는 TOKEN.switchActiveColor
    - ON: media.hasSound = true (친구들에게 뮤트 아이콘 표시됨)
    - OFF: media.hasSound = false (아이콘 없음)
    - 재수정 시 현재 hasSound 값으로 초기화
  - PostButton: Type A, label: "올리기"

---

### 탭 0 — AuthFlow (authStatus !== 'authenticated'일 때 전체 화면 대체)

**공통 레이아웃 (섹션 6-9 템플릿 준수):**
```
SafeAreaView (bgTabBar 배경, 메인 앱과 톤 통일)
├── 상단 바 (Welcome 제외)
│   ├── BackButton (chevron-back, 좌측, 44×44 터치영역)
│   └── ProgressDots (우측 또는 중앙 — 가입 3개 / 로그인 2개)
├── 본문 (flex:1, 중앙 정렬)
│   ├── QuestionText (fs24, 굵게, TOKEN.textOnDark)
│   ├── TextInput (해당 단계의 값 1개만, fs20, 하단 border)
│   └── ErrorText (있을 때만, TOKEN.dangerColor, fs14)
└── 하단
    └── PrimaryButton (Type A, 유효성 통과 전 비활성)
```

**Welcome:**
| 요소 | 내용 |
|---|---|
| 로고/타이틀 | "Setlog" fs24 굵게 |
| 서브카피 | "친구들과 동시에 순간을 찍어요" fs14, textSecondary |
| CTA | "시작하기" Type A 버튼 → choice |

**Choice:**
| 요소 | 내용 |
|---|---|
| 질문 | "이미 계정이 있으신가요?" |
| 버튼 1 | "로그인" Type A → login-email |
| 버튼 2 | "가입하기" 텍스트 버튼(보조) → signup-email |

**SignupEmail / LoginEmail:**
| 요소 | 내용 |
|---|---|
| 질문 | "이메일이 뭐예요?" |
| 입력 | TextInput, keyboardType:"email-address", autoCapitalize:"none", placeholder:"you@example.com" |
| 에러 | "올바른 이메일 형식이 아니에요" / (로그인) "가입되지 않은 이메일이에요" |

**SignupPassword / LoginPassword:**
| 요소 | 내용 |
|---|---|
| 질문 | "비밀번호를 만들어주세요" (가입) / "비밀번호를 입력하세요" (로그인) |
| 입력 | TextInput, secureTextEntry, placeholder:"6자 이상" |
| 에러 | "비밀번호는 6자 이상이어야 해요" (가입) / "비밀번호가 일치하지 않아요" (로그인) |
| 버튼 | (로그인만) "로그인" — 탭 시 최종 인증 시도 |

**SignupNickname:**
| 요소 | 내용 |
|---|---|
| 질문 | "닉네임을 정해주세요" |
| 입력 | TextInput, maxLength:10, placeholder:"닉네임 입력" |
| 버튼 | "가입 완료" — 탭 시 accounts에 추가 + authenticated 전환 |

---

## 9. 기능 명세

### 기능 1 — 촬영 트리거

- 카메라 권한이 있으면 나 스트립은 waiting 상태부터 이미 상시 CameraView(라이브 프리뷰)를 배경으로 렌더한다
- **피드탭 내 스트립(waiting) 탭** → status: 'shooting' 전환 (모달 없음)
- notifOn:false 또는 waiting 아닌 상태면 무반응
- **스트립을 감싸는 TouchableOpacity는 모든 상태에서 동일하게 유지** — 탭 가능 여부는 아래 핸들러 내부 가드로만 제어하며, wrapper 타입을 바꿔 CameraView를 리마운트시키지 않는다

```js
const handleMeStripPress = async () => {
  if (!me.notifOn || me.status !== 'waiting') return
  if (!hasCameraPermission) {
    const result = await requestPermission()
    if (!result.granted) { Alert.alert('카메라 권한 필요', '...'); return }
  }
  setMe(prev => ({...prev, status:'shooting'}))
  // 카운트다운 시작은 여기서 직접 하지 않는다 — 기능 2의 cameraReady + useEffect가 단독으로 담당
}
```

---

### 기능 2 — 3초 영상 촬영 플로우

> **가로 강제 전환은 스코프 OUT.** expo-screen-orientation은 Expo Go 충돌로 제거된 상태이며 재도입하지 않는다.

**wrapper 리마운트로 인한 이중 트리거 문제와 수정:**
```
문제: "나" 스트립 wrapper가 상태별로 TouchableOpacity↔View로 바뀌면서 CameraView가 리마운트됨.
      리마운트된 새 CameraView의 onCameraReady가 다시 호출되는데, 기존에는 이걸 보정하려고
      handleMeStripPress에 setTimeout(300ms) 안전장치를 같이 두고 있었다.
      실기기에서 카메라 재초기화가 300ms보다 오래 걸리면 두 트리거가 동시에 발동 →
      recordingPromiseRef가 두 번째 recordAsync() 호출로 덮어써지고, 첫 번째 Promise는
      아무도 기다리지 않다가 나중에 실패하며 콘솔에 지연된 rejection 경고로 나타난다.
      결과: 영상이 파스텔로 fallback되거나, 카메라 프리뷰가 멈춘 채 상태 전환이 안 됨.

수정: (1) wrapper 엘리먼트 타입을 고정해 리마운트 자체를 없앤다 (섹션 6-7, 11 참조).
      (2) 카운트다운 시작을 cameraReady 상태 + useEffect 단일 경로로만 트리거한다.
```

**recordAsync 레이스 컨디션 문제와 수정:**
```
문제: recordAsync()는 녹화가 끝나야(stopRecording 호출 시) resolve되는 Promise를 반환한다.
      기존처럼 .then(({uri}) => pendingVideoUri.current = uri) 형태로 콜백만 등록해두고
      stopRecording() 직후 pendingVideoUri.current를 즉시 읽으면, 아직 Promise가 resolve되지
      않았을 확률이 높아 uri가 항상 null인 채로 파스텔 fallback만 나가는 버그가 있었다.

수정: recordAsync()가 반환하는 Promise 객체 자체를 recordingPromiseRef에 저장해두고,
      stopRecording() 호출 후 그 Promise를 await로 기다려 resolve된 uri를 받는다.
```

**촬영 플로우:**
```js
// 카메라가 준비됐는지 여부를 별도 상태로 추적 (CameraView가 리마운트되지 않으므로
// 앱에서 카메라가 최초로 초기화될 때 — 대개 waiting 상태 — 딱 한 번만 true가 된다)
const [cameraReady, setCameraReady] = useState(false)
const handleCameraReady = useCallback(() => setCameraReady(true), [])

// 카운트다운 시작은 이 useEffect 하나가 전담한다 (다른 곳에서 startCameraCountdown 호출 금지)
useEffect(() => {
  if (me.status === 'shooting' && cameraReady && !cameraIntervalRef.current) {
    startCameraCountdown()
  }
}, [me.status, cameraReady])

// 카운트업 1→2→3
const startCameraCountdown = () => {
  if (recordingPromiseRef.current) return   // 이미 녹화 중이면 중복 시작 방지
  setCameraCountdown(1)
  recordingPromiseRef.current = cameraRef.current.recordAsync({ maxDuration: 3 })
  let count = 1
  const id = setInterval(() => {
    count += 1
    if (count > 3) {
      clearInterval(id)
      cameraIntervalRef.current = null
      triggerShutterRef.current?.()   // ref 경유 — setInterval 클로저가 stale 함수를 참조하지 않도록
    } else {
      setCameraCountdown(count)
    }
  }, 1000)
  cameraIntervalRef.current = id
}

// triggerShutter: useCallback으로 선언, triggerShutterRef.current에 매 렌더 최신 함수 갱신
// recordAsync Promise가 native 이슈로 영원히 안 끝나는 경우를 대비해 5초 타임아웃 안전장치 추가
const triggerShutter = useCallback(async () => {
  if (cameraIntervalRef.current) { clearInterval(cameraIntervalRef.current); cameraIntervalRef.current = null }
  try { cameraRef.current?.stopRecording() } catch {}

  let videoUri = null
  try {
    if (recordingPromiseRef.current) {
      const originalPromise = recordingPromiseRef.current
      originalPromise.catch(() => {})   // 타임아웃으로 먼저 빠져나가도 원본 Promise가 나중에 rejected되면 조용히 무시
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('recordAsync timeout')), 5000))
      const result = await Promise.race([originalPromise, timeout])   // 무한 대기 방지
      videoUri = result?.uri || null
    }
  } catch {}
  recordingPromiseRef.current = null

  // fallback: uri 없으면 PHOTO_COLORS hex (파스텔) — 카메라 권한 없거나 녹화 실패/타임아웃 시
  const uri = videoUri || PHOTO_COLORS[Math.floor(Math.random()*PHOTO_COLORS.length)]
  setCameraCountdown(null)
  setMe(prev => ({ ...prev, status: 'captioning', media: { uri, hasSound: false } }))
  setActiveCapturing(true)
}, [])
```

**캡션 모달 소리 토글:**
```js
// captioning 상태 → 캡션 모달 오픈
// 캡션 모달 안에 소리 포함 여부 Switch 추가
// Switch ON → me.media.hasSound = true
// Switch OFF (기본값) → me.media.hasSound = false
// 올리기 탭 → caption 저장, status: 'posted', capturedAt: Date.now()
```

**"나" 자신의 영상 소리 재생 (규칙 공백 수정):**
```
문제: 친구 영상에는 뮤트 아이콘(MuteButton)이 있어 unmutedStripId로 소리 on/off를
      전환할 수 있지만, "나" 자신의 posted 영상에는 애초에 뮤트 아이콘이 없다(섹션 6-7).
      "나" 영상의 음소거 여부를 존재하지도 않는 unmutedStripId 메커니즘에 연결해두면
      항상 undefined → 항상 음소거되는 버그가 생긴다. "소리 포함"을 켜도 실제로는
      절대 소리가 나지 않는 증상으로 나타난다.

수정: "나" 자신의 posted 영상은 media.hasSound 값에 직접 따라 음소거 여부를 정한다.
      hasSound === true → 자동으로 음소거 해제(뮤트 버튼 없이 바로 들림)
      hasSound === false → 음소거 (기본값)
      unmutedStripId/뮤트 버튼 메커니즘은 friends 스트립 전용으로 그대로 유지한다.
```
```js
const isMeUnmuted = me.media?.hasSound || false
// VideoStrip uri={mediaUri} isMuted={!isMeUnmuted}
```

**캡션 재수정 (재수정 시 소리 토글 값도 함께 복원):**
```js
const handleEditCaption = () => {
  if (me.status !== 'posted') return
  setCaptionInput(me.caption || '')
  setCaptionHasSound(me.media?.hasSound || false)
  setActiveCapturing(true)
}
```

---

### 기능 3 — 친구 상태 시뮬레이션 + 친구 삭제

**촬영완료 시뮬:**
```
친구탭 → FriendRow 아이콘 버튼(camera-outline) 탭
→ 해당 친구 status: 'posted', photo: 랜덤 PHOTO_COLORS, capturedAt: Date.now()
```

**친구 삭제:**
```
FriendRow 우측 trash-outline 아이콘 탭 (롱프레스 아님)
→ Alert: "{nickname}을 삭제할까요?" → 취소 / 삭제
→ 삭제 시: friends 배열에서 해당 친구 제거
→ 친구가 0명이 되어도 제한 없음 (앱 기본 상태 자체가 "친구 없음, 나만" 이므로)
```

---

### 기능 4 — TV 노이즈

```js
// 친구 status === 'waiting' → TVNoise 컴포넌트 렌더
// 40×15 그리드, setInterval(TOKEN.motionNoise = 50ms, 20fps)
// 각 셀 opacity: Math.random() * 0.15  (최대 0.15)
// 셀 색상: random(['#000','#111','#222','#333']) (더 어두운 계열만)
// scanline overlay: rgba(0,0,0,0.10)
// 컴포넌트 언마운트 시 clearInterval 필수
```

> **성능 노트:** 매 tick마다 600개 셀 객체를 새로 만들어 전체 그리드를 리렌더한다.
> 친구 3명이 동시에 waiting이면 최대 1800개 View가 매 tick마다 리렌더될 수 있어
> 저사양 기기에서 프레임 저하 우려가 있다. 원래 16ms(60fps)였으나 50ms(20fps)로
> 완화 — "지지직거리는 노이즈" 느낌은 20fps로도 충분히 유지되면서 리렌더 부하는
> 약 3분의 1로 줄어든다.

---

### 기능 5 — 이모지 리액션 (BeReal 패턴 + 다중 사용자 중복 표시)

- `posted` 상태에만 이모지 UI 노출
- 위치: 스트립 우하단 (position absolute, right: TOKEN.stripPad, bottom: TOKEN.stripPad)
- 이모지 순서 고정: `['🔥','😂','👍','😮','😢']`

```js
// 상태 구조 (유닛별 myEmoji 필드 대신 전역 mySelection map으로 통합 관리)
// mySelection: { [stripId]: '🔥'|'😂'|'👍'|'😮'|'😢'|null }  — 스트립별 본인 선택
// emojiBarOpen: { [stripId]: boolean }        — 스트립별 바 열림 여부

// 💬 아이콘/선택된 이모지 탭 — 열림 상태를 토글한다 (별도의 "재오픈 전용" 함수는 없다)
const handleEmojiIconTap = (stripId) => {
  setEmojiBarOpen(prev => ({...prev, [stripId]: !prev[stripId]}))
}

// 바깥 탭 (바 닫기)
const handleEmojiBarDismiss = (stripId) => {
  setEmojiBarOpen(prev => ({...prev, [stripId]: false}))
}

// "나"와 친구는 각각 별도 핸들러로 구현되어 있다 (공용 추상 헬퍼 없음) —
// 둘 다 동일한 로직(같은 이모지 재탭=취소, 다른 이모지=교체)을 각자 reactions 배열에 적용한다.
// handleEmojiMe(emoji): me.reactions/mySelection.me 갱신
// handleEmojiFriend(id, emoji): friends[id].reactions/mySelection[id] 갱신
// 두 함수 모두 선택 완료 시 emojiBarOpen[stripId]를 false로 닫는다.
```

**애니메이션:**
- 바 열림: fade + slideUp (TOKEN.motionNormal)
- 이모지 선택: scale bounce 1.0→1.35→1.2 (TOKEN.motionFast)
- 바 닫힘: fade out (TOKEN.motionFast)

---

### 기능 6 — 친구 초대

```js
import { Share } from 'react-native'

const handleInvite = async () => {
  const inviteUrl = `https://github.com/crisis-designer/setlog-mobile-mini`  // 실제 앱 배포 전 임시 GitHub 링크
  await Share.share({
    message: `셋로그 같이 해요! 동시에 찍는 소셜 카메라 앱이에요 📸\n${inviteUrl}`,
    title: 'Setlog 초대',
    url: inviteUrl,  // iOS 전용: 공유 시트에 URL 별도 표시
  })
}
```

- 친구탭 "초대 링크 보내기" 버튼 탭 시 실행
- iOS: 공유 시트 자동 표시 (카카오톡, 문자, 메일 등)
- 초대 URL: `https://github.com/crisis-designer/setlog-mobile-mini` (앱 배포 전 임시 GitHub 링크)
  - 실제 앱스토어 배포 후 해당 링크로 교체

---

### 기능 7 — 타임스탬프

```js
// posted 진입 시 capturedAt: Date.now() 기록
// 표시: formatTimestamp(capturedAt)
// 방금 전 / N분 전 / 오전/오후 H:MM
const formatTimestamp = (ts) => {
  if (!ts) return ''  // capturedAt 없을 때 방어
  const diff = Date.now() - ts
  if (diff < 60000) return '방금 전'
  if (diff < 3600000) return `${Math.floor(diff/60000)}분 전`
  const d = new Date(ts)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2,'0')
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${m}`
}
```

---

### 기능 8 — 리셋

- 설정탭 "전체 초기화" → Alert 확인
- 나: status → 'waiting', countdown/photo/caption: null, reactions 전부 false
- 친구들: status → 'waiting', photo/caption: null, reactions 전부 false
- 닉네임은 초기화 대상 아님 (유저가 설정한 닉네임 유지)
- intervalRef clearInterval, activeCapturing: false
- **명시: "전체 초기화"는 accounts(가입된 계정 목록, RootController 상태)에 절대 영향을
  주지 않는다.** handleReset은 AppContent 내부 함수이고 accounts는 RootController에만
  존재해 애초에 서로 접근할 수 없는 구조다 — 로그인 상태를 유지한 채 피드/친구 콘텐츠만
  지워지는 것이 유일하게 가능한 동작이다. 로그아웃(섹션 9 기능15)과는 완전히 다른 동작이며
  섞어 쓰지 않는다.

---

### 기능 9 — 닉네임 수정

```js
// 설정탭 "내 정보" 섹션 — 내 닉네임 수정
const handleNicknameChange = (newNickname) => {
  const trimmed = newNickname.trim()
  if (!trimmed) return  // 빈 값 저장 금지
  setMe(prev => ({...prev, nickname: trimmed.slice(0, 10) })) // 최대 10자
}
// TextInput onBlur 또는 완료 키 입력 시 저장
// 변경 즉시 피드탭/친구탭 전체에 반영 (me.nickname 참조이므로 자동)
```

**입력칸 UX:**
```
// 라벨/입력칸을 같은 행이 아니라 세로로 배치 (좁은 우측정렬 입력칸은 커서가 항상
// 텍스트 끝에 있어 글자를 보며 수정하기 불편하다)
//   라벨("닉네임")은 위, TextInput은 아래 전체 폭(width:'100%')
//   textAlign: 'left', paddingHorizontal: sp12
//   이렇게 하면 입력칸이 충분히 넓어지고 커서 위치도 자연스러워짐
```

- 친구 닉네임은 친구탭에서 직접 수정하지 않음 (가입 시 정해진 닉네임이라는 설정)
- 향후 확장 여지로 남겨두되 현재 스코프에는 포함하지 않음

---

### 기능 10 — 촬영 중 전체화면 확대 + Border Beam

- shooting 진입 시 "나" 플로팅 레이어가 도킹 크기(stripHeight) → 전체화면(screenHeight, 탭바까지 포함)으로 애니메이션 확대
- captioning 진입 시 다시 도킹 크기로 축소
- 전체화면인 동안 테두리를 따라 그라데이션 코멧이 순환하는 BorderBeam 렌더링 (모서리 곡률 대응)

```js
const shootExpand = useRef(new Animated.Value(0)).current

useEffect(() => {
  Animated.timing(shootExpand, {
    toValue: me.status === 'shooting' ? 1 : 0,
    duration: TOKEN.motionNormal,
    useNativeDriver: false,
  }).start()
}, [me.status])

// SafeAreaView(edges:['top']) 내부 로컬 좌표계이므로 safeAreaTop을 top에 또 더하지 않는다
const meTop = shootExpand.interpolate({ inputRange:[0,1], outputRange:[0, -safeAreaTop] })
const meHeight = shootExpand.interpolate({ inputRange:[0,1], outputRange:[stripHeight, screenHeight] })
```

**BorderBeam 재구현 히스토리:**
```
v3.19~v3.20: 코멧을 "가로로 긴 막대 하나(112dp×4dp)"로 만들어 4변 전체를 돌게 했다.
      좌/우 변에서는 회전 없이 그대로 미끄러져 두꺼운 얼룩처럼 보였다.

v3.21: 4변 각각에 고정 방향(가로/세로) 트랙을 배치하고 트랙 안에서만 하이라이트가
      미끄러지게 해서 얼룩 문제는 해결했지만, 여전히 "직선 4개가 90도로 만나는" 구조라
      모서리가 둥근 기기(아이폰 Pro 라인 등)에서는 테두리가 그 곡선을 따라가지 못했다.

v3.24: 근본적으로 다른 방식으로 교체. react-native-svg로 둥근 사각형(rx/ry 적용) 경로
      자체를 그리고, 그 경로 위에서 strokeDasharray/strokeDashoffset으로 짧은 대시를
      이동시킨다. 경로 자체가 이미 둥근 사각형이므로 모서리도 자연스럽게 곡선을 그린다
      (직선을 이어붙이는 방식의 근본적 한계를 해결). 다만 기기별 정확한 모서리 곡률
      반지름을 얻는 공식 API는 iOS/Android 어디에도 없어, 최신 스마트폰들의 일반적인
      화면 모서리 곡률에 가까운 근사값(TOKEN.borderBeamCornerRadius, 56dp)을 사용한다.
      완벽히 기기별로 일치하진 않지만 이전 방식보다 훨씬 자연스럽다.

v3.25: 대시 하나만 빈 경로 위를 도니 "촬영 중"이라는 신호가 약하게 느껴진다는 피드백.
      프로그레스 링에서 흔한 "은은한 베이스 트랙 + 그 위를 도는 밝은 하이라이트" 2-레이어
      구조로 변경 — 촬영 시작과 동시에 테두리 전체 경로에 옅은 트랙(strokeOpacity 0.28)이
      상시 노출되고, 그 위를 기존 그라데이션 하이라이트가 돈다. 트랙이 항상 존재감을
      주므로 두께는 12dp→8dp로 줄인다.

v3.26: v3.25가 원했던 방향과 반대였다는 피드백 — "옅은 트랙" 위에 "진한 하이라이트"가
      아니라, "네온 튜브에 전류가 흐르는" 또는 "scanning glow line" 패턴: 테두리
      전체가 처음부터 진한 색(그라데이션 100% 불투명도)으로 채워져 있고, 그 위를
      흰색 빛이 스치듯 지나간다. 베이스 트랙을 옅은 색(strokeOpacity 0.28)에서
      완전 채색(그라데이션, 불투명 100%)으로, 움직이는 요소를 그라데이션 하이라이트에서
      흰색 글로우(TOKEN.borderBeamGlowColor/Opacity)로 교체한다.
```

```js
import Svg, { Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg'
const AnimatedRect = Animated.createAnimatedComponent(Rect)

function BorderBeam({ width, height }) {
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: TOKEN.borderBeamDuration,
        easing: Easing.linear,
        useNativeDriver: false,   // SVG strokeDashoffset은 네이티브 드라이버 미지원
      })
    )
    anim.start()
    return () => anim.stop()
  }, [])

  if (!width || !height) return null

  const strokeW = TOKEN.borderBeamThickness
  const radius = TOKEN.borderBeamCornerRadius
  const inset = strokeW / 2
  const rectW = Math.max(width - strokeW, 0)
  const rectH = Math.max(height - strokeW, 0)
  // 둥근 사각형 둘레 근사치: 직선 구간 + 모서리 4개(원 둘레의 1/4씩 = 원 하나 분량)
  const straightPerimeter = 2 * Math.max(rectW - 2 * radius, 0) + 2 * Math.max(rectH - 2 * radius, 0)
  const cornerPerimeter = 2 * Math.PI * radius
  const perimeter = straightPerimeter + cornerPerimeter
  const dashLength = TOKEN.borderBeamLength

  const dashOffset = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -perimeter] })

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Defs>
        <SvgLinearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={TOKEN.borderBeamColors[0]} />
          <Stop offset="1" stopColor={TOKEN.borderBeamColors[1]} />
        </SvgLinearGradient>
      </Defs>
      {/* v3.26: 상시 노출되는 완전 채색 베이스 라인 — shooting 시작과 동시에 테두리 전체가 진한 색으로 채워짐 */}
      <Rect
        x={inset} y={inset} width={rectW} height={rectH} rx={radius} ry={radius}
        stroke="url(#beamGrad)" strokeWidth={strokeW} fill="none"
      />
      {/* v3.26: 채색된 라인 위를 스치듯 지나가는 흰색 빛 (네온 튜브에 전류 흐르는 효과) */}
      <AnimatedRect
        x={inset} y={inset} width={rectW} height={rectH} rx={radius} ry={radius}
        stroke={TOKEN.borderBeamGlowColor} strokeOpacity={TOKEN.borderBeamGlowOpacity}
        strokeWidth={strokeW} fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dashLength}, ${Math.max(perimeter - dashLength, 0)}`}
        strokeDashoffset={dashOffset}
      />
    </Svg>
  )
}
```

**"나" 플로팅 레이어 모서리 클리핑 (시각적 일관성):**
```js
// BorderBeam이 둥근 경로를 그려도, 그 안의 카메라 화면 자체가 각진 사각형이면
// 테두리만 둥글고 화면은 각져서 부자연스럽다. shooting 중에는 콘텐츠도 함께
// 모서리를 둥글게 잘라 시각적으로 일치시킨다.
// MeStrip 최상위 컨테이너: isShooting이면 borderRadius: TOKEN.borderBeamCornerRadius 추가
```

### 기능 11 — 촬영 중 탭 전환 잠금

```
문제: shooting 상태에서 사용자가 친구/설정 탭으로 이동하면 CameraView가 언마운트되며
      진행 중이던 recordAsync 세션이 깨질 수 있다. "나"를 루트 레벨 플로팅 레이어로
      옮겨 이 문제의 근본 원인은 없앴지만, 촬영 중 탭을 이동하는 것 자체가 사용자
      경험상 바람직하지 않으므로 명시적으로 막는다.
```

```js
const handleTabPress = (tab) => {
  if (me.status === 'shooting') return   // 촬영 중에는 탭 전환 무시
  setActiveTab(tab)
}
```

---

### 기능 12 — VideoStrip 재생 안정성

```
문제 1: 앱이 백그라운드로 갔다가 돌아오거나, 일부 기기에서 expo-video 플레이어가
      예기치 않게 일시정지된 채로 남아 재생이 멈추는 경우가 보고됨.

문제 2 (더 근본적): player.loop=true 속성 자체가 expo-video에서 공식적으로
      알려진 신뢰성 문제가 있다 (Expo GitHub 이슈 #36943 — "loop attribute doesn't
      affect player... player events emission inconsistent"). 영상이 끝까지는
      재생되지만 처음으로 되돌아가지 않고 마지막 프레임에 멈추는 증상으로 나타난다.
      기기/상황에 따라 발생 여부가 불일치하는 것도 이 known issue의 특성과 일치한다.

수정 1: VideoStrip에 AppState 리스너를 추가해 앱이 다시 foreground로 돌아올 때
      해당 플레이어의 play()를 다시 호출해 재생을 보정한다.

수정 2: loop 속성만 믿지 않고, playToEnd 이벤트를 직접 구독해 영상이 끝날
      때마다 player.replay()로 수동 재생한다. Expo 공식 문서와 Mux 연동 가이드가
      공통으로 권장하는 우회책이다. loop=true는 계속 같이 둔다(이중 안전장치).
```

```js
import { useEventListener } from 'expo'

const VideoStrip = React.memo(function VideoStrip({ uri, isMuted }) {
  const player = useVideoPlayer(uri, p => {
    p.loop = true
    p.muted = isMuted
    p.play()
  })

  useEffect(() => {
    try { player.muted = isMuted } catch {}
  }, [isMuted])

  // loop 속성의 신뢰성 문제 우회 — 끝날 때마다 수동으로 처음부터 재생
  useEventListener(player, 'playToEnd', () => {
    try { player.replay() } catch {}
  })

  // 앱이 foreground로 복귀할 때 재생 보정
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        try { player.play() } catch {}
      }
    })
    return () => sub.remove()
  }, [player])

  return (
    <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
  )
})
```

---

### 기능 13 — 가입

```js
const EMAIL_REGEX = /^\S+@\S+\.\S+$/

const handleSignupEmailNext = () => {
  if (!EMAIL_REGEX.test(authDraft.email.trim())) {
    setAuthError('올바른 이메일 형식이 아니에요'); return
  }
  if (accounts.some(a => a.email === authDraft.email.trim())) {
    setAuthError('이미 가입된 이메일이에요'); return
  }
  setAuthError(null)
  setAuthStatus('signup-password')
}

const handleSignupPasswordNext = () => {
  if (authDraft.password.length < 6) {
    setAuthError('비밀번호는 6자 이상이어야 해요'); return
  }
  setAuthError(null)
  setAuthStatus('signup-nickname')
}

const handleSignupComplete = () => {
  const trimmed = authDraft.nickname.trim()
  if (!trimmed) return
  const nickname = trimmed.slice(0, 10)
  setAccounts(prev => [...prev, { email: authDraft.email.trim(), password: authDraft.password, nickname }])
  setAuthStatus('authenticated')
  // AppContent가 이 닉네임으로 새로 마운트됨 (섹션 10 참조)
}
```

---

### 기능 14 — 로그인

```js
const handleLoginEmailNext = () => {
  const found = accounts.find(a => a.email === authDraft.email.trim())
  if (!found) { setAuthError('가입되지 않은 이메일이에요'); return }
  setAuthError(null)
  setAuthStatus('login-password')
}

const handleLoginSubmit = () => {
  const found = accounts.find(a => a.email === authDraft.email.trim())
  if (!found || found.password !== authDraft.password) {
    setAuthError('비밀번호가 일치하지 않아요'); return
  }
  setAuthError(null)
  setAuthenticatedNickname(found.nickname)
  setAuthStatus('authenticated')
}
```

---

### 기능 15 — 뒤로가기 / 로그아웃

```js
// 단계별 뒤로가기 맵
const AUTH_BACK_MAP = {
  choice: 'welcome',
  'signup-email': 'choice',
  'signup-password': 'signup-email',
  'signup-nickname': 'signup-password',
  'login-email': 'choice',
  'login-password': 'login-email',
}
const handleAuthBack = () => {
  setAuthError(null)
  setAuthStatus(prev => AUTH_BACK_MAP[prev] || 'welcome')
}

// 설정탭 로그아웃 — accounts는 유지, authStatus만 초기화
const handleLogout = () => {
  Alert.alert('로그아웃', '로그아웃할까요?', [
    { text: '취소', style: 'cancel' },
    { text: '로그아웃', style: 'destructive', onPress: () => {
      setAuthDraft({ email:'', password:'', nickname:'' })
      setAuthStatus('welcome')
    }},
  ])
}
```

---

## 10. 상태 관리 구조

```js
// ── AuthFlow 상태 (App() 루트 레벨, AppContent보다 위) ──
const [authStatus, setAuthStatus] = useState('welcome')
// 'welcome'|'choice'|'signup-email'|'signup-password'|'signup-nickname'|'login-email'|'login-password'|'authenticated'

const [accounts, setAccounts] = useState([])
// [{ email, password, nickname }] — 세션 메모리 전용, 서버/영구저장 없음 (섹션 12 OUT 참조)

const [authDraft, setAuthDraft] = useState({ email:'', password:'', nickname:'' })
// 입력 중인 값. 단계 전환 시 초기화하지 않음(가입 흐름 내내 유지, 뒤로가기해도 값 보존)

const [authError, setAuthError] = useState(null)
// 현재 단계의 에러 메시지. 입력값이 바뀌면 즉시 null로 초기화(재입력 유도)

const [authenticatedNickname, setAuthenticatedNickname] = useState(null)
// 로그인 성공 시 matched account의 닉네임을 임시 보관 → AppContent 마운트 시 ME_INITIAL에 주입
```

> authStatus !== 'authenticated'인 동안 AppContent는 마운트되지 않는다. authenticated로 바뀌는
> 순간 AppContent가 새로 마운트되며, `nickname` prop으로 가입 시 입력값(authDraft.nickname)
> 또는 로그인 매칭 결과(authenticatedNickname)를 받아 `ME_INITIAL.nickname`을 덮어쓴다.

---

```js
// ── 나 (단일 객체) ──
const ME_INITIAL = {
  nickname: '나',
  notifOn: true,
  status: 'waiting',        // 'waiting' | 'shooting' | 'captioning' | 'posted'
  media: null,
  caption: null,
  capturedAt: null,
  reactions: [],            // string[] — 여러 명이 남긴 이모지 배열 (중복 허용)
                               // 예: ['🔥', '😂', '🔥'] — 같은 이모지도 중복으로 쌓임
                               // 최대 3명(친구 최대 3명), 그러므로 최대 3개
}
const [me, setMe] = useState(ME_INITIAL)

// ── 친구 목록 (최대 3명, 기본값 없음 — 나만 있는 솔로 뷰로 시작) ──
const FRIEND_INITIAL = (id, nickname) => ({
  id,
  nickname,
  status: 'waiting',
  media: null,              // 섹션 9 media 구조와 동일
  caption: null,
  capturedAt: null,
  reactions: [],            // 배열 구조. 유닛별 myEmoji 필드는 두지 않고 아래 전역 mySelection map으로 관리
})
const [friends, setFriends] = useState([])   // 디폴트 친구 없음

// ── 소리 제어 — 한 번에 하나의 스트립만 소리 켜짐 ──
// 뮤트 아이콘 탭 시 해당 스트립 unmuted, 다른 스트립은 자동 muted
const [unmutedStripId, setUnmutedStripId] = useState(null)  // null = 전체 무음

// ── 이모지 바 열림 상태 (스트립별 독립 관리) ──
// { 'me': false, 'f1': false, 'f2': false } 형태
const [emojiBarOpen, setEmojiBarOpen] = useState({})
// 특정 스트립의 바 열기: setEmojiBarOpen(prev => ({...prev, [id]: true}))
// 바 닫기: setEmojiBarOpen(prev => ({...prev, [id]: false}))

// ── 스트립별 내 이모지 선택 ──
// { 'me': '🔥'|null, 'f1': '😂'|null, ... }
const [mySelection, setMySelection] = useState({})

// ── UI 상태 ──
const [activeTab, setActiveTab] = useState('feed')       // 'feed' | 'friends' | 'settings'
const [activeCapturing, setActiveCapturing] = useState(false)  // 캡션 모달 (신규 작성 + 재수정 공용)
const [captionInput, setCaptionInput] = useState('')     // 캡션 모달 TextInput 값
const [captionHasSound, setCaptionHasSound] = useState(false)  // 캡션모달 소리 포함 토글 값
const [cameraCountdown, setCameraCountdown] = useState(null)   // shooting 진입 전엔 카운트다운 없음
const [cameraReady, setCameraReady] = useState(false)   // CameraView가 리마운트되지 않으므로 앱 최초 초기화 시 한 번만 true가 됨

// ── Refs ──
const cameraIntervalRef = useRef(null)              // 카운트다운 interval (나 스트립 내부 카운트다운용)
const appStateRef = useRef(AppState.currentState)   // 백그라운드/포그라운드 판별
const cameraRef = useRef(null)                      // expo-camera CameraView ref
const recordingPromiseRef = useRef(null)            // recordAsync()가 반환하는 Promise 저장 (레이스컨디션 방지)
const triggerShutterRef = useRef(null)              // triggerShutter 최신 함수 참조 (setInterval 클로저 문제 방지)
const shootExpand = useRef(new Animated.Value(0)).current  // 도킹(0)↔전체화면(1) 애니메이션 값

// ── 파생 계산값 ──
const tabBarTotalH = TOKEN.tabBarH + safeAreaBottom
const allCount = 1 + friends.length
const availableH = screenHeight - safeAreaTop - tabBarTotalH
// stripHeight 상세 계산은 섹션 5 참조 (Math.floor 사용, 소수점 누적 방지)
// "나"는 allUsers 배열로 함께 렌더되지 않는다 — 루트 플로팅 레이어로 분리
const stripHeight = Math.floor(availableH / allCount)   // "나" 도킹 높이 = 친구 1인당 높이
// 카운트다운 폰트는 전체화면 기준 고정값으로 단순화 (섹션 5 countdownFontSize 참조)
const canTrigger = me.notifOn && me.status === 'waiting'
const [permission, requestPermission] = useCameraPermissions()   // expo-camera 훅 — permission 선언부 (기존에 사용처만 있고 선언이 누락되어 있었음)
const hasCameraPermission = !!permission?.granted   // 나 스트립 배경 렌더 분기에 사용

// ── 상수 (컴포넌트 바깥) ──
const PHOTO_COLORS = ['#A8D8EA','#AA96DA','#FCBAD3','#FFFFD2','#B5EAD7','#FFD7BA','#C7CEEA']
const AUTO_NICKNAMES = ['친구1', '친구2', '친구3']
const EMOJI_LIST = ['🔥','😂','👍','😮','😢']
```

---

## 11. 컴포넌트 트리

```
export default function App()
└── SafeAreaProvider
    └── RootController (authStatus, accounts, authDraft, authError 관리)
        │
        ├── [authStatus !== 'authenticated'] AuthFlow
        │   └── SafeAreaView (bgTabBar)
        │       ├── [!== 'welcome'] BackButton + ProgressDots
        │       ├── Welcome (authStatus==='welcome')
        │       │   ├── Text 로고/타이틀
        │       │   ├── Text 서브카피
        │       │   └── TouchableOpacity "시작하기" [Type A]
        │       ├── Choice (authStatus==='choice')
        │       │   ├── Text "이미 계정이 있으신가요?"
        │       │   ├── TouchableOpacity "로그인" [Type A]
        │       │   └── TouchableOpacity "가입하기" (텍스트 버튼)
        │       ├── AuthStepScreen (signup-email/password/nickname, login-email/password 공용 템플릿)
        │       │   ├── Text QuestionText
        │       │   ├── TextInput (단계당 1개)
        │       │   ├── Text ErrorText (authError 존재 시)
        │       │   └── TouchableOpacity PrimaryButton [Type A, 비활성 가능]
        │
        └── [authStatus === 'authenticated'] AppContent (nickname prop 주입)
        │
        ├── SafeAreaView (edges:['top'], flex:1, bgTabBar)
        │   │
        │   ├── [activeTab === 'friends'] FriendsScreen
        │   │   └── ScrollView
        │   │       ├── InviteSection
        │   │       │   └── TouchableOpacity "초대 링크 보내기"
        │   │       └── FriendListSection
        │   │           └── FriendRow × friends.length (최대 3)
        │   │               ├── 닉네임(fs16, 실제 닉네임) + 상태(fs14) (좌측)
        │   │               └── 우측 아이콘 2개
        │   │                   ├── camera-outline / checkmark-circle (시뮬)
        │   │                   └── trash-outline (삭제, dangerColor)
        │   │
        │   ├── [activeTab === 'settings'] SettingsScreen
        │   │   └── ScrollView
        │   │       ├── NicknameEditRow (TextInput)
        │   │       ├── NotifRow (Switch, switchActiveColor)
        │   │       ├── LogoutRow ("로그아웃")
        │   │       ├── ResetRow ("전체 초기화", dangerColor)
        │   │       └── AppInfoRow
        │   │
        │   ├── [activeTab === 'feed'] View (position:absolute, top: stripHeight — safeAreaTop 더하지 않음, bottom: tabBarTotalH)
        │   │   └── FriendsFeedArea → ScrollView (친구만, bounces:false)
        │   │       └── FriendStrip × friends.length (isMe:false)
        │   │           ├── [waiting] TVNoise (40×15, opacity≤0.15)
        │   │           │   └── View scanline (rgba 0,0,0,0.10)
        │   │           ├── [posted] VideoStrip(영상, key={uri}) 또는 View 파스텔
        │   │           ├── [L2] Text NicknameLabel (실제 닉네임, shadow, fs16)
        │   │           ├── [L5] TimestampLabel (posted, 좌하단, fs14)
        │   │           ├── [L5] CaptionCenterView (posted+caption≠null)
        │   │           ├── [posted, hasSound] MuteButton (우상단, volume 아이콘)
        │   │           └── [L6] EmojiBar (posted, 우하단, BeReal 패턴)
        │   │
        │   └── TabBar (position:absolute, bottom:0, onTabPress는 me.status==='shooting'이면 무시)
        │       ├── TabItem '피드'
        │       ├── TabItem '친구'
        │       └── TabItem '설정'
        │
        ├── Animated.View "나" 플로팅 레이어 (AppContent 루트, 항상 마운트) → MeStrip 렌더
        │   │   style: position:'absolute', left:0, width:screenWidth, top:meTop, height:meHeight (도킹↔전체화면 애니메이션)
        │   │   opacity/pointerEvents: activeTab==='feed' ? (1,'auto') : (0,'none')
        │   │
        │   ├── MeStrip — [isMe:true, 모든 상태 공통] TouchableOpacity (onPress: handleMeStripPress, 상태와 무관하게 항상 동일 wrapper — CameraView 리마운트 방지)
        │   │   │
        │   │   ├── [waiting] View
        │   │   │   ├── [L1] CameraView (라이브 프리뷰, 권한 없으면 bgWaiting View fallback)
        │   │   │   ├── [L2] Text NicknameLabel (실제 닉네임, shadow, fs16)
        │   │   │   └── [L3] Text StatusLabel (fs20, 완전중앙-레이어3)
        │   │   │
        │   │   ├── [shooting] View (borderRadius:TOKEN.borderBeamCornerRadius 적용 — BorderBeam과 시각 일치)
        │   │   │   ├── [L1] CameraView (waiting 때와 동일 인스턴스, 계속 렌더)
        │   │   │   ├── [L2] Text NicknameLabel
        │   │   │   ├── [L4] CountdownOverlay (1→2→3 카운트업, dim 배경 + 대형 숫자, 전체화면 덮음)
        │   │   │   └── [L4] BorderBeam (SVG 둥근 사각형 경로, StyleSheet.absoluteFillObject)
        │   │   │
        │   │   └── [captioning/posted] View
        │   │       ├── [L1] VideoStrip(영상, key={uri}) 또는 View 파스텔
        │   │       ├── [L2] Text NicknameLabel (실제 닉네임, shadow, fs16)
        │   │       ├── [L5] TimestampLabel (posted, 좌하단, fs14)
        │   │       ├── [L5] TouchableOpacity CaptionCenterView (posted+caption≠null, 완전중앙, 탭→재수정)
        │   │       └── [L6] EmojiUI (posted, 우하단)
        │   │             ├── [미선택] 💬 아이콘 TouchableOpacity
        │   │             ├── [바확장] Animated.View EmojiBar × 5 (slide+fade)
        │   │             └── [선택됨] Text 선택된 이모지 단독 (scale 1.2)
        │
        └── CaptionModal (visible: activeCapturing, 신규작성+재수정 공용, 조건부 렌더)
            └── [visible===false → return null, 마운트 자체를 안 함]
            └── [visible===true] Modal(transparent, animationType:"none")
                ├── Animated.View 딤 (absoluteFillObject, fade만)
                └── KeyboardAvoidingView (flex:1, justifyContent:'flex-end')
                    ├── TouchableWithoutFeedback (딤 영역 탭 → 닫힘)
                    └── Animated.View ModalCard (translateY 슬라이드)
                        ├── NicknameHeader (fs16)
                        ├── HintText (fs14)
                        ├── TextInput (fs14, 재수정 시 기존 caption으로 초기화)
                        ├── SoundToggleRow (Switch, switchActiveColor)
                        └── PostButton [Type A]
```

> **CameraModal은 완전히 삭제되었다.** 코드에 CameraModal 컴포넌트를 남겨두지 않는다 (죽은 코드 금지).

> **"나" 플로팅 레이어:**
> "나" 스트립은 피드 ScrollView 안의 항목이 아니라 AppContent 루트에 항상 마운트되는
> 독립 레이어다. 탭을 friends/settings로 바꿔도 이 레이어는 언마운트되지 않고 opacity로만
> 숨겨진다 — 이렇게 하지 않으면 "나"의 CameraView가 탭 전환 시 통째로 파괴되어 랜덤하게
> 영상이 안 올라가거나 멈추는 문제가 생긴다. shooting 상태에서는 이 레이어의 top/height를
> Animated.timing으로 보간해 도킹 크기 → 전체화면(screenHeight, 탭바까지 포함)으로 확대하고,
> captioning 진입 시 다시 도킹 크기로 되돌린다.

> **SafeAreaView 좌표계 이중계산 금지:**
> AppContent 루트는 `<SafeAreaView edges={['top']}>` 안에 있다 — 즉 이 안의 모든 자식의
> local y=0은 이미 실제 화면의 safeAreaTop 지점이다. "나" 플로팅 레이어와 친구 목록
> 컨테이너의 top 좌표 계산에서 safeAreaTop을 또 더하면 안 된다. 이 실수를 하면
> 레이어가 의도보다 아래로 밀려 하단 탭바를 가리는 버그가 생긴다 (섹션 5 참조).

> **BorderBeam·카운트다운 크기는 측정하지 않는다:**
> onLayout으로 "나" 레이어의 실제 크기를 측정해 쓰면, shootExpand 애니메이션이 진행되는
> 동안 onLayout이 매 프레임 갱신되지 않아 도킹 크기(작은 값)에 고정된 채로 굳어버린다.
> screenWidth/screenHeight를 직접 사용한다 — 이미 알고 있는 값이므로 측정이 필요 없다.

> **"나" 자신의 영상 소리:**
> "나" 자신의 posted 영상에는 뮤트 버튼이 없다(섹션 6-7 — 뮤트 버튼은 친구 스트립 전용).
> media.hasSound === true면 자동으로 음소거를 해제하고, false면 음소거한다.
> unmutedStripId(친구 스트립 뮤트 버튼 상태)와는 완전히 별개의 로직이다.

> **TVNoise 컴포넌트:**
> setInterval(16ms)로 40×15 그리드 state 업데이트.
> 언마운트 시 clearInterval 필수 (useEffect cleanup).
> 성능 최적화: React.memo로 감싸기.

> **VideoStrip 컴포넌트:**
> `key={uri}`로 렌더해야 한다. uri가 바뀌어도 key가 없으면 React가 기존 player 인스턴스를 재사용해
> 이전 영상이 계속 보이는 버그가 있다 (재촬영을 반복할 때 새 영상이 반영되지 않음).
> key prop으로 uri 변경 시 컴포넌트를 강제 언마운트/재마운트한다.
> AppState가 'active'로 돌아올 때 `player.play()`를 다시 호출해, 백그라운드 복귀 후
> 루프 재생이 멈춰있는 문제를 보정한다 (섹션 9 기능 12 참조).
> player.loop=true만으로는 루프가 불안정하다(Expo 공식 이슈 #36943). playToEnd
> 이벤트를 구독해 player.replay()로 수동 재생하는 이중 안전장치를 추가한다 (섹션 9 기능 12 참조).

> **나 스트립 라이브 카메라:**
> waiting/shooting 두 상태 모두 CameraView가 배경으로 상시 렌더된다 (같은 인스턴스 유지).
> "탭해서 찍기" 탭 → status만 shooting으로 바뀌고 배경은 그대로, CountdownOverlay(레이어4)만 추가된다.
> 카운트다운은 onCameraReady 콜백 이후에만 시작한다 (워밍업 버그 방지).
> 카운트다운 종료(1→2→3 완료) 시 stopRecording() → recordingPromiseRef await(5초 타임아웃 안전장치) → media.uri 획득 → 캡션 모달 오픈.

> **wrapper 엘리먼트 타입 고정:**
> "나" 스트립을 감싸는 TouchableOpacity는 waiting/shooting/captioning/posted 전 상태에서 항상 동일하게 유지한다.
> 상태에 따라 TouchableOpacity↔View로 감싸는 태그 자체를 바꾸면, React가 엘리먼트 타입 변경을
> 감지해 서브트리를 통째로 언마운트/재마운트한다. 그 결과 CameraView가 waiting→shooting 전환 시점에
> 파괴되고 새로 생성되며, 새 인스턴스의 onCameraReady가 기존 안전장치와 동시에 발동해
> recordAsync/카운트다운이 이중 실행되는 버그로 이어진다 (영상이 파스텔로 fallback되거나 카메라 프리뷰가
> 멈추는 증상). 탭 가능 여부는 wrapper를 바꾸는 대신 onPress 핸들러 내부 가드로만 제어한다.

> **카운트다운 시작 트리거 단일화:**
> `cameraReady` 상태값(useState) + `useEffect([me.status, cameraReady])` 하나로만 카운트다운을 시작한다.
> onCameraReady 콜백과 별도 타이머를 동시에 두는 이중 트리거 구조를 두지 않는다.
> CameraView가 리마운트되지 않으므로, onCameraReady는 앱에서 카메라가 최초로 초기화될 때
> (대개 waiting 상태에서) 한 번만 호출된다는 전제로 설계한다.

> **BorderBeam SVG 재구현 (네온 튜브 패턴):**
> react-native-svg의 Rect(rx/ry)로 둥근 사각형 경로를 그리고 strokeDasharray/Offset으로
> 대시를 이동시켜, 직선을 이어붙이는 방식의 근본적 한계(모서리를 표현할 수 없음)를 해결한다.
> 모서리 곡률 반지름(TOKEN.borderBeamCornerRadius, 56dp)은 기기별 정확한 값을 얻는 공식
> API가 없어 최신 스마트폰의 일반적인 화면 모서리에 가까운 근사값을 쓴다 — 완벽히
> 기기별로 일치하진 않는다. shooting 중 "나" 컨테이너에도 같은 반지름으로 borderRadius를
> 적용해 카메라 화면과 테두리의 곡률을 시각적으로 맞춘다. 같은 경로를 두 번 그려 먼저
> 완전 채색된 베이스 라인(그라데이션, 상시 노출), 그 위에 흰색 글로우 하이라이트가
> 스치듯 지나가게 한다 (네온 튜브에 전류가 흐르는 패턴).

> **AuthFlow:**
> App() 최상위에 RootController를 두어 authStatus를 관리한다. AppContent는 authStatus가
> 'authenticated'일 때만 마운트되며, 로그아웃하면 다시 언마운트되고 AuthFlow가 나타난다
> (콘텐츠 상태는 자연히 초기화됨 — me/friends 등은 AppContent 내부 useState라서 재마운트 시
> 리셋된다). 계정은 서버가 아니라 accounts 배열(세션 메모리)로만 관리한다 — fetch/axios 등
> 네트워크 코드를 작성하지 않는다 (섹션 12 OUT "서버·DB/실제 계정" 유효).
> 각 단계 화면은 섹션 6-9 템플릿을 따르며 입력 필드를 정확히 1개만 가진다.

> **촬영 중 탭 전환 잠금:**
> TabBar의 onTabPress는 `me.status === 'shooting'`이면 아무 동작도 하지 않는다.
> "나" 플로팅 레이어가 이제 탭 전환에 영향받지 않더라도, 촬영 도중 다른 화면으로 이동하는
> 사용자 경험 자체가 바람직하지 않으므로 명시적으로 막는다.

> **CaptionModal:**
> visible이 false면 컴포넌트 자체를 렌더하지 않는다 (if(!visible) return null).
> Modal이 상시 마운트된 채 visible prop만 토글되면 TextInput의 autoFocus가 보이지 않을 때도
> 발동해 키보드 애니메이션과 충돌하는 버그가 있었다.

---

## 12. 스코프 정의

### v3.0 IN
- 탭바 기반 3화면 구조 (피드/친구/설정)
- 나(isMe:true) / 친구(isMe:false) 상태 분리
- 나: waiting→shooting→captioning→posted 플로우
- 친구: waiting(TV 노이즈) / posted(사진 공개) 2상태
- 친구 최대 3명 (나 포함 총 4명 최대)
- TV 노이즈 (40×15 그리드, opacity≤0.15)
- 타임스탬프 (방금 전 / N분 전 / 오전오후 시:분), fs14
- **친구 수에 따라 사진 잘림 방지: ScrollView + 최소 스트립 높이 가드**
- 친구 초대 (Share API)
- 친구 상태 시뮬레이션 + trash-outline 삭제 아이콘 명시
- 알림 ON/OFF → 설정탭 Switch (switchActiveColor)
- **나 스트립 = 상시 라이브 카메라 프리뷰(CameraView), CameraModal 없음**
- **나 스트립 wrapper 엘리먼트 타입 고정 + 카운트다운 단일 트리거(cameraReady+useEffect)**
- 트리거 → 피드탭 "탭해서 찍기" 텍스트 탭 → status: shooting 전환, 스트립 자체가 카운트다운과 함께 촬영 진행
- **카운트다운은 onCameraReady 이후 시작 (카메라 워밍업 버그 방지)**
- 리셋 → 설정탭 "전체 초기화"
- Ionicons 탭바 아이콘
- **이모지: BeReal 패턴 3단계 + reactions 배열로 중복 이모지 표시**
- 이모지 선택 인터랙션: scale 애니메이션만, 배경 하이라이트 없음
- 캡션: 레이어5(좌하단), fs16, numberOfLines=1 고정
- **캡션 사후 재수정 가능 — caption 유무와 무관하게 항상 진입 가능**
- **캡션모달: 외부 탭으로 닫힘, 딤 고정+카드만 슬라이드 애니메이션**
- StatusLabel fs20, 스트립 완전 중앙(레이어3 전용)
- **1→2→3 카운트업은 나 스트립 내부 레이어4 오버레이**
- **3초 영상 녹화 (expo-camera recordAsync, maxDuration:3) — 사진 촬영 기능 없음. 가로 강제 전환은 스코프 OUT**
- **recordAsync Promise를 recordingPromiseRef에 저장 후 await로 대기 — 레이스 컨디션 방지**
- **피드 영상 자동 루프 무음 재생 (expo-video VideoView), VideoStrip은 key={uri}로 강제 재마운트**
- **캡션 모달 소리 포함 여부 선택 + 친구 스트립 뮤트 아이콘 제어**
- **캡션모달: visible===false면 컴포넌트 미마운트(return null) — autoFocus 조기 발동 버그 방지**
- 닉네임 실제 표시 + 설정탭에서 본인 닉네임 수정 가능
- **닉네임 입력칸: 세로 배치, 좌측 정렬, 전체 폭**
- 친구 추가/삭제 시 stripHeight 변화에도 텍스트·아이콘이 잘리지 않는 안전 레이아웃
- EmojiBar fade+slideUp 등장
- 닉네임 text shadow 가독성
- SafeAreaProvider + SafeAreaView + useSafeAreaInsets
- tabBarTotalH 단일 계산
- AppState 백그라운드 처리
- useWindowDimensions 동적 반응형
- 마지막 스트립 borderBottomWidth: 0
- 섹션 6 조립 문법 완전 준수
- PRIMITIVE → TOKEN 2계층 완전 준수
- **"나" 스트립을 AppContent 루트 플로팅 레이어로 분리, 탭 전환에도 항상 마운트 유지**
- **shooting 시 "나" 플로팅 레이어 전체화면 확대 애니메이션 + Border Beam 테두리 인터랙션**
- **shooting 중 탭 전환 잠금**
- **VideoStrip AppState 복귀 시 재생 재개 + recordAsync 5초 타임아웃 안전장치**
- **진입/가입/로그인 온보딩 플로우 — 시작화면→선택→가입 3단계/로그인 2단계, 한 화면 한 정보**
- **가입/로그인은 세션 메모리(accounts 배열)로만 시뮬레이션, 실제 서버·DB 아님**
- **설정탭 로그아웃 → authStatus 초기화, accounts는 세션 동안 유지**

### v3.0 OUT
- 실제 푸시 알림
- 서버·DB / 실제 계정
- 다크모드 토글 (다크 고정)
- 친구 닉네임 수정 (본인 닉네임만 수정 가능)
- 가로 강제 전환 (expo-screen-orientation, Expo Go 충돌로 제거 — 개발 빌드 전환 시 재도입 검토)
- **초대링크 딥링크 파싱(누가 초대했는지 서버로 확인, 자동 친구 추가 등) — 백엔드 필요. 초대링크로 들어오든 앱을 직접 열든 AuthFlow의 동일한 Welcome 화면으로 진입한다**
- **하루 24시간 슬롯 촬영(logs) + "기록" 탭 + "오늘 다시보기" — 시도했다가 전면 삭제. 여러 영상을 하나의 파일로 합치는 것(다운로드) 자체가 Expo Go에서 불가능하고, 대안으로 만든 인앱 다시보기도 요구사항과 맞지 않아 기능 자체를 없앴다. 재도입 시 처음부터 다시 설계 필요**

> **스코프 경계 명확화:** "서버·DB/실제 계정"은 여전히 OUT이다. 가입/로그인은
> 실제 서버·DB가 아니라 세션 메모리(accounts 배열)로만 동작하는 로컬 시뮬레이션이며,
> fetch/axios 같은 네트워크 호출 코드는 작성하지 않는다. 화면 흐름과 유효성 검사만 실제
> 앱처럼 만들고, 데이터는 앱을 리로드하면 사라진다 (다른 콘텐츠 상태와 동일한 성격).

> **알려진 한계 — 비밀번호 평문 저장:** accounts 배열의 password는 해싱 없이 평문으로
> 저장된다. 네트워크 전송도, 디스크 저장도 없는 세션 메모리 전용 로컬 시뮬레이션이라
> 실질적 유출 경로가 없고, 서버 검증 없이 클라이언트에서만 해싱해봐야 번들 JS에
> 알고리즘이 그대로 노출돼 실질적 보안 효과가 없다 — 가짜 보안을 흉내내지 않고
> 이 한계를 그대로 문서화한다. 실제 서버·DB가 붙는 시점(현재 스코프 OUT)에 다시 검토한다.

> **스코프 변경 기록:** "내 스트립 안에서의 라이브 카메라 프리뷰"는 한때 OUT으로 봉인됐던
> 항목이다. 당시 폐기가 제품적 판단이 아니라 AI가 임의로 되돌린 것이었다는 점이 확인되어,
> 사용자 승인을 거쳐 다시 IN으로 이동했다 (CameraModal 완전 제거, 섹션 12 IN 참조).

---

## 13. 배포 사이클

> **QA 환경:** Modal, KeyboardAvoidingView, AppState는 Expo Web에서 동작이 다르거나 안 됨.
> **반드시 Expo Go(실기기 또는 시뮬레이터)로 QA. 웹 브라우저 QA 금지.**

### 초기 세팅 (최초 1회)

**1. Expo 프로젝트 생성**
```bash
# 반드시 SDK 54 선택 (Expo Go 호환 버전)
# create-expo-app 실행 후 SDK 버전 선택 화면에서
# "For learning with Expo Go (SDK 54)" 선택
npx create-expo-app@latest setlog-mobile-mini --template blank
cd setlog-mobile-mini
npm install
```

**2. 필수 패키지 설치**
```bash
npx expo install react-native-safe-area-context
npx expo install @expo/vector-icons
npx expo install expo-camera
npx expo install expo-video
npx expo install react-native-svg
```
> v3.40 수정: expo-camera/expo-video가 목록에 누락되어 있었다 — 카메라 촬영과 영상
> 재생이라는 핵심 기능에 필수인 패키지인데 설치 안내에 없었던 것을 발견해 추가한다.

> v3.24: expo-linear-gradient는 더 이상 사용하지 않는다 (BorderBeam이 SVG로 재구현됨).
> 기존 프로젝트에 남아있다면 `npm uninstall expo-linear-gradient`로 제거한다.
> (v3.25 수정: `npx expo uninstall`은 실제로 존재하지 않는 명령어다 — Expo CLI에는
> uninstall 서브커맨드가 없다. 일반 패키지 매니저 명령인 `npm uninstall`을 쓴다.)

> react-native-safe-area-context 설치 후 반드시 앱 루트에 SafeAreaProvider 래핑 필요.
> 누락 시 useSafeAreaInsets()가 모든 inset 값을 0으로 반환함.
> 섹션 11 컴포넌트 트리의 App/AppContent 분리 구조 참조.

**3. 코드 편집기**
- VSCode 필수 (https://code.visualstudio.com)
- TextEdit 사용 금지 (rtf 포맷으로 저장되어 코드 깨짐)

**4. GitHub 연결**
```bash
git init
git add .
git commit -m "feat: v1.0 초기 App.js 생성"
git remote add origin https://github.com/crisis-designer/setlog-mobile-mini.git
git push -u origin main
# 비밀번호 입력 시: GitHub Personal Access Token 사용 (비밀번호 아님)
# 토큰 발급: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → repo 권한
```

### 1사이클 플로우

```
1. PRD 수정
         ↓
2. Claude 셋로그 프로젝트에 PRD 전달 → App.js 생성
         ↓
3. VSCode에서 App.js 전체 교체 후 저장
         ↓
4. Expo Go 확인
   $ npx expo start --tunnel
   (tunnel 사용 필수 — LAN은 네트워크 환경에 따라 연결 불가)
         ↓
5. 문제 발견: 코드 건드리지 않고 PRD 규칙 추가
         ↓
6. GitHub push
   $ git add . && git commit -m "[type]: v[버전] [내용]" && git push
         ↓
7. 새 문제 발견 → 1번으로
```

### QA 실행 방법

```bash
cd ~/Desktop/setlog-mobile-mini
npx expo start --tunnel
# QR코드 뜨면 폰 Expo Go 앱으로 찍기
```

**연결 안 될 때:**
- Expo Go 앱 버전 확인 (App Store → Expo Go → 버전)
- SDK 버전과 Expo Go 버전 일치 여부 확인
  - SDK 54 → Expo Go 54.x.x

### Git 커밋 메시지 규칙

```
feat:     새 기능       → feat: v1.1 captioningQueue 순차 모달
fix:      버그 수정     → fix: v1.1 safeAreaBottom 이중차감 제거
design:   토큰 수정     → design: v2.1 다크 캔버스 전환
refactor: 구조 개선     → refactor: v1.1 App/AppContent 분리
```

---

## 14. 이터레이션 규칙

1. **이 문서가 항상 SSoT.** 코드보다 이 문서 먼저 수정
2. 화면 문제 발견 → 코드 직접 수정 금지 → PRD 규칙 추가 → 전달 → 전체 재생성
3. 새 UI 추가: 섹션 6-8 체크리스트 준수
4. 디자인 수정: 섹션 4 토큰 수정
5. 임의 스타일링 금지 — TOKEN 범위 내에서만. 단, AI가 14-1 프로토콜(제안 → 승인 → PRD 반영)을 통해 개선을 제안하는 것은 임의가 아니므로 허용
6. React Native: px 단위 금지, 숫자(dp)만
7. TOKEN은 PRIMITIVE 통해서만 참조
8. 새 기능: 섹션 12 스코프 먼저 수정
9. 배포: 섹션 13 사이클 / QA는 Expo Go만
10. 버전 업 시 섹션 0 히스토리 업데이트 (ADR 형식 — 배경/결정/기각한 대안, 한 줄 요약 아님)

---

### 14-1. AI 자율 개선 프로토콜

> **목적:** AI의 UX/디자인 판단력을 활용하되, PRD가 Single Source of Truth인 원칙을 유지한다.
> AI가 임의로 코드를 바꾸는 것이 아니라, 반드시 PRD 수정안 형태로 제안하고 승인 후 반영한다.

**개선 가능 범위**

AI는 아래 항목에서 능동적으로 개선을 제안할 수 있다.
단, 제안은 반드시 PRD 수정안 형태로 제출하고, 주주 승인 후 PRD에 반영 → 코드 재생성한다.

✅ 제안 가능:
- 마이크로 인터랙션 (컴포넌트 내부 터치 피드백, Animated API 트랜지션 — 오버레이·모달 전환 제외)
- 타이포그래피 세부 조정 (fontWeight, letterSpacing 등)
- 간격·정렬 세부 조정 (새 TOKEN 추가 포함)
- 상태 표시 방식 개선 (시각적 피드백, 빈 상태 표현 등)
- 컴포넌트 내부 구현 변경 (외부 인터페이스·동작이 동일한 경우 + 섹션 6 조립 문법 준수 조건)
- 새 컴포넌트 추가 (섹션 6-8 체크리스트 통과 + 섹션 11 트리 반영 조건)
- 새 PRIMITIVE / TOKEN 추가 (섹션 4에 반영 조건)
- 섹션 6 조립 문법 규칙 보완

❌ 주주 명시적 요청 없이 제안 불가:
- 기능 추가 / 삭제 (섹션 12 스코프 변경)
- 기존 TOKEN 값 변경 (전체 시각 언어에 영향)
- 상태 전이 구조 변경 (섹션 7)
- 컴포넌트가 받는 데이터 구조 변경 (섹션 10 상태 관리에 영향)

**제안 형식**

```
개선 항목: [무엇을 바꾸는가]
근거: [왜 더 나은가 — UX 원칙 또는 레퍼런스 기반으로 설명]
PRD 반영 위치: [섹션 번호 + 항목명]
새 TOKEN 필요: [없음 / 있음 → 구체적으로 명시]
컴포넌트 구조 변경: [없음 / 있음 → 섹션 11 트리 어느 노드]
섹션 6-7 노출 표 업데이트: [불필요 / 필요]
예상 효과: [사용성 / 트렌드 관점]
```

여러 항목을 제안할 때는 항목별로 위 형식을 반복하고, 묶지 않고 분리해서 제안한다.

**발동 조건**
```
1. 주주가 명시적으로 요청할 때 (예: "개선해줘", "더 좋게 만들어줘")
2. 주주가 특정 UX 문제를 언급할 때 (예: "이 부분이 어색해")
3. AI가 QA 스크린샷을 보고 개선 가능한 지점을 발견했을 때 → 즉시 코드를 바꾸지 않고 제안부터
```

**PRD 반영 흐름**
```
주주 요청 또는 AI 발견 → AI: 개선 제안서 작성(코드 없음) → 주주: 항목별 승인/거절/수정 의견
→ AI: 승인된 항목만 PRD 반영(섹션 4/6/6-7/8/11/0) → App.js 전체 재생성 → 주주: Expo Go 확인
```

> **핵심 원칙:** AI가 제안하는 모든 개선은 PRD를 통과해야 코드에 반영된다.
> PRD를 우회한 코드 수정은 이 워크플로우의 붕괴다.
