# Setlog Mobile Mini — Figma 컴포넌트 스펙 v2 (자동 파생 문서)

> **소스:** PRD v3.41 (§4/5/6/8/11) + App.js (현재 QA 승인본) + setlog-design-tokens.json
> **값 기준 원칙:** QA로 승인되어 실제 화면에 보이는 값 = App.js 코드 기준.
> PRD와 코드가 다른 항목은 ⚠D#번호로 표기 (setlog-drift-report.md의 항목 번호).
> 해당 드리프트가 PRD v3.42에서 반대로 결정되면 이 문서 재생성 → Figma 재빌드.
>
> **워크플로우:** 이 문서는 손으로 조립하지 않는다. 검토·수정은 텍스트로만.
> 확정되면 TalkToFigma로 §0→§14 순서대로 **전체 일괄 생성** (부분 조립 금지).

---

## 0. 빌드 제약 — TalkToFigma MCP 도구의 한계 (빌드 전 반드시 인지)

| # | 제약 | 대응 |
|---|---|---|
| C1 | SVG/이미지 임포트 도구 없음 | Ionicons 아이콘은 **텍스트 placeholder**(예: 레이어명 `icon:home-outline`, 내용 "⌂" 유사 글리프 또는 아이콘명 텍스트)로 생성. 빌드 후 Figma Community의 Ionicons 라이브러리로 스왑하는 것은 별도 단계 |
| C2 | Figma Variables 자동 바인딩 도구 없음 | 색상·수치는 토큰과 동일한 **리터럴 값**으로 설정하고, 레이어명/Description에 토큰명을 기록 (`fill=semantic.bgTabBar` 형식). Tokens Studio import로 생성된 Variables와의 실제 바인딩은 후처리 (Tokens Studio의 apply 기능 활용) |
| C3 | 애니메이션 표현 불가 | BorderBeam 글로우 순환, 이모지 바 fade+slide, 확대 애니메이션은 정적 스냅샷 1장 + 파라미터를 프레임 Description에 기록 |
| C4 | 한글 폰트 | 기본 폰트(Inter)는 한글 글리프가 없을 수 있음. 텍스트 생성 시 시스템에 있는 한글 지원 폰트 지정 필요 — 빌드 시작 시 사용 가능 폰트 확인 후 결정 (권장: Pretendard 또는 Noto Sans KR, 없으면 Apple SD Gothic Neo) |
| C5 | TVNoise 그리드(40×15=600셀) 재현 시 API 호출 폭증 | 노이즈는 **단색 gray900 + 스캔라인 오버레이(rgba 0,0,0,0.10) + "TVNoise" 라벨**로 단순화. 실제 질감은 코드 전용 |

Figma가 표현 가능한 것 (문제 없음): 그라데이션 stroke, dashed stroke, drop shadow(text shadow 대응), Auto Layout, cornerRadius, opacity.

**런타임 전용 노드 (Figma 컴포넌트 미생성, placeholder로만 표현):** `VideoStrip`(영상 재생 — 파스텔 fill + "촬영본" 라벨로 대체), `TVNoise`(C5), `CameraView`(C1·C5). §11 트리의 이 세 노드는 의도적으로 Figma 컴포넌트 목록에서 제외한다 — 시각 산출물이 아니라 재생 동작이기 때문.

---

## 1. 기준 프레임 치수 (iPhone 16 Pro 논리 해상도)

```
screenWidth  = 402        screenHeight = 874
safeAreaTop  = 59 (기기 실측 placeholder — QA 기기에서 다르면 여기만 교체 후 재빌드)
safeAreaBottom = 34
tabBarTotalH = tabBarH(49) + 34 = 83
availableH   = 874 − 59 − 83 = 732
allCount     = 4 (나 1 + 친구 3 기준)
stripHeight  = floor(732 / 4) = 183
카운트다운 폰트 = min(80, max(40, floor(874×0.4))) = 80
```

---

## 2. Figma 파일 구조

```
Page: 🎨 Tokens      — Tokens Studio import 결과 확인용 (자동 생성, 이 스펙의 빌드 대상 아님)
Page: 🧩 Components  — §4~§10 컴포넌트를 Component/Component Set으로 등록
Page: 📱 Screens     — §11~§14 화면 프레임 (Components의 인스턴스 조합)
```

빌드 순서: Components 페이지 전체 → Screens 페이지 (인스턴스가 마스터를 참조하므로 순서 고정).

---

## 3. 레이어 조립 규칙 (§6-1 대응)

스트립형 컴포넌트의 Figma 레이어 스택 (패널 위 = z 위):

```
L6 -bottomRight  우하단 액션 (EmojiUI)
L5 -bottomLeft   좌하단 텍스트 (Timestamp)     ※ 캡션은 L5가 아니라 L3 정중앙 — ⚠D#1·10: §8/§6-1의 "L5 캡션" 표기는 stale, §6-3/§6-7/코드 기준
L4 -overlay      전체 덮는 오버레이 (Countdown, BorderBeam)
L3 -statusCenter 중앙 상태 표시 (StatusLabel, CaptionLabel)
L2 -nickname     좌상단 식별 (닉네임)
L1 -bg           Background
```

---

## 4. 컴포넌트: MeStrip

**Component Set:** `MeStrip` / property `status = waiting | shooting | captioning | posted`, posted에 한해 `hasCaption = true | false`

### 공통 레이어
| 레이어 | 스펙 |
|---|---|
| `-bg` | 상태별 상이 (아래) |
| `-nickname` | Text "나"(실제 닉네임), pos absolute top/left `nicknamePad`(20), fill `semantic.textOnDark`, size `semantic.fontNickname`(16), weight 600, **Drop Shadow**: rgba(0,0,0,0.6), x0 y1 blur3 |

### Variant별
| 요소 | waiting | shooting | captioning | posted |
|---|---|---|---|---|
| 프레임 | 402×183 (도킹) | **402×874 전체화면, cornerRadius `semantic.borderBeamCornerRadius`(56)** | 402×183 | 402×183 |
| `-bg` | gray800 fill + 라벨 "CameraView (live)" (C1·C5) | 동일 | 파스텔 샘플 fill `#B5EAD7` + 라벨 "촬영본" | 동일 |
| `-statusCenter` StatusLabel | ✅ Text "탭해서 찍기" — absoluteFill 정중앙, `semantic.fontStatus`(20), weight 700, `semantic.textOnDark` | ❌ | ❌ | ❌ |
| `-overlay` Countdown | ❌ | ✅ absoluteFill, bg rgba(0,0,0,0.3) ⚠D#20(하드코딩, dim35 후보) + Text "2" 중앙, 80pt, weight 900, `textOnDark`, Drop Shadow rgba(0,0,0,0.6) y2 blur10 | ❌ | ❌ |
| `-overlay` BorderBeam | ❌ | ✅ §5 컴포넌트 인스턴스, absoluteFill | ❌ | ❌ |
| `-statusCenter` CaptionLabel | ❌ | ❌ | ❌ | ✅ **항상 존재** (§6-7 v3.41 기준) — hasCaption=true: Text 캡션, `semantic.fontCaptionLarge`(20) weight 600 / false: Text "캡션 추가", `semantic.fontCaptionEmpty`(16) weight 300 opacity 0.6. 공통: absoluteFill 정중앙 포지셔너 + 내부 터치영역 paddingV `space8` paddingH `space20`, Drop Shadow rgba(0,0,0,0.5) y1 blur4, 1줄 |
| `-bottomLeft` Timestamp | ❌ | ❌ | ❌ | ✅ Text "방금 전", bottom/left `nicknamePad`(20) ⚠D#4(§8은 stripPad — stale), `semantic.fontTimestamp`(14) weight 500 |
| `-bottomRight` EmojiUI | ❌ | ❌ | ❌ | ✅ §6 인스턴스, right `stripPad`(8), bottom `space12`(12) ⚠D#16(§6-4는 stripPad) |

> 뮤트 버튼 없음 — 뮤트 버튼은 FriendStrip 전용 (§11 명시).

---

## 5. 컴포넌트: BorderBeam (정적 스냅샷)

**Component:** `BorderBeam`, 402×874 (MeStrip shooting과 동일 크기)

```
레이어 1 — 베이스: Rect stroke, inset 4 (=strokeW/2), cornerRadius 56(=semantic.borderBeamCornerRadius),
  strokeWidth semantic.borderBeamThickness(8),
  stroke = Linear Gradient: stop0 semantic.borderBeamColorsStart(#7DE8FF) → stop1 semantic.borderBeamColorsEnd(#FF9EE8), 대각(0,0→1,1)
레이어 2 — 글로우: 동일 Rect, stroke semantic.borderBeamGlowColor(#FFFFFF) opacity 0.95,
  dash [112, 나머지] (semantic.borderBeamLength=112), cap round
  → Figma에선 dash pattern 112/2000 근사로 세그먼트 하나만 보이게
Description 기록: "Animated.loop linear, duration 4800ms(semantic.borderBeamDuration), strokeDashoffset 0→-perimeter 무한 순환"
```

---

## 6. 컴포넌트: EmojiUI

**Component Set:** `EmojiUI` / `state = icon | barOpen | selected`

| Variant | 구성 |
|---|---|
| `icon` | Text "💬", size `semantic.fontEmoji`(24), opacity 0.8 ⚠D#11(§6-4는 0.7), 터치패딩 `space4` |
| `barOpen` | Auto Layout row, gap `semantic.emojiGap`(6), bg `semantic.emojiBarBg`(rgba 255,255,255,0.15), radius `semantic.emojiBarRadius`(20), padH `space8` padV `space4`. 아이템 5개 🔥😂👍😮😢 각 `semantic.emojiItemW`(44×44) 중앙정렬, radius `radiusSmall`(8). 내 선택 아이템: bg rgba(255,255,255,0.2) ⚠D#19(하드코딩+체크리스트 "배경 하이라이트 금지"와 긴장) |
| `selected` | Auto Layout row gap `space4` — **reactions 배열 전체를 가로로** 렌더 ⚠D#13(PRD는 "단독 표시"), 각 Text size `fontEmoji`(24), 내 선택만 scale 1.15 ⚠D#12(PRD는 1.2) |

Description 기록: "상태1→2 fade+slideUp motionNormal(300ms), 2→3 bar fadeout+scale bounce motionFast(150ms)"

---

## 7. 컴포넌트: FriendStrip

**Component Set:** `FriendStrip` / `status = waiting | posted`, posted에 `hasCaption = true | false`, `hasSound = true | false`

| 요소 | waiting | posted |
|---|---|---|
| 프레임 | 402×183, borderBottom `semantic.borderWidth`(1) `semantic.borderDefault`(#374151) — 마지막 스트립 variant는 border 0 (Description 기록) | 동일 |
| `-bg` | gray900 fill + 스캔라인 오버레이 rgba(0,0,0,0.10) absoluteFill + 라벨 "TVNoise" (C5) | 파스텔 샘플 `#A8D8EA` |
| `-nickname` | ✅ MeStrip과 동일 스타일, 텍스트 "친구1" | ✅ |
| `-bottomLeft` Timestamp | ❌ | ✅ MeStrip과 동일 |
| `-statusCenter` CaptionLabel | ❌ | hasCaption=true일 때만 레이어 존재 (**false면 레이어 자체 없음 — placeholder 없음, MeStrip과의 핵심 차이**, §6-7 v3.41) |
| 뮤트 버튼 | ❌ | hasSound=true일 때만: **Ionicons volume-mute** placeholder(C1), size `semantic.iconSize`(20), fill `textOnDark`, 터치영역 44×44, top/right `nicknamePad`(20) |
| `-bottomRight` EmojiUI | ❌ | ✅ 인스턴스, MeStrip과 동일 위치 |

---

## 8. 컴포넌트: TabBar

**Component:** `TabBar`, 402×83 (49+34), bg `semantic.bgTabBar`(#111827), top border 1 `semantic.borderDefault`, paddingBottom 34
Auto Layout row, 각 탭 flex 균등(134×49), 수직 중앙, 내부 gap `space4`

| 탭 | 아이콘 placeholder(C1) | 라벨 | 크기 |
|---|---|---|---|
| 피드(활성 예시) | `icon:home` | "피드" | 아이콘 20 ⚠D#14(PRD tabIconSize=16, 코드 +4), 라벨 `semantic.fontTab`(11) weight 500 |
| 친구(비활성) | `icon:people-outline` | "친구" | 동일 |
| 설정(비활성) | `icon:settings-outline` | "설정" | 동일 |

활성 fill `semantic.textTabActive`(white) / 비활성 `semantic.textTabInactive`(#6B7280)

---

## 9. 컴포넌트: CaptionModal

**Component:** `CaptionModal`, 402×874

```
레이어 dim: absoluteFill, fill semantic.bgModalDim(rgba 0,0,0,0.60)
레이어 card: 하단 고정, width 402, bg semantic.bgModalCard(white),
  radius 상단만 semantic.modalRadius(16), padding semantic.modalCardPadding(20)
  ├── Header: "주주의 캡션" — semantic.textPrimary(#111827), semantic.fontNicknameHeader(16) w600, mb modalElementGap(8)
  ├── Hint: "사진 설명을 입력하세요 (선택, 최대 50자)" ⚠D#17(PRD 문구와 상이) — textSecondary(#6B7280), fontModalHint(14), mb 8
  ├── Input: placeholder "캡션 입력..." ⚠D#17 — textPrimary, fontCaption(14), 하단 border 1 borderDefault, padV space8, mb 8
  ├── SoundToggleRow: "소리 포함"(textPrimary, fontBody 14) + Switch placeholder(트랙 ON semantic.switchActiveColor #34C759 / OFF gray700, thumb white), padV space12, 하단 border 1, mb 8
  └── PostButton [Type A]: "올리기" — §10 참조, mt semantic.postBtnTopMargin(16)
```

---

## 10. 버튼 컴포넌트 (§6-4)

| Component | bg | text | 기타 |
|---|---|---|---|
| `Button/TypeA-Post` (올리기) | `semantic.btnPostBg`(#111827) | `semantic.btnPostText`(white), `fontPostBtn`(16) w600 | h `minTouchTarget`(44), radius `postBtnRadius`(8), w 100% |
| `Button/TypeD-Filled` (초대·친구추가·Auth 기본버튼) | `semantic.btnPrimaryBg`(white) | `semantic.btnPrimaryText`(#111827), `fontBody`(14) w600 | h 44, radius `btnPrimaryRadius`(8) |
| `Button/TypeD-Danger` (로그아웃·전체초기화) | gray800 ⚠D#23(PRD 명세 공백, 코드 PRIMITIVE 직접 참조) | `semantic.dangerColor`(#FF3B30) | TypeD와 동일 형상 |
| 비활성 modifier | 동일 + opacity `btnDisabledOpacity`(0.3) | | |

> 코드의 AuthFlow/친구탭 기본 버튼은 §6-4 Type A(btnPostBg)가 아니라 흰 배경(btnPrimaryBg) — 다크 화면 위 가시성 때문. Figma는 코드 기준 TypeD 계열로 명명.

---

## 11. 화면: Screen/Feed (402×874) — 2개 프레임

**Feed-Default** (나 waiting + 친구 3명 조합 예시):
```
y 0~59      SafeArea 상단 (bg semantic.bgTabBar)
y 59~242    MeStrip(waiting) 인스턴스 (도킹, 402×183)
y 242~791   FriendStrip × 3 (각 183: waiting / posted-caption / posted-sound 예시 조합)
y 791~874   TabBar (피드 활성)
```

**Feed-Shooting** (전체화면 확대 상태):
```
y 0~874     MeStrip(shooting) 인스턴스 — 상태바·탭바까지 덮음 (top −59 보정 반영된 전체화면)
Description: "shootExpand 애니메이션 duration motionNormal(300ms), 도킹↔전체화면 보간"
```

## 12. 화면: Screen/Friends (402×874)

```
SafeArea 상단 59 + 콘텐츠 (padding space20, 섹션 gap space24) + TabBar(친구 활성)
├── 섹션 "친구 초대": Title fontSectionTitle(16) w700 → Body "링크로 친구를 셋로그에 초대하세요" fontBody(14), mt 12 mb 20 (⚠D#21 인라인 sp) → Button/TypeD "초대 링크 보내기"
└── 섹션 "친구 목록 (3/3)": Title → Body "📷 아이콘으로 촬영완료 시뮬 · 🗑 아이콘으로 삭제" mt 12 mb 16
    ├── FriendRow × 3: minHeight friendRowMinHeight(64), padV space16, 하단 border 1 borderDefault
    │   ├── 좌: 닉네임 fontSectionTitle(16) w600 + 상태 "⏳ 대기중"/"✅ 촬영완료" fontBody(14) mt 6
    │   └── 우: 아이콘 2개 각 44×44 터치 — icon:camera-outline(또는 checkmark-circle, fill accentColor) / icon:trash-outline fill dangerColor, 아이콘 크기 24 ⚠D#15
    └── (friends<3일 때) Button/TypeD "+ 친구 추가 (시뮬)" mt 20 ⚠D#24(§8/§11 트리에 없음 — PRD 공백)
```

## 13. 화면: Screen/Settings (402×874)

```
SafeArea 59 + ScrollView (padding space20, gap space24) + TabBar(설정 활성)
├── "내 정보": Title → 라벨 "닉네임" fontBody textSecondary mb 8 → TextInput 박스 (w 100%, padH/V space12, border 1 borderDefault, radius nicknameLabelRadius(4), 텍스트 fontSectionTitle(16) textOnDark, 좌측정렬)
├── "알림": Title → Row "알림 받기" fontSectionTitle + Switch(ON switchActiveColor) → 도움말 "알림이 켜져 있어야 피드에서 탭으로 찍을 수 있어요" fontBody textSecondary mt 12 ⚠D#25(§8 공백)
├── "계정": Title → Button/TypeD-Danger "로그아웃" mt 16
├── "데이터": Title → Button/TypeD-Danger "전체 초기화" mt 16
└── "앱 정보": Title → "Setlog Mobile Mini" fontBody mt 16 → 버전 문자열 mt 8 ⚠D#22(코드에 "v3.19" stale 하드코딩 — Figma에는 "v3.41" 기록)
각 섹션: 하단 border 1 borderDefault, paddingBottom space24
```

## 14. 화면: Screen/Auth (402×874 × 7프레임)

**공용 템플릿** (bg `semantic.bgTabBar`, padding `space20`):
```
상단 바 (Welcome 제외 — Choice에도 있음 ⚠D#7): BackButton 44×44 icon:chevron-back(24) 좌 + ProgressDots 중앙(점 8×8 radius4, 활성 semantic.accentColor #B5EAD7 / 비활성 semantic.dotInactive #374151, gap space8) + 우측 44 spacer
본문 (flex 중앙): Question — semantic.fontCaptionLarge(20) w700 textOnDark ⚠D#8(§8은 fs24), mb space24
  → TextInput: fontStatus(20) textOnDark, 하단 border 1 borderDefault, padV space8
  → ErrorText(조건부): dangerColor, fontBody(14), mt space12
하단: Button/TypeD-Filled(비활성 시 opacity 0.3)
```

**7개 프레임 문구 (코드 AUTH_STEP_CONFIG 기준 — 빌드 시 이 표만 참조):**

| 프레임 | dots | 질문/내용 | placeholder | 버튼 |
|---|---|---|---|---|
| Auth/Welcome | — | 로고 "Setlog" fontCaptionLarge(20) w700 + 서브 "친구들과 동시에 순간을 찍어요" fontBody textSecondary mt 8 | — | "시작하기" |
| Auth/Choice | — | "이미 계정이 있으신가요?" | — | "로그인" + 보조 텍스트버튼 "가입하기"(textOnDark fontBody w600, h44, mt space12) |
| Auth/SignupEmail | ●○○ | "이메일이 뭐예요?" | you@example.com | "다음" |
| Auth/SignupPassword | ○●○ | "비밀번호를 만들어주세요" (에러 예시: "비밀번호는 6자 이상이어야 해요") | 6자 이상 | "다음" |
| Auth/SignupNickname | ○○● | "닉네임을 정해주세요" | 닉네임 입력 | "가입 완료" |
| Auth/LoginEmail | ●○ | "이메일을 입력하세요" ⚠D#18(§8은 Signup과 공용 문구) | you@example.com | "다음" |
| Auth/LoginPassword | ○● | "비밀번호를 입력하세요" (에러 예시: "비밀번호가 일치하지 않아요") | 비밀번호 | "로그인" |

---

## 15. 빌드 후 검증 절차 (생성 직후 실행)

```
1. get_local_components → 컴포넌트 수 대조: MeStrip(variants 5: waiting/shooting/captioning/posted×hasCaption2)
   + FriendStrip(variants 5) + EmojiUI(3) + BorderBeam + TabBar + CaptionModal + Button 3종 = Component Set 7
2. Screens 페이지 프레임 수: Feed 2 + Friends 1 + Settings 1 + Auth 7 = 11
3. scan_text_nodes로 주요 문구 실존 확인 ("탭해서 찍기", "캡션 추가", 7개 Auth 질문)
4. get_node_info 샘플링: 색상 리터럴 값이 토큰 값과 일치하는지 (bgTabBar #111827, accent #B5EAD7 등)
5. 결과를 통과/실패 목록으로 보고 — 실패 시 해당 노드 수정 후 재검증 (파일 전달 전 통과 필수)
```
