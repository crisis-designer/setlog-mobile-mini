# Setlog Mobile Mini

편집 없는 동시성 기록 — **3초 제약이 연출을 불가능하게 만드는** BeReal 스타일 소셜 카메라 앱의 프로토타입.

기획 문서(PRD)를 Single Source of Truth로 삼아 AI와 함께 처음부터 끝까지 만든 1인 풀사이클 프로젝트입니다. 목적은 제품 그 자체보다 **"PRD → 코드"를 문서 기반으로 정합성 있게 반복하는 워크플로우**를 보여주는 데 있습니다.

---

## 문제 발견과 해결

### Q1. 어떤 문제를 발견했나요?

지금의 소셜 미디어는 너무 많은 편집과 연출을 요구한다. 사람들은 정각마다 각자의 공간에서 서로 다른 순간을 살고 있지만, 게시물로 남는 건 그중 가장 잘 편집된 한 장뿐이다.

### Q2. 어떻게 해결했나요?

핵심 제약 자체를 가치로 삼았다.

- **3초 제한** → 생각할 시간이 없어 연출이 불가능하고, 순간이 그대로 찍힌다.
- **취소 불가** → 한 번 시작하면 끝까지 간다.
- **선택적 캡션** → 강요 없음. 사진만으로도 충분하다.
- **상하 균등 분할 타임라인** → 나와 친구들이 같은 무게로 나란히 존재한다.

### Q3. 왜 이 방식으로 설계했나요?

"이 요소가 없으면 핵심 가치가 훼손되는가?"를 모든 기능 추가의 기준으로 삼았다. 아니오라면 넣지 않는다. 그래서 하루 24시간 슬롯 촬영이나 다시보기 같은 기능은 시도했다가 이 기준에 맞지 않아 스코프에서 완전히 제거했다 (자세한 배경은 [setlog-prd-v3_42.md](setlog-prd-v3_42.md) 버전 히스토리 참조).

---

## 워크플로우 — PRD를 SSoT로 삼아 AI와 빌드하기

Figma 없이 PRD 문서 + 단일 `App.js`만으로 제품을 빌드했습니다. 규칙은 단순합니다: **PRD가 코드보다 항상 우선**합니다.

1. 기능 수정이 필요하면 코드를 먼저 건드리지 않고, [00_iteration_guide.md](00_iteration_guide.md)의 형식에 맞춰 문제를 정의한 뒤 PRD의 해당 섹션을 먼저 수정합니다.
2. PRD가 확정된 뒤에만 `App.js`를 (부분 패치가 아닌 전체) 재생성합니다.
3. 디자인 토큰(색상·간격·타이포그래피)은 PRIMITIVE → TOKEN 2계층 구조로 격리되어 있어, 토큰 값만 바꾸면 전체 UI에 일관되게 반영됩니다.

## 문서 구조

| 문서 | 역할 |
|---|---|
| [00_iteration_guide.md](00_iteration_guide.md) | 버그/개선 사항을 발견했을 때 PRD 수정 → 코드 재생성으로 이어지는 이터레이션 절차 |
| [setlog-prd-v3_42.md](setlog-prd-v3_42.md) | 제품 철학, 디자인 시스템, 기능 명세, 컴포넌트 트리를 포함한 PRD (SSoT) |
| [setlog-design-tokens.json](setlog-design-tokens.json) | PRD 섹션 4 디자인 토큰의 실제 값 데이터 |
| [figma-spec/setlog-figma-component-spec.md](figma-spec/setlog-figma-component-spec.md) | PRD + 코드 기준으로 역산한 Figma 빌드용 컴포넌트 스펙 |
| [figma-spec/setlog-drift-report.md](figma-spec/setlog-drift-report.md) | 위 스펙 작성 중 발견한 PRD-코드 간 불일치 감사 리포트 |

## 기술 스택

React Native (Expo SDK 54) · `App.js` 단일 파일 구조 · expo-camera / expo-video · react-native-svg · PRIMITIVE→TOKEN 2계층 디자인 시스템

## 실행 방법

```bash
npm install
npx expo start --tunnel
```

QR코드가 뜨면 Expo Go 앱으로 스캔합니다. Modal·KeyboardAvoidingView·AppState가 관여하는 화면들은 Expo Web에서 동작이 다르므로, 웹 브라우저 QA는 지원하지 않습니다.
