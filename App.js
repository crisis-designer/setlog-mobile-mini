import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  TextInput, Modal, KeyboardAvoidingView, Platform, Alert,
  AppState, Keyboard, Animated, Easing, Share, Switch, ScrollView,
} from 'react-native'
import { useWindowDimensions } from 'react-native'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useEventListener } from 'expo'
import Svg, { Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg'

// react-native-web's Alert.alert() is a no-op (see react-native-web/src/exports/Alert),
// so confirm/destructive dialogs silently do nothing on web. Fall back to window.confirm/alert there.
function crossAlert(title, message, buttons) {
  if (Platform.OS !== 'web') { Alert.alert(title, message, buttons); return }
  if (buttons && buttons.length > 1) {
    const confirmBtn = buttons.find(b => b.style !== 'cancel')
    const cancelBtn = buttons.find(b => b.style === 'cancel')
    if (window.confirm([title, message].filter(Boolean).join('\n'))) {
      confirmBtn?.onPress?.()
    } else {
      cancelBtn?.onPress?.()
    }
  } else {
    window.alert([title, message].filter(Boolean).join('\n'))
    buttons?.[0]?.onPress?.()
  }
}

// ─────────────────────────────────────────────
// PRIMITIVE
// ─────────────────────────────────────────────
const PRIMITIVE = {
  black:'#000000', white:'#FFFFFF',
  gray100:'#F3F4F6', gray200:'#E5E7EB', gray300:'#D1D5DB',
  gray400:'#9CA3AF', gray500:'#6B7280',
  gray700:'#374151', gray800:'#1F2937', gray900:'#111827',
  dim10:'rgba(0,0,0,0.10)',
  dim30:'rgba(0,0,0,0.3)',
  dim60:'rgba(0,0,0,0.60)',
  white15:'rgba(255,255,255,0.15)',
  white20:'rgba(255,255,255,0.2)',
  white80:'rgba(255,255,255,0.80)',
  transparent:'transparent',
  radius4:4, radius8:8, radius16:16, radius20:20,
  sp4:4, sp6:6, sp8:8, sp12:12, sp16:16, sp20:20, sp24:24,
  fs11:11, fs12:12, fs14:14, fs16:16, fs20:20, fs24:24,
  border1:1,
  size16:16, size20:20, size24:24, size36:36, size44:44, size49:49, size56:56, size64:64,
  opacity30:0.3, opacity15:0.15,
  accent:'#B5EAD7',
  green:'#34C759',
  red:'#FF3B30',
  beamCyan:'#7DE8FF',   // v3.19
  beamPink:'#FF9EE8',   // v3.19
  dur16:16, dur50:50, dur150:150, dur300:300,
}

// ─────────────────────────────────────────────
// TOKEN
// ─────────────────────────────────────────────
const TOKEN = {
  bgWaiting:          PRIMITIVE.gray800,
  bgModalDim:         PRIMITIVE.dim60,
  bgModalCard:        PRIMITIVE.white,
  bgTabBar:           PRIMITIVE.gray900,
  bgNoiseOverlay:     PRIMITIVE.opacity15,
  emojiBarBg:         PRIMITIVE.white15,

  textPrimary:        PRIMITIVE.gray900,
  textSecondary:      PRIMITIVE.gray500,
  textOnDark:         PRIMITIVE.white,
  textTabInactive:    PRIMITIVE.gray500,
  textTabActive:      PRIMITIVE.white,

  accentColor:        PRIMITIVE.accent,
  switchActiveColor:  PRIMITIVE.green,
  dangerColor:        PRIMITIVE.red,
  borderDefault:      PRIMITIVE.gray700,
  borderBeamColors:   [PRIMITIVE.beamCyan, PRIMITIVE.beamPink],  // v3.24: SVG LinearGradient 2-stop

  btnPostBg:          PRIMITIVE.gray900,
  btnPostText:        PRIMITIVE.white,
  btnPrimaryBg:       PRIMITIVE.white,
  btnPrimaryText:     PRIMITIVE.gray900,
  btnPrimaryRadius:   PRIMITIVE.radius8,
  btnDisabledOpacity: PRIMITIVE.opacity30,
  btnDangerBg:        PRIMITIVE.gray800,   // v3.42(발견 95) — 로그아웃·초기화 버튼이 PRIMITIVE.gray800을 직접 참조하던 것을 토큰화

  motionNoise:        PRIMITIVE.dur50,
  motionFast:         PRIMITIVE.dur150,
  motionNormal:       PRIMITIVE.dur300,

  fontTab:            PRIMITIVE.fs11,
  fontEmojiCount:     PRIMITIVE.fs12,
  fontNickname:       PRIMITIVE.fs16,
  fontBody:           PRIMITIVE.fs14,
  fontCaption:        PRIMITIVE.fs14,
  fontModalHint:      PRIMITIVE.fs14,
  fontTimestamp:      PRIMITIVE.fs14,
  fontCaptionLarge:   PRIMITIVE.fs20,
  fontCaptionEmpty:   PRIMITIVE.fs16,
  fontSectionTitle:   PRIMITIVE.fs16,
  fontNicknameHeader: PRIMITIVE.fs16,
  fontPostBtn:        PRIMITIVE.fs16,
  fontStatus:         PRIMITIVE.fs20,
  fontEmoji:          PRIMITIVE.fs24,

  stripPad:           PRIMITIVE.sp8,
  nicknamePad:        PRIMITIVE.sp20,
  emojiGap:           PRIMITIVE.sp6,
  emojiItemW:         PRIMITIVE.size44,
  tabBarH:            PRIMITIVE.size49,
  tabIconSize:        PRIMITIVE.size16,
  iconSize:           PRIMITIVE.size20,
  iconSizeLarge:      PRIMITIVE.size24,   // v3.42(발견 95) — 아이콘에 매직넘버 +4를 더하던 5곳을 대체(20+4=24)
  borderWidth:        PRIMITIVE.border1,
  modalRadius:        PRIMITIVE.radius16,
  emojiBarRadius:     PRIMITIVE.radius20,
  nicknameLabelRadius:PRIMITIVE.radius4,
  modalCardPadding:   PRIMITIVE.sp20,
  postBtnRadius:      PRIMITIVE.radius8,
  modalElementGap:    PRIMITIVE.sp8,
  postBtnTopMargin:   PRIMITIVE.sp16,
  sectionPad:         PRIMITIVE.sp16,
  minTouchTarget:     PRIMITIVE.size44,

  // 범용 유틸리티 스케일 (특정 컴포넌트 의미가 없는 간격/반경 — 컴포넌트가 PRIMITIVE를
  // 직접 참조하지 않고 이 계층을 통해서만 쓰도록 하는 탈출구. 의미 있는 이름을 붙일 수
  // 있는 값은 여기 대신 전용 의미 토큰을 새로 만든다)
  space4:             PRIMITIVE.sp4,
  space6:             PRIMITIVE.sp6,   // v3.42(발견 95) — friendStatus 등에서 쓰이던 인라인 PRIMITIVE.sp6 대체
  space8:             PRIMITIVE.sp8,
  space12:            PRIMITIVE.sp12,
  space16:            PRIMITIVE.sp16,
  space20:            PRIMITIVE.sp20,
  space24:            PRIMITIVE.sp24,
  radiusSmall:        PRIMITIVE.radius8,
  dotInactive:        PRIMITIVE.gray700,
  friendRowMinHeight: PRIMITIVE.size64,
  bgNoiseScanline:    PRIMITIVE.dim10,   // v3.42(발견 95) — TVNoise 스캔라인 오버레이 하드코딩 rgba 정정
  bgCountdownDim:     PRIMITIVE.dim30,   // v3.42(발견 95) — 카운트다운 딤 배경 하드코딩 rgba 정정
  emojiItemActiveBg:  PRIMITIVE.white20, // v3.42(발견 95) — 이모지 선택 하이라이트 하드코딩 rgba 정정

  borderBeamThickness: PRIMITIVE.sp8,   // v3.25: 12dp→8dp (상시 트랙 추가로 두께 축소)
  borderBeamGlowColor: PRIMITIVE.white,   // v3.26 신규 — 베이스 라인 위를 스치는 빛의 색
  borderBeamGlowOpacity: 0.95,            // v3.26 신규
  borderBeamLength:    PRIMITIVE.size56 * 2, // 112dp
  borderBeamDuration:  4800,            // v3.24: 3200→4800ms (조금 더 느리게)
  borderBeamCornerRadius: PRIMITIVE.size56, // v3.24 신규 — 56dp, 최신 스마트폰 모서리 곡률 근사값
}

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────
// v3.42(발견 95) — 설정 화면에 "v3.19"가 하드코딩되어 실제 PRD 버전(v3.41)과 어긋나 있던 것을
// 단일 상수로 정정. PRD 버전이 오를 때 이 값도 함께 갱신한다(설정 화면 앱 정보 표시가 유일한 참조처).
const APP_VERSION = 'v3.41'
const PHOTO_COLORS = ['#A8D8EA','#AA96DA','#FCBAD3','#FFFFD2','#B5EAD7','#FFD7BA','#C7CEEA']
const EMOJI_LIST = ['🔥','😂','👍','😮','😢']
const NOISE_COLORS = ['#000','#111','#222','#333']
const NOISE_COLS = 40
const NOISE_ROWS = 15

const ME_INITIAL = {
  nickname:'나', notifOn:true, status:'waiting',
  media: null,
  caption: null, capturedAt: null,
  reactions: [],
}
const makeFriend = (id, nickname) => ({
  id, nickname, status:'waiting',
  media: null,
  caption: null, capturedAt: null,
  reactions: [],
})

const formatTimestamp = (ts) => {
  if (!ts) return ''
  const diff = Date.now() - ts
  if (diff < 60000) return '방금 전'
  if (diff < 3600000) return `${Math.floor(diff/60000)}분 전`
  const d = new Date(ts)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2,'0')
  return `${h<12?'오전':'오후'} ${h%12||12}:${m}`
}

const isVideoUri = (uri) => uri && uri.startsWith('file://')
const isPastelColor = (uri) => uri && uri.startsWith('#')

// ─────────────────────────────────────────────
// TVNoise — 40×15
// ─────────────────────────────────────────────
const TVNoise = React.memo(({ width, height }) => {
  const [grid, setGrid] = useState(() =>
    Array.from({length:NOISE_ROWS}, () =>
      Array.from({length:NOISE_COLS}, () => ({
        color:NOISE_COLORS[Math.floor(Math.random()*NOISE_COLORS.length)],
        opacity:Math.random()*TOKEN.bgNoiseOverlay,
      }))
    )
  )
  useEffect(() => {
    const id = setInterval(() => {
      setGrid(Array.from({length:NOISE_ROWS}, () =>
        Array.from({length:NOISE_COLS}, () => ({
          color:NOISE_COLORS[Math.floor(Math.random()*NOISE_COLORS.length)],
          opacity:Math.random()*TOKEN.bgNoiseOverlay,
        }))
      ))
    }, TOKEN.motionNoise)
    return () => clearInterval(id)
  }, [])
  const cellW = width/NOISE_COLS
  const cellH = height/NOISE_ROWS
  return (
    <View style={[StyleSheet.absoluteFillObject, {backgroundColor:PRIMITIVE.gray900}]}>
      {grid.map((row,ri) => (
        <View key={ri} style={{flexDirection:'row', height:cellH}}>
          {row.map((cell,ci) => (
            <View key={ci} style={{width:cellW, backgroundColor:cell.color, opacity:cell.opacity}} />
          ))}
        </View>
      ))}
      <View style={[StyleSheet.absoluteFillObject, {backgroundColor:TOKEN.bgNoiseScanline}]} />
    </View>
  )
})

// ─────────────────────────────────────────────
// VideoStrip — key={uri}로 강제 재생성, v3.19: AppState 복귀 시 재생 재개
// ─────────────────────────────────────────────
const VideoStrip = React.memo(function VideoStrip({ uri, isMuted }) {
  const player = useVideoPlayer(uri, p => {
    p.loop = true
    p.muted = isMuted
    p.play()
  })

  useEffect(() => {
    try { player.muted = isMuted } catch {}
  }, [isMuted])

  // v3.23: player.loop=true만으로는 루프가 불안정하다(Expo 공식 이슈 #36943 —
  // 루프 이벤트 발생이 기기/상황마다 불일치). playToEnd 이벤트를 직접 구독해
  // 끝날 때마다 수동으로 replay() — Expo/Mux 공식 문서 권장 이중 안전장치.
  useEventListener(player, 'playToEnd', () => {
    try { player.replay() } catch {}
  })

  // v3.19: 백그라운드에서 돌아왔을 때 루프 재생이 멈춰있는 경우 보정
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        try { player.play() } catch {}
      }
    })
    return () => sub.remove()
  }, [player])

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFillObject}
      contentFit="cover"
      nativeControls={false}
    />
  )
})

// ─────────────────────────────────────────────
// BorderBeam — v3.24 재구현: SVG 둥근 사각형 경로 + stroke-dasharray 애니메이션
// (v3.19~v3.21: 직선 트랙을 4개 이어붙이는 방식은 얼룩 문제는 해결했지만
//  모서리가 둥근 기기에서 그 곡률을 표현할 방법이 없었다. 경로 자체를
//  둥근 사각형으로 그려 근본적으로 해결한다.)
// ─────────────────────────────────────────────
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
      {/* v3.26: 상시 노출되는 완전 채색 베이스 라인 (네온 튜브 패턴) */}
      <Rect
        x={inset} y={inset} width={rectW} height={rectH} rx={radius} ry={radius}
        stroke="url(#beamGrad)" strokeWidth={strokeW} fill="none"
      />
      {/* v3.26: 채색된 라인 위를 스치듯 지나가는 흰색 빛 */}
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

// ─────────────────────────────────────────────
// EmojiUI — BeReal 3단계
// ─────────────────────────────────────────────
function EmojiUI({ reactions, mySelection, isOpen, onIconTap, onEmojiSelect, onSelectedTap }) {
  const barAnim = useRef(new Animated.Value(0)).current
  const barSlide = useRef(new Animated.Value(10)).current

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(barAnim, {toValue:1, duration:TOKEN.motionNormal, useNativeDriver:true}),
        Animated.timing(barSlide, {toValue:0, duration:TOKEN.motionNormal, useNativeDriver:true}),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(barAnim, {toValue:0, duration:TOKEN.motionFast, useNativeDriver:true}),
        Animated.timing(barSlide, {toValue:10, duration:TOKEN.motionFast, useNativeDriver:true}),
      ]).start()
    }
  }, [isOpen])

  if (!isOpen && reactions.length > 0) {
    return (
      <TouchableOpacity onPress={onSelectedTap} activeOpacity={0.8} style={styles.reactionsRow}>
        {reactions.map((emoji, idx) => (
          <Text key={idx} style={[styles.emojiSelectedSingle, mySelection===emoji && styles.emojiSelectedHighlight]}>
            {emoji}
          </Text>
        ))}
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.emojiUIWrapper}>
      {isOpen && (
        <Animated.View style={[styles.emojiBar, {opacity:barAnim, transform:[{translateY:barSlide}]}]}>
          {EMOJI_LIST.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[styles.emojiItem, mySelection===emoji && styles.emojiItemActive]}
              onPress={() => onEmojiSelect(emoji)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{selected: mySelection===emoji}}
            >
              <Text style={styles.emojiChar}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
      {!isOpen && reactions.length === 0 && (
        <TouchableOpacity
          onPress={onIconTap} activeOpacity={0.7} style={styles.emojiIconBtn}
          accessibilityRole="button" accessibilityLabel="반응 추가"
        >
          <Text style={styles.emojiIconText}>💬</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// ─────────────────────────────────────────────
// MeStrip — v3.19: 항상 동일 wrapper, 전체화면 여부와 무관하게 같은 컴포넌트
// ─────────────────────────────────────────────
function MeStrip({ me, onPress, onEditCaption, isEmojiBarOpen, onEmojiIconTap, onEmojiBarDismiss, mySelection, onEmoji, cameraRef, hasCameraPermission, countdown, onCameraReady, screenWidth, screenHeight }) {
  const isPosted = me.status==='posted'
  const isShooting = me.status==='shooting'
  const isCaptioningOrPosted = me.status==='captioning' || isPosted
  const hasCaption = me.caption != null && me.caption !== ''
  const mediaUri = me.media?.uri
  const isVideo = isVideoUri(mediaUri)
  const isPastel = isPastelColor(mediaUri)
  // v3.20: "나" 자신의 영상은 뮤트 버튼이 없다 — media.hasSound로 직접 음소거 여부 결정 (unmutedStripId와 무관)
  const isMeUnmuted = me.media?.hasSound || false
  // v3.20: onLayout 측정 대신 screenHeight를 직접 사용 (애니메이션 도중 측정값이 갱신 안 되는 버그 방지)
  const countdownFontSize = Math.min(80, Math.max(40, Math.floor(screenHeight * 0.4)))

  const renderBackground = () => {
    if (me.status==='waiting' || isShooting) {
      if (hasCameraPermission) {
        return (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="back"
            mode="video"
            onCameraReady={onCameraReady}
          />
        )
      }
      return <View style={[StyleSheet.absoluteFillObject, {backgroundColor:TOKEN.bgWaiting}]} />
    }
    if (isCaptioningOrPosted && isVideo) return <VideoStrip key={mediaUri} uri={mediaUri} isMuted={!isMeUnmuted} />
    if (isCaptioningOrPosted && isPastel) return <View style={[StyleSheet.absoluteFillObject, {backgroundColor:mediaUri}]} />
    return <View style={[StyleSheet.absoluteFillObject, {backgroundColor:TOKEN.bgWaiting}]} />
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.strip, isShooting && { borderRadius: TOKEN.borderBeamCornerRadius }]}
    >
      {renderBackground()}

      {isEmojiBarOpen && (
        <TouchableWithoutFeedback onPress={() => onEmojiBarDismiss('me')}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
      )}

      <Text style={styles.nicknameText}>{me.nickname}</Text>

      {me.status==='waiting' && (
        <View style={styles.statusLabelWrapper}>
          <Text style={styles.statusLabel}>{me.notifOn ? '탭해서 찍기' : '알림 꺼짐'}</Text>
        </View>
      )}

      {isShooting && countdown != null && countdown > 0 && (
        <View style={styles.countdownOverlay}>
          <Text style={[styles.countdownText, {fontSize: countdownFontSize}]}>{countdown}</Text>
        </View>
      )}

      {isShooting && <BorderBeam width={screenWidth} height={screenHeight} />}

      {isPosted && (
        <View style={styles.captionPositioner}>
          <TouchableOpacity onPress={onEditCaption} activeOpacity={0.8} style={styles.captionTouchable}>
            <Text style={hasCaption ? styles.captionText : styles.captionEmptyText} numberOfLines={1}>
              {hasCaption ? me.caption : '캡션 추가'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isPosted && me.capturedAt!=null && (
        <Text style={styles.timestampText}>{formatTimestamp(me.capturedAt)}</Text>
      )}

      {isPosted && (
        <View style={styles.emojiUIContainer}>
          <EmojiUI
            reactions={me.reactions}
            mySelection={mySelection}
            isOpen={isEmojiBarOpen}
            onIconTap={() => onEmojiIconTap('me')}
            onEmojiSelect={(emoji) => onEmoji(emoji)}
            onSelectedTap={() => onEmojiIconTap('me')}
          />
        </View>
      )}
    </TouchableOpacity>
  )
}

// ─────────────────────────────────────────────
// Strip — 친구 전용 (isMe 분기 제거, v3.19)
// ─────────────────────────────────────────────
function FriendStrip({ user, stripHeight, screenWidth, onEmoji, isLast, isEmojiBarOpen, onEmojiIconTap, onEmojiBarDismiss, mySelection, isUnmuted, onMuteToggle }) {
  const isPosted = user.status==='posted'
  const hasCaption = user.caption != null && user.caption !== ''
  const mediaUri = user.media?.uri
  const hasSound = user.media?.hasSound || false
  const isVideo = isVideoUri(mediaUri)
  const isPastel = isPastelColor(mediaUri)

  const renderBackground = () => {
    if (user.status==='waiting') return <TVNoise width={screenWidth} height={stripHeight} />
    if (isVideo) return <VideoStrip key={mediaUri} uri={mediaUri} isMuted={!isUnmuted} />
    if (isPastel) return <View style={[StyleSheet.absoluteFillObject, {backgroundColor:mediaUri}]} />
    return <View style={[StyleSheet.absoluteFillObject, {backgroundColor:PRIMITIVE.gray900}]} />
  }

  return (
    <View style={[
      styles.strip,
      {height:stripHeight, borderBottomWidth:isLast?0:TOKEN.borderWidth, borderBottomColor:TOKEN.borderDefault}
    ]}>
      {renderBackground()}

      {isEmojiBarOpen && (
        <TouchableWithoutFeedback onPress={() => onEmojiBarDismiss(user.id)}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
      )}

      <Text style={styles.nicknameText}>{user.nickname}</Text>

      {isPosted && (
        <View style={styles.captionPositioner}>
          {hasCaption && (
            <View style={styles.captionTouchable}>
              <Text style={styles.captionText} numberOfLines={1}>{user.caption}</Text>
            </View>
          )}
        </View>
      )}

      {isPosted && user.capturedAt!=null && (
        <Text style={styles.timestampText}>{formatTimestamp(user.capturedAt)}</Text>
      )}

      {isPosted && hasSound && isVideo && (
        <TouchableOpacity
          style={styles.muteBtn} onPress={() => onMuteToggle(user.id)} activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isUnmuted ? '음소거' : '음소거 해제'}
        >
          <Ionicons
            name={isUnmuted ? 'volume-high' : 'volume-mute'}
            size={TOKEN.iconSize}
            color={TOKEN.textOnDark}
          />
        </TouchableOpacity>
      )}

      {isPosted && (
        <View style={styles.emojiUIContainer}>
          <EmojiUI
            reactions={user.reactions}
            mySelection={mySelection}
            isOpen={isEmojiBarOpen}
            onIconTap={() => onEmojiIconTap(user.id)}
            onEmojiSelect={(emoji) => onEmoji(emoji)}
            onSelectedTap={() => onEmojiIconTap(user.id)}
          />
        </View>
      )}
    </View>
  )
}

// ─────────────────────────────────────────────
// CaptionModal — 조건부 렌더, KAV 구조
// ─────────────────────────────────────────────
function CaptionModal({ visible, nickname, captionInput, onCaptionChange, onPost, onDismiss, hasSound, onHasSoundChange }) {
  const dimAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(300)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(dimAnim, {toValue:1, duration:TOKEN.motionNormal, useNativeDriver:true}),
        Animated.timing(slideAnim, {toValue:0, duration:TOKEN.motionNormal, useNativeDriver:true}),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(dimAnim, {toValue:0, duration:TOKEN.motionFast, useNativeDriver:true}),
        Animated.timing(slideAnim, {toValue:300, duration:TOKEN.motionFast, useNativeDriver:true}),
      ]).start()
    }
  }, [visible])

  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[StyleSheet.absoluteFillObject, {backgroundColor:TOKEN.bgModalDim, opacity:dimAnim}]} pointerEvents="none" />

      <KeyboardAvoidingView
        style={{flex:1, justifyContent:'flex-end'}}
        behavior={Platform.OS==='ios'?'padding':'height'}
      >
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={{flex:1}} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.modalCard, {transform:[{translateY:slideAnim}]}]}>
          <Text style={styles.modalHeader}>{nickname}의 캡션</Text>
          <Text style={styles.modalHint}>사진 설명을 입력하세요 (선택, 최대 50자)</Text>
          <TextInput
            style={styles.modalInput}
            value={captionInput}
            onChangeText={onCaptionChange}
            maxLength={50} autoFocus selectTextOnFocus
            returnKeyType="done" onSubmitEditing={onPost}
            placeholderTextColor={TOKEN.textSecondary}
            placeholder="캡션 입력..."
          />
          <View style={styles.soundToggleRow}>
            <Text style={styles.soundToggleLabel}>소리 포함</Text>
            <Switch
              value={hasSound}
              onValueChange={onHasSoundChange}
              trackColor={{false:PRIMITIVE.gray700, true:TOKEN.switchActiveColor}}
              thumbColor={PRIMITIVE.white}
              ios_backgroundColor={PRIMITIVE.gray700}
            />
          </View>
          <TouchableOpacity style={styles.postBtn} onPress={onPost} activeOpacity={0.8}>
            <Text style={styles.postBtnText}>올리기</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ─────────────────────────────────────────────
// FriendsFeedArea — v3.19: 피드탭의 친구 목록 전용 스크롤 영역
// ─────────────────────────────────────────────
function FriendsFeedArea({ friends, stripHeight, screenWidth, onEmojiFriend, emojiBarOpen, onEmojiIconTap, onEmojiBarDismiss, mySelection, unmutedStripId, onMuteToggle }) {
  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flex:1}}>
      {friends.map((f, index) => (
        <FriendStrip
          key={f.id}
          user={f}
          stripHeight={stripHeight}
          screenWidth={screenWidth}
          isLast={index===friends.length-1}
          onEmoji={(emoji)=>onEmojiFriend(f.id, emoji)}
          isEmojiBarOpen={!!emojiBarOpen[f.id]}
          onEmojiIconTap={onEmojiIconTap}
          onEmojiBarDismiss={onEmojiBarDismiss}
          mySelection={mySelection[f.id] || null}
          isUnmuted={unmutedStripId === f.id}
          onMuteToggle={onMuteToggle}
        />
      ))}
    </ScrollView>
  )
}

// ─────────────────────────────────────────────
// FriendsScreen
// ─────────────────────────────────────────────
function FriendsScreen({ friends, onInvite, onSimulatePost, onDeleteFriend, onAddFriend }) {
  return (
    <ScrollView style={styles.tabScreen} contentContainerStyle={styles.tabScreenContent}>
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>친구 초대</Text>
        <Text style={[styles.sectionBody, {marginTop:TOKEN.space12, marginBottom:TOKEN.space20}]}>
          링크로 친구를 셋로그에 초대하세요
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={onInvite} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>초대 링크 보내기</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>친구 목록 ({friends.length}/3)</Text>
        <Text style={[styles.sectionBody, {marginTop:TOKEN.space12, marginBottom:TOKEN.space16}]}>
          📷 아이콘으로 촬영완료 시뮬 · 🗑 아이콘으로 삭제
        </Text>
        {friends.map(f => (
          <View key={f.id} style={styles.friendRow}>
            <View style={{flex:1, justifyContent:'center'}}>
              <Text style={styles.friendName}>{f.nickname}</Text>
              <Text style={[styles.friendStatus, {marginTop:TOKEN.space6}]}>
                {f.status==='posted' ? '✅ 촬영완료' : '⏳ 대기중'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.iconBtn} onPress={() => f.status!=='posted' && onSimulatePost(f.id)}
              activeOpacity={0.7} disabled={f.status==='posted'}
              accessibilityRole="button"
              accessibilityLabel={f.status==='posted' ? '촬영 완료됨' : '촬영 완료 시뮬레이션'}
            >
              <Ionicons name={f.status==='posted'?'checkmark-circle':'camera-outline'} size={TOKEN.iconSizeLarge} color={f.status==='posted'?TOKEN.accentColor:TOKEN.textOnDark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn} onPress={() => onDeleteFriend(f.id, f.nickname)} activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${f.nickname} 삭제`}
            >
              <Ionicons name="trash-outline" size={TOKEN.iconSizeLarge} color={TOKEN.dangerColor} />
            </TouchableOpacity>
          </View>
        ))}
        {friends.length < 3 && (
          <TouchableOpacity style={[styles.primaryBtn, {marginTop:TOKEN.space20}]} onPress={onAddFriend} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>+ 친구 추가 (시뮬)</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

// ─────────────────────────────────────────────
// SettingsScreen
// ─────────────────────────────────────────────
function SettingsScreen({ nickname, onNicknameChange, notifOn, onToggleNotif, onReset, onLogout }) {
  const [localNickname, setLocalNickname] = useState(nickname)
  useEffect(() => { setLocalNickname(nickname) }, [nickname])
  return (
    <ScrollView style={styles.tabScreen} contentContainerStyle={styles.tabScreenContent}>
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>내 정보</Text>
        <View style={{marginTop:TOKEN.space16}}>
          <Text style={styles.nicknameLabel}>닉네임</Text>
          <TextInput
            style={styles.nicknameInput}
            value={localNickname}
            onChangeText={setLocalNickname}
            onBlur={() => onNicknameChange(localNickname)}
            onSubmitEditing={() => onNicknameChange(localNickname)}
            maxLength={10} placeholder="닉네임 입력"
            placeholderTextColor={TOKEN.textSecondary} returnKeyType="done"
          />
        </View>
      </View>
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>알림</Text>
        <View style={[styles.settingRow, {marginTop:TOKEN.space16}]}>
          <Text style={styles.settingLabel}>알림 받기</Text>
          <Switch
            value={notifOn}
            onValueChange={onToggleNotif}
            trackColor={{false:PRIMITIVE.gray700, true:TOKEN.switchActiveColor}}
            thumbColor={PRIMITIVE.white}
            ios_backgroundColor={PRIMITIVE.gray700}
          />
        </View>
        <Text style={[styles.sectionBody, {marginTop:TOKEN.space12}]}>알림이 켜져 있어야 피드에서 탭으로 찍을 수 있어요</Text>
      </View>
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>계정</Text>
        <TouchableOpacity style={[styles.primaryBtn, {backgroundColor:TOKEN.btnDangerBg, marginTop:TOKEN.space16}]} onPress={onLogout} activeOpacity={0.8}>
          <Text style={[styles.primaryBtnText, {color:TOKEN.dangerColor}]}>로그아웃</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>데이터</Text>
        <TouchableOpacity style={[styles.primaryBtn, {backgroundColor:TOKEN.btnDangerBg, marginTop:TOKEN.space16}]} onPress={onReset} activeOpacity={0.8}>
          <Text style={[styles.primaryBtnText, {color:TOKEN.dangerColor}]}>전체 초기화</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <Text style={[styles.sectionBody, {marginTop:TOKEN.space16}]}>Setlog Mobile Mini</Text>
        <Text style={[styles.sectionBody, {marginTop:TOKEN.space8}]}>{APP_VERSION}</Text>
      </View>
    </ScrollView>
  )
}

// ─────────────────────────────────────────────
// TabBar — v3.19: shooting 중 탭 전환 잠금
// ─────────────────────────────────────────────
function TabBar({ activeTab, onTabPress, tabBarTotalH, safeAreaBottom, locked }) {
  const tabs = [
    {key:'feed', label:'피드', icon:'home', iconOff:'home-outline'},
    {key:'friends', label:'친구', icon:'people', iconOff:'people-outline'},
    {key:'settings', label:'설정', icon:'settings', iconOff:'settings-outline'},
  ]
  return (
    <View style={[styles.tabBar, {height:tabBarTotalH, paddingBottom:safeAreaBottom}]}>
      {tabs.map(tab => {
        const active = activeTab===tab.key
        const color = active ? TOKEN.textTabActive : TOKEN.textTabInactive
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => { if (!locked) onTabPress(tab.key) }}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{selected: active}}
            accessibilityLabel={tab.label}
          >
            <Ionicons name={active?tab.icon:tab.iconOff} size={TOKEN.iconSize} color={color} />
            <Text style={[styles.tabLabel, {color}]}>{tab.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default function App() {
  return <SafeAreaProvider><RootController /></SafeAreaProvider>
}

// ─────────────────────────────────────────────
// RootController — v3.27 신규: authStatus 관리, AuthFlow ↔ AppContent 분기
// ─────────────────────────────────────────────
const EMAIL_REGEX = /^\S+@\S+\.\S+$/
const AUTH_BACK_MAP = {
  choice: 'welcome',
  'signup-email': 'choice',
  'signup-password': 'signup-email',
  'signup-nickname': 'signup-password',
  'login-email': 'choice',
  'login-password': 'login-email',
}

function RootController() {
  const [authStatus, setAuthStatus] = useState('welcome')
  const [accounts, setAccounts] = useState([])
  const [authDraft, setAuthDraft] = useState({ email:'', password:'', nickname:'' })
  const [authError, setAuthError] = useState(null)
  const [authenticatedNickname, setAuthenticatedNickname] = useState(null)

  const updateDraft = (key, value) => {
    setAuthDraft(prev => ({...prev, [key]: value}))
    setAuthError(null)
  }

  const handleSignupEmailNext = () => {
    const email = authDraft.email.trim()
    if (!EMAIL_REGEX.test(email)) { setAuthError('올바른 이메일 형식이 아니에요'); return }
    if (accounts.some(a => a.email === email)) { setAuthError('이미 가입된 이메일이에요'); return }
    setAuthError(null)
    setAuthStatus('signup-password')
  }

  const handleSignupPasswordNext = () => {
    if (authDraft.password.length < 6) { setAuthError('비밀번호는 6자 이상이어야 해요'); return }
    setAuthError(null)
    setAuthStatus('signup-nickname')
  }

  const handleSignupComplete = () => {
    const trimmed = authDraft.nickname.trim()
    if (!trimmed) return
    const nickname = trimmed.slice(0, 10)
    setAccounts(prev => [...prev, { email: authDraft.email.trim(), password: authDraft.password, nickname }])
    setAuthenticatedNickname(nickname)
    setAuthStatus('authenticated')
  }

  const handleLoginEmailNext = () => {
    const email = authDraft.email.trim()
    const found = accounts.find(a => a.email === email)
    if (!found) { setAuthError('가입되지 않은 이메일이에요'); return }
    setAuthError(null)
    setAuthStatus('login-password')
  }

  const handleLoginSubmit = () => {
    const email = authDraft.email.trim()
    const found = accounts.find(a => a.email === email)
    if (!found || found.password !== authDraft.password) { setAuthError('비밀번호가 일치하지 않아요'); return }
    setAuthError(null)
    setAuthenticatedNickname(found.nickname)
    setAuthStatus('authenticated')
  }

  const handleAuthBack = () => {
    setAuthError(null)
    setAuthStatus(prev => AUTH_BACK_MAP[prev] || 'welcome')
  }

  const handleLogout = () => {
    crossAlert('로그아웃', '로그아웃할까요?', [
      { text:'취소', style:'cancel' },
      { text:'로그아웃', style:'destructive', onPress: () => {
        setAuthDraft({ email:'', password:'', nickname:'' })
        setAuthError(null)
        setAuthStatus('welcome')
      }},
    ])
  }

  if (authStatus !== 'authenticated') {
    return (
      <AuthFlow
        authStatus={authStatus}
        authDraft={authDraft}
        authError={authError}
        onChangeDraft={updateDraft}
        onWelcomeNext={() => setAuthStatus('choice')}
        onChooseSignup={() => setAuthStatus('signup-email')}
        onChooseLogin={() => setAuthStatus('login-email')}
        onBack={handleAuthBack}
        onSignupEmailNext={handleSignupEmailNext}
        onSignupPasswordNext={handleSignupPasswordNext}
        onSignupComplete={handleSignupComplete}
        onLoginEmailNext={handleLoginEmailNext}
        onLoginSubmit={handleLoginSubmit}
      />
    )
  }

  return <AppContent initialNickname={authenticatedNickname} onLogout={handleLogout} />
}

// ─────────────────────────────────────────────
// AuthFlow — v3.27 신규: 진입/가입/로그인, 한 화면 한 정보
// ─────────────────────────────────────────────
const AUTH_STEP_CONFIG = {
  'signup-email':    { question:'이메일이 뭐예요?', field:'email', placeholder:'you@example.com', keyboardType:'email-address', secure:false, buttonLabel:'다음', dots:3, activeDot:0 },
  'signup-password': { question:'비밀번호를 만들어주세요', field:'password', placeholder:'6자 이상', keyboardType:'default', secure:true, buttonLabel:'다음', dots:3, activeDot:1 },
  'signup-nickname': { question:'닉네임을 정해주세요', field:'nickname', placeholder:'닉네임 입력', keyboardType:'default', secure:false, buttonLabel:'가입 완료', dots:3, activeDot:2, maxLength:10 },
  'login-email':     { question:'이메일을 입력하세요', field:'email', placeholder:'you@example.com', keyboardType:'email-address', secure:false, buttonLabel:'다음', dots:2, activeDot:0 },
  'login-password':  { question:'비밀번호를 입력하세요', field:'password', placeholder:'비밀번호', keyboardType:'default', secure:true, buttonLabel:'로그인', dots:2, activeDot:1 },
}

function AuthFlow({ authStatus, authDraft, authError, onChangeDraft, onWelcomeNext, onChooseSignup, onChooseLogin, onBack, onSignupEmailNext, onSignupPasswordNext, onSignupComplete, onLoginEmailNext, onLoginSubmit }) {
  if (authStatus === 'welcome') {
    return (
      <SafeAreaView style={styles.authSafeArea}>
        <View style={styles.authWelcomeWrap}>
          <Text style={styles.authLogo}>Setlog</Text>
          <Text style={styles.authSubcopy}>친구들과 동시에 순간을 찍어요</Text>
        </View>
        <TouchableOpacity style={styles.authPrimaryBtn} onPress={onWelcomeNext} activeOpacity={0.8}>
          <Text style={styles.authPrimaryBtnText}>시작하기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (authStatus === 'choice') {
    return (
      <SafeAreaView style={styles.authSafeArea}>
        <TouchableOpacity style={styles.authBackBtn} onPress={onBack} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="뒤로가기">
          <Ionicons name="chevron-back" size={TOKEN.iconSizeLarge} color={TOKEN.textOnDark} />
        </TouchableOpacity>
        <View style={styles.authBodyWrap}>
          <Text style={styles.authQuestion}>이미 계정이 있으신가요?</Text>
        </View>
        <TouchableOpacity style={styles.authPrimaryBtn} onPress={onChooseLogin} activeOpacity={0.8}>
          <Text style={styles.authPrimaryBtnText}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.authSecondaryBtn} onPress={onChooseSignup} activeOpacity={0.7}>
          <Text style={styles.authSecondaryBtnText}>가입하기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const config = AUTH_STEP_CONFIG[authStatus]
  if (!config) return null

  const NEXT_HANDLERS = {
    'signup-email': onSignupEmailNext,
    'signup-password': onSignupPasswordNext,
    'signup-nickname': onSignupComplete,
    'login-email': onLoginEmailNext,
    'login-password': onLoginSubmit,
  }
  const onNext = NEXT_HANDLERS[authStatus]
  const value = authDraft[config.field]
  const isValid = value.trim().length > 0

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
      <SafeAreaView style={styles.authSafeArea}>
        <View style={styles.authTopBar}>
          <TouchableOpacity style={styles.authBackBtn} onPress={onBack} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="뒤로가기">
            <Ionicons name="chevron-back" size={TOKEN.iconSizeLarge} color={TOKEN.textOnDark} />
          </TouchableOpacity>
          <View style={styles.authDotsRow}>
            {Array.from({length: config.dots}).map((_, i) => (
              <View key={i} style={[styles.authDot, i===config.activeDot && styles.authDotActive]} />
            ))}
          </View>
          <View style={{width:TOKEN.minTouchTarget}} />
        </View>
        <View style={styles.authBodyWrap}>
          <Text style={styles.authQuestion}>{config.question}</Text>
          <TextInput
            style={styles.authInput}
            value={value}
            onChangeText={(t) => onChangeDraft(config.field, t)}
            placeholder={config.placeholder}
            placeholderTextColor={TOKEN.textSecondary}
            keyboardType={config.keyboardType}
            secureTextEntry={config.secure}
            autoCapitalize="none"
            autoFocus
            maxLength={config.maxLength}
            returnKeyType="done"
            onSubmitEditing={onNext}
          />
          {authError && <Text style={styles.authErrorText}>{authError}</Text>}
        </View>
        <TouchableOpacity
          style={[styles.authPrimaryBtn, !isValid && styles.authPrimaryBtnDisabled]}
          onPress={onNext}
          activeOpacity={0.8}
          disabled={!isValid}
        >
          <Text style={styles.authPrimaryBtnText}>{config.buttonLabel}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

// ─────────────────────────────────────────────
// AppContent
// ─────────────────────────────────────────────
function AppContent({ initialNickname, onLogout }) {
  const {width:screenWidth, height:screenHeight} = useWindowDimensions()
  const {top:safeAreaTop, bottom:safeAreaBottom} = useSafeAreaInsets()
  const [permission, requestPermission] = useCameraPermissions()

  const [me, setMe] = useState({ ...ME_INITIAL, nickname: initialNickname || ME_INITIAL.nickname })
  const [friends, setFriends] = useState([])
  const [activeTab, setActiveTab] = useState('feed')
  const [activeCapturing, setActiveCapturing] = useState(false)
  const [captionInput, setCaptionInput] = useState('')
  const [captionHasSound, setCaptionHasSound] = useState(false)
  const [cameraCountdown, setCameraCountdown] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [emojiBarOpen, setEmojiBarOpen] = useState({})
  const [mySelection, setMySelection] = useState({})
  const [unmutedStripId, setUnmutedStripId] = useState(null)

  const cameraIntervalRef = useRef(null)
  const appStateRef = useRef(AppState.currentState)
  const cameraRef = useRef(null)
  const recordingPromiseRef = useRef(null)
  const triggerShutterRef = useRef(null)
  const shootExpand = useRef(new Animated.Value(0)).current   // v3.19: 도킹(0)↔전체화면(1)

  const tabBarTotalH = TOKEN.tabBarH + safeAreaBottom
  const allCount = 1 + friends.length
  const availableH = screenHeight - safeAreaTop - tabBarTotalH
  const stripHeight = Math.floor(availableH / allCount)   // "나" 도킹 높이 = 친구 1인당 높이

  const hasCameraPermission = !!permission?.granted
  const isShooting = me.status === 'shooting'

  // v3.19: shooting 진입/이탈에 따라 "나" 플로팅 레이어 확대/축소 애니메이션
  useEffect(() => {
    Animated.timing(shootExpand, {
      toValue: isShooting ? 1 : 0,
      duration: TOKEN.motionNormal,
      useNativeDriver: false,
    }).start()
  }, [isShooting])

  // v3.20: SafeAreaView(edges:['top']) 내부는 이미 local y=0 = 실제 safeAreaTop 지점이다.
  // 도킹(0): top=0 (여기서 safeAreaTop을 또 더하면 하단 탭바를 가리는 버그가 생긴다)
  // 전체화면(1): top=-safeAreaTop (SafeAreaView가 밀어둔 만큼 끌어올려 상태바까지 덮음)
  const meTop = shootExpand.interpolate({ inputRange:[0,1], outputRange:[0, -safeAreaTop] })
  const meHeight = shootExpand.interpolate({ inputRange:[0,1], outputRange:[stripHeight, screenHeight] })

  // AppState
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      const prev = appStateRef.current
      appStateRef.current = next
      if ((next==='background'||next==='inactive') && me.status==='shooting') {
        if (cameraIntervalRef.current) { clearInterval(cameraIntervalRef.current); cameraIntervalRef.current=null }
        try { cameraRef.current?.stopRecording() } catch {}
      }
    })
    return () => sub.remove()
  }, [me.status])

  useEffect(() => () => { if (cameraIntervalRef.current) clearInterval(cameraIntervalRef.current) }, [])

  // triggerShutter: v3.19 - 5초 타임아웃 안전장치 + 늦은 rejection 무시
  const triggerShutter = useCallback(async () => {
    if (cameraIntervalRef.current) { clearInterval(cameraIntervalRef.current); cameraIntervalRef.current=null }
    try { cameraRef.current?.stopRecording() } catch {}

    let videoUri = null
    try {
      if (recordingPromiseRef.current) {
        const originalPromise = recordingPromiseRef.current
        originalPromise.catch(() => {})   // 타임아웃으로 먼저 빠져나가도 나중에 조용히 무시
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('recordAsync timeout')), 5000))
        const result = await Promise.race([originalPromise, timeout])
        videoUri = result?.uri || null
      }
    } catch {}
    recordingPromiseRef.current = null

    const uri = videoUri || PHOTO_COLORS[Math.floor(Math.random()*PHOTO_COLORS.length)]
    setCameraCountdown(null)
    setMe(prev => ({...prev, status:'captioning', media: { uri, hasSound: false }}))
    setCaptionInput('')
    setCaptionHasSound(false)
    setActiveCapturing(true)
  }, [])

  useEffect(() => { triggerShutterRef.current = triggerShutter }, [triggerShutter])

  const startCameraCountdown = useCallback(() => {
    if (recordingPromiseRef.current) return   // 중복 시작 방지
    if (cameraIntervalRef.current) clearInterval(cameraIntervalRef.current)
    setCameraCountdown(1)

    if (cameraRef.current && hasCameraPermission) {
      recordingPromiseRef.current = cameraRef.current.recordAsync({ maxDuration: 3 })
    }

    let count = 1
    const id = setInterval(() => {
      count += 1
      if (count > 3) {
        clearInterval(id)
        cameraIntervalRef.current = null
        triggerShutterRef.current?.()
      } else {
        setCameraCountdown(count)
      }
    }, 1000)
    cameraIntervalRef.current = id
  }, [hasCameraPermission])

  const handleCameraReady = useCallback(() => {
    setCameraReady(true)
  }, [])

  // v3.19: 카운트다운 시작은 이 useEffect 하나가 전담
  useEffect(() => {
    if (me.status === 'shooting' && cameraReady && !cameraIntervalRef.current) {
      startCameraCountdown()
    }
  }, [me.status, cameraReady, startCameraCountdown])

  const handleMeStripPress = async () => {
    if (!me.notifOn || me.status!=='waiting') return
    Keyboard.dismiss()
    if (!hasCameraPermission) {
      const result = await requestPermission()
      if (!result.granted) { crossAlert('카메라 권한 필요', '설정에서 카메라 권한을 허용해주세요'); return }
    }
    setMe(prev => ({...prev, status:'shooting'}))
    // 카운트다운 시작은 위 useEffect가 담당 (v3.18)
  }

  const handleTabPress = (tab) => {
    setActiveTab(tab)   // TabBar 자체에서 locked 가드를 거치므로 여기선 그대로 반영
  }

  const handleToggleNotif = (value) => {
    setMe(prev => {
      if (prev.status==='shooting'||prev.status==='captioning'||prev.status==='posted') return prev
      return {...prev, notifOn:value}
    })
  }

  const handleNicknameChange = (newNickname) => {
    const trimmed = newNickname.trim()
    if (!trimmed) return
    setMe(prev => ({...prev, nickname:trimmed.slice(0,10)}))
  }

  const handlePost = () => {
    const trimmed = captionInput.trim()
    setMe(prev => ({
      ...prev,
      caption: trimmed||null,
      status: 'posted',
      capturedAt: prev.capturedAt||Date.now(),
      media: prev.media ? {...prev.media, hasSound: captionHasSound} : prev.media,
    }))
    setActiveCapturing(false)
    setCaptionInput('')
  }

  const handleEditCaption = () => {
    if (me.status!=='posted') return
    setCaptionInput(me.caption||'')
    setCaptionHasSound(me.media?.hasSound || false)
    setActiveCapturing(true)
  }

  const handleMuteToggle = (stripId) => {
    setUnmutedStripId(prev => prev === stripId ? null : stripId)
  }

  const handleEmojiIconTap = (stripId) => {
    setEmojiBarOpen(prev => ({...prev, [stripId]: !prev[stripId]}))
  }

  const handleEmojiBarDismiss = (stripId) => {
    setEmojiBarOpen(prev => ({...prev, [stripId]: false}))
  }

  const handleEmojiMe = (emoji) => {
    const prevSelection = mySelection['me'] || null
    if (prevSelection === emoji) {
      setMe(prev => {
        const lastIdx = [...prev.reactions].reverse().findIndex(r => r === emoji)
        return {...prev, reactions: prev.reactions.filter((_, i) => i !== prev.reactions.length - 1 - lastIdx)}
      })
      setMySelection(prev => ({...prev, me: null}))
    } else {
      setMe(prev => {
        const filtered = prevSelection
          ? prev.reactions.filter((_, i) => {
              const lastIdx = [...prev.reactions].reverse().findIndex(r => r === prevSelection)
              return i !== prev.reactions.length - 1 - lastIdx
            })
          : [...prev.reactions]
        return {...prev, reactions: [...filtered, emoji]}
      })
      setMySelection(prev => ({...prev, me: emoji}))
    }
    setEmojiBarOpen(prev => ({...prev, me: false}))
  }

  const handleEmojiFriend = (id, emoji) => {
    const prevSelection = mySelection[id] || null
    if (prevSelection === emoji) {
      setFriends(prev => prev.map(f => {
        if (f.id !== id) return f
        const lastIdx = [...f.reactions].reverse().findIndex(r => r === emoji)
        return {...f, reactions: f.reactions.filter((_, i) => i !== f.reactions.length - 1 - lastIdx)}
      }))
      setMySelection(prev => ({...prev, [id]: null}))
    } else {
      setFriends(prev => prev.map(f => {
        if (f.id !== id) return f
        const filtered = prevSelection
          ? f.reactions.filter((_, i) => {
              const lastIdx = [...f.reactions].reverse().findIndex(r => r === prevSelection)
              return i !== f.reactions.length - 1 - lastIdx
            })
          : [...f.reactions]
        return {...f, reactions: [...filtered, emoji]}
      }))
      setMySelection(prev => ({...prev, [id]: emoji}))
    }
    setEmojiBarOpen(prev => ({...prev, [id]: false}))
  }

  const handleSimulatePost = (id) => {
    const color = PHOTO_COLORS[Math.floor(Math.random()*PHOTO_COLORS.length)]
    setFriends(prev => prev.map(f =>
      f.id===id ? {...f, status:'posted', media:{uri:color, hasSound:false}, capturedAt:Date.now()} : f
    ))
  }

  const handleDeleteFriend = (id, nickname) => {
    crossAlert('친구 삭제', `${nickname}을 삭제할까요?`, [
      {text:'취소', style:'cancel'},
      {text:'삭제', style:'destructive', onPress:()=>setFriends(prev=>prev.filter(f=>f.id!==id))},
    ])
  }

  const handleAddFriend = () => {
    if (friends.length>=3) return
    const names = ['친구1','친구2','친구3']
    setFriends(prev=>[...prev, makeFriend(`f${Date.now()}`, names[prev.length]||`친구${prev.length+1}`)])
  }

  const handleInvite = async () => {
    const inviteUrl = 'https://github.com/crisis-designer/setlog-mobile-mini'
    try {
      await Share.share({
        message:`셋로그 같이 해요! 동시에 찍는 소셜 카메라 앱이에요 📸\n${inviteUrl}`,
        title:'Setlog 초대', url: inviteUrl,
      })
    } catch {}
  }

  const handleReset = () => {
    crossAlert('초기화', '모든 콘텐츠를 초기화할까요?', [
      {text:'취소', style:'cancel'},
      {text:'초기화', style:'destructive', onPress:()=>{
        if (cameraIntervalRef.current) { clearInterval(cameraIntervalRef.current); cameraIntervalRef.current=null }
        try { cameraRef.current?.stopRecording() } catch {}
        setActiveCapturing(false)
        setCaptionInput('')
        setCaptionHasSound(false)
        setCameraCountdown(null)
        setEmojiBarOpen({})
        setMySelection({})
        setUnmutedStripId(null)
        recordingPromiseRef.current = null
        setMe(prev => ({...ME_INITIAL, nickname:prev.nickname}))
        setFriends(prev=>prev.map(f=>({...f, status:'waiting', media:null, caption:null, capturedAt:null, reactions:[]})))
      }},
    ])
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.root}>
        {activeTab==='friends' && (
          <FriendsScreen friends={friends} onInvite={handleInvite} onSimulatePost={handleSimulatePost} onDeleteFriend={handleDeleteFriend} onAddFriend={handleAddFriend} />
        )}
        {activeTab==='settings' && (
          <SettingsScreen nickname={me.nickname} onNicknameChange={handleNicknameChange} notifOn={me.notifOn} onToggleNotif={handleToggleNotif} onReset={handleReset} onLogout={onLogout} />
        )}

        {activeTab==='feed' && (
          <View style={{position:'absolute', top: stripHeight, left:0, right:0, bottom: tabBarTotalH}}>
            <FriendsFeedArea
              friends={friends}
              stripHeight={stripHeight}
              screenWidth={screenWidth}
              onEmojiFriend={handleEmojiFriend}
              emojiBarOpen={emojiBarOpen}
              onEmojiIconTap={handleEmojiIconTap}
              onEmojiBarDismiss={handleEmojiBarDismiss}
              mySelection={mySelection}
              unmutedStripId={unmutedStripId}
              onMuteToggle={handleMuteToggle}
            />
          </View>
        )}

        <TabBar activeTab={activeTab} onTabPress={handleTabPress} tabBarTotalH={tabBarTotalH} safeAreaBottom={safeAreaBottom} locked={isShooting} />

        {/* v3.19: "나" 플로팅 레이어 — AppContent 루트, 탭 전환과 무관하게 항상 마운트 */}
        <Animated.View
          style={[
            styles.meFloating,
            { top: meTop, height: meHeight, opacity: activeTab==='feed' ? 1 : 0 },
          ]}
          pointerEvents={activeTab==='feed' ? 'auto' : 'none'}
        >
          <MeStrip
            me={me}
            onPress={handleMeStripPress}
            onEditCaption={handleEditCaption}
            isEmojiBarOpen={!!emojiBarOpen['me']}
            onEmojiIconTap={handleEmojiIconTap}
            onEmojiBarDismiss={handleEmojiBarDismiss}
            mySelection={mySelection['me'] || null}
            onEmoji={handleEmojiMe}
            cameraRef={cameraRef}
            hasCameraPermission={hasCameraPermission}
            countdown={cameraCountdown}
            onCameraReady={handleCameraReady}
            screenWidth={screenWidth}
            screenHeight={screenHeight}
          />
        </Animated.View>

        <CaptionModal
          visible={activeCapturing}
          nickname={me.nickname}
          captionInput={captionInput}
          onCaptionChange={setCaptionInput}
          onPost={handlePost}
          onDismiss={() => setActiveCapturing(false)}
          hasSound={captionHasSound}
          onHasSoundChange={setCaptionHasSound}
        />
      </View>
    </SafeAreaView>
  )
}

// (v3.20: MeStripSized 제거됨 — onLayout 측정 대신 screenWidth/screenHeight를 직접 사용)

// ─────────────────────────────────────────────
// StyleSheet
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {flex:1, backgroundColor:TOKEN.bgTabBar},
  root: {flex:1, position:'relative'},
  strip: {overflow:'hidden', flex:1},

  // AuthFlow
  authSafeArea: {flex:1, backgroundColor:TOKEN.bgTabBar, padding:TOKEN.space20},
  authTopBar: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', height:TOKEN.minTouchTarget},
  authBackBtn: {width:TOKEN.minTouchTarget, height:TOKEN.minTouchTarget, justifyContent:'center', alignItems:'flex-start'},
  authDotsRow: {flexDirection:'row', gap:TOKEN.space8, alignItems:'center'},
  authDot: {width:TOKEN.space8, height:TOKEN.space8, borderRadius:TOKEN.space8/2, backgroundColor:TOKEN.dotInactive},
  authDotActive: {backgroundColor:TOKEN.accentColor},
  authWelcomeWrap: {flex:1, justifyContent:'center', alignItems:'center'},
  authLogo: {color:TOKEN.textOnDark, fontSize:TOKEN.fontCaptionLarge, fontWeight:'700'},
  authSubcopy: {color:TOKEN.textSecondary, fontSize:TOKEN.fontBody, marginTop:TOKEN.space8},
  authBodyWrap: {flex:1, justifyContent:'center'},
  authQuestion: {color:TOKEN.textOnDark, fontSize:TOKEN.fontCaptionLarge, fontWeight:'700', marginBottom:TOKEN.space24},
  authInput: {
    color:TOKEN.textOnDark, fontSize:TOKEN.fontStatus,
    borderBottomWidth:TOKEN.borderWidth, borderBottomColor:TOKEN.borderDefault,
    paddingVertical:TOKEN.space8,
  },
  authErrorText: {color:TOKEN.dangerColor, fontSize:TOKEN.fontBody, marginTop:TOKEN.space12},
  authPrimaryBtn: {backgroundColor:TOKEN.btnPrimaryBg, height:TOKEN.minTouchTarget, borderRadius:TOKEN.btnPrimaryRadius, justifyContent:'center', alignItems:'center'},
  authPrimaryBtnDisabled: {opacity:TOKEN.btnDisabledOpacity},
  authPrimaryBtnText: {color:TOKEN.btnPrimaryText, fontSize:TOKEN.fontBody, fontWeight:'600'},
  authSecondaryBtn: {height:TOKEN.minTouchTarget, justifyContent:'center', alignItems:'center', marginTop:TOKEN.space12},
  authSecondaryBtnText: {color:TOKEN.textOnDark, fontSize:TOKEN.fontBody, fontWeight:'600'},

  meFloating: {
    position:'absolute', left:0, right:0,
    overflow:'hidden',
  },

  nicknameText: {
    position:'absolute', top:TOKEN.nicknamePad, left:TOKEN.nicknamePad,
    color:TOKEN.textOnDark, fontSize:TOKEN.fontNickname, fontWeight:'600',
    textShadowColor:'rgba(0,0,0,0.6)', textShadowOffset:{width:0,height:1}, textShadowRadius:3,
  },
  statusLabelWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent:'center', alignItems:'center',
  },
  statusLabel: {color:TOKEN.textOnDark, fontSize:TOKEN.fontStatus, fontWeight:'700'},

  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent:'center', alignItems:'center',
    backgroundColor:TOKEN.bgCountdownDim,
  },
  countdownText: {
    color:TOKEN.textOnDark, fontWeight:'900',
    textShadowColor:'rgba(0,0,0,0.6)', textShadowOffset:{width:0,height:2}, textShadowRadius:10,
  },

  captionPositioner: {
    position:'absolute', top:0, bottom:0, left:0, right:0,
    justifyContent:'center', alignItems:'center',
    pointerEvents:'box-none',
  },
  captionTouchable: {paddingVertical:TOKEN.space8, paddingHorizontal:TOKEN.space20},
  captionText: {
    color:TOKEN.textOnDark, fontSize:TOKEN.fontCaptionLarge, fontWeight:'600',
    textAlign:'center',
    textShadowColor:'rgba(0,0,0,0.5)', textShadowOffset:{width:0,height:1}, textShadowRadius:4,
  },
  captionEmptyText: {
    color:TOKEN.textOnDark, fontSize:TOKEN.fontCaptionEmpty, fontWeight:'300',
    textAlign:'center', opacity:0.6,
    textShadowColor:'rgba(0,0,0,0.5)', textShadowOffset:{width:0,height:1}, textShadowRadius:4,
  },
  timestampText: {
    position:'absolute', bottom:TOKEN.nicknamePad, left:TOKEN.nicknamePad,
    color:TOKEN.textOnDark, fontSize:TOKEN.fontTimestamp, fontWeight:'500',
  },
  muteBtn: {
    position:'absolute', top:TOKEN.nicknamePad, right:TOKEN.nicknamePad,
    width:TOKEN.minTouchTarget, height:TOKEN.minTouchTarget,
    justifyContent:'center', alignItems:'center',
  },
  emojiUIContainer: {position:'absolute', right:TOKEN.stripPad, bottom:TOKEN.space12},
  emojiUIWrapper: {alignItems:'flex-end'},
  emojiIconBtn: {padding:TOKEN.space4},
  emojiIconText: {fontSize:TOKEN.fontEmoji, opacity:0.8},
  reactionsRow: {flexDirection:'row', gap:TOKEN.space4, alignItems:'center'},
  emojiSelectedSingle: {fontSize:TOKEN.fontEmoji},
  emojiSelectedHighlight: {transform:[{scale:1.15}]},
  emojiBar: {
    flexDirection:'row', gap:TOKEN.emojiGap,
    backgroundColor:TOKEN.emojiBarBg,
    borderRadius:TOKEN.emojiBarRadius,
    paddingHorizontal:TOKEN.space8, paddingVertical:TOKEN.space4,
  },
  emojiItem: {
    width:TOKEN.emojiItemW, height:TOKEN.emojiItemW,
    justifyContent:'center', alignItems:'center', borderRadius:TOKEN.radiusSmall,
  },
  emojiItemActive: {backgroundColor:TOKEN.emojiItemActiveBg},
  emojiChar: {fontSize:TOKEN.fontEmoji},

  tabBar: {
    position:'absolute', bottom:0, left:0, right:0,
    flexDirection:'row', backgroundColor:TOKEN.bgTabBar,
    borderTopWidth:TOKEN.borderWidth, borderTopColor:TOKEN.borderDefault,
    alignItems:'flex-start',
  },
  tabItem: {flex:1, height:TOKEN.tabBarH, justifyContent:'center', alignItems:'center', gap:TOKEN.space4},
  tabLabel: {fontSize:TOKEN.fontTab, fontWeight:'500'},

  tabScreen: {flex:1, backgroundColor:TOKEN.bgTabBar},
  tabScreenContent: {padding:TOKEN.space20, gap:TOKEN.space24},
  sectionBox: {borderBottomWidth:TOKEN.borderWidth, borderBottomColor:TOKEN.borderDefault, paddingBottom:TOKEN.space24},
  sectionTitle: {color:TOKEN.textOnDark, fontSize:TOKEN.fontSectionTitle, fontWeight:'700'},
  sectionBody: {color:TOKEN.textSecondary, fontSize:TOKEN.fontBody},
  primaryBtn: {backgroundColor:TOKEN.btnPrimaryBg, height:TOKEN.minTouchTarget, borderRadius:TOKEN.btnPrimaryRadius, justifyContent:'center', alignItems:'center'},
  primaryBtnText: {color:TOKEN.btnPrimaryText, fontSize:TOKEN.fontBody, fontWeight:'600'},
  friendRow: {flexDirection:'row', alignItems:'center', paddingVertical:TOKEN.space16, borderBottomWidth:TOKEN.borderWidth, borderBottomColor:TOKEN.borderDefault, minHeight:TOKEN.friendRowMinHeight},
  friendName: {color:TOKEN.textOnDark, fontSize:TOKEN.fontSectionTitle, fontWeight:'600'},
  friendStatus: {color:TOKEN.textSecondary, fontSize:TOKEN.fontBody},
  iconBtn: {width:TOKEN.minTouchTarget, height:TOKEN.minTouchTarget, justifyContent:'center', alignItems:'center'},
  settingRow: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', minHeight:TOKEN.minTouchTarget},
  settingLabel: {color:TOKEN.textOnDark, fontSize:TOKEN.fontSectionTitle},
  nicknameLabel: {color:TOKEN.textSecondary, fontSize:TOKEN.fontBody, marginBottom:TOKEN.space8},
  nicknameInput: {
    color:TOKEN.textOnDark, fontSize:TOKEN.fontSectionTitle,
    width:'100%', textAlign:'left',
    paddingHorizontal:TOKEN.space12, paddingVertical:TOKEN.space12,
    borderWidth:TOKEN.borderWidth, borderColor:TOKEN.borderDefault,
    borderRadius:TOKEN.nicknameLabelRadius,
  },
  modalCard: {
    backgroundColor:TOKEN.bgModalCard,
    borderTopLeftRadius:TOKEN.modalRadius, borderTopRightRadius:TOKEN.modalRadius,
    padding:TOKEN.modalCardPadding,
  },
  modalHeader: {color:TOKEN.textPrimary, fontSize:TOKEN.fontNicknameHeader, fontWeight:'600', marginBottom:TOKEN.modalElementGap},
  modalHint: {color:TOKEN.textSecondary, fontSize:TOKEN.fontModalHint, marginBottom:TOKEN.modalElementGap},
  modalInput: {
    color:TOKEN.textPrimary, fontSize:TOKEN.fontCaption,
    borderBottomWidth:TOKEN.borderWidth, borderBottomColor:TOKEN.borderDefault,
    paddingVertical:TOKEN.space8, marginBottom:TOKEN.modalElementGap,
  },
  soundToggleRow: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    paddingVertical:TOKEN.space12,
    borderBottomWidth:TOKEN.borderWidth, borderBottomColor:TOKEN.borderDefault,
    marginBottom:TOKEN.modalElementGap,
  },
  soundToggleLabel: {color:TOKEN.textPrimary, fontSize:TOKEN.fontBody},
  postBtn: {
    backgroundColor:TOKEN.btnPostBg, height:TOKEN.minTouchTarget,
    borderRadius:TOKEN.postBtnRadius, justifyContent:'center', alignItems:'center',
    marginTop:TOKEN.postBtnTopMargin,
  },
  postBtnText: {color:TOKEN.btnPostText, fontSize:TOKEN.fontPostBtn, fontWeight:'600'},
})
