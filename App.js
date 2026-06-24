/**
 * Setlog Mobile Mini — App.js
 * PRD v2.0 기준 생성
 * Single Source of Truth: setlog-prd-v2_0.md
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
  AppState,
  Keyboard,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────
// 섹션 4 — 디자인 토큰 (2계층)
// ─────────────────────────────────────────────

const PRIMITIVE = {
  // Color
  black:        '#000000',
  white:        '#FFFFFF',
  gray100:      '#F3F4F6',
  gray200:      '#E5E7EB',
  gray300:      '#D1D5DB',
  gray400:      '#9CA3AF',
  gray500:      '#6B7280',
  gray900:      '#111827',

  // Opacity
  dim35:        'rgba(0,0,0,0.35)',
  dim60:        'rgba(0,0,0,0.60)',
  white95:      'rgba(255,255,255,0.95)',
  white80:      'rgba(255,255,255,0.80)',
  white50:      'rgba(255,255,255,0.50)',
  transparent:  'transparent',

  // Radius
  radius4:      4,
  radius8:      8,
  radius16:     16,
  radius20:     20,
  radius999:    999,

  // Spacing
  sp4:  4,
  sp6:  6,
  sp8:  8,
  sp12: 12,
  sp16: 16,
  sp20: 20,
  sp24: 24,

  // Font Size
  fs11: 11,
  fs12: 12,
  fs13: 13,
  fs14: 14,
  fs16: 16,

  // Border
  border1: 1,

  // Fixed Sizes
  size44:     44,
  size56:     56,
  opacity30:  0.3,
};

const TOKEN = {
  // Background
  bgWaiting:            PRIMITIVE.gray300,
  bgNotifOff:           PRIMITIVE.gray400,
  bgShooting:           PRIMITIVE.black,
  bgControlBar:         PRIMITIVE.white95,
  bgModalDim:           PRIMITIVE.dim60,
  bgModalCard:          PRIMITIVE.white,
  bgEmojiBar:           PRIMITIVE.dim35,
  bgNicknameDefault:    PRIMITIVE.dim35,
  bgNicknameShooting:   PRIMITIVE.white50,

  // Text
  textPrimary:          PRIMITIVE.gray900,
  textSecondary:        PRIMITIVE.gray500,
  textOnDark:           PRIMITIVE.white,
  textOnShooting:       PRIMITIVE.black,

  // Border
  borderDefault:        PRIMITIVE.gray200,

  // Button
  btnPostBg:            PRIMITIVE.gray900,
  btnPostText:          PRIMITIVE.white,
  btnPostPressedBg:     PRIMITIVE.gray500,
  btnControlBg:         PRIMITIVE.transparent,
  btnControlText:       PRIMITIVE.gray900,
  btnControlPressedBg:  PRIMITIVE.gray100,
  btnDisabledOpacity:   PRIMITIVE.opacity30,

  // Interactive
  emojiPressedBg:       PRIMITIVE.white80,

  // Typography
  fontNickname:         PRIMITIVE.fs12,
  fontCaption:          PRIMITIVE.fs13,
  fontStatus:           PRIMITIVE.fs14,
  fontEmoji:            PRIMITIVE.fs16,
  fontEmojiCount:       PRIMITIVE.fs11,
  fontControl:          PRIMITIVE.fs12,
  fontModalHint:        PRIMITIVE.fs13,
  fontPostBtn:          PRIMITIVE.fs16,
  fontNicknameHeader:   PRIMITIVE.fs14,

  // Spacing & Size
  stripPad:             PRIMITIVE.sp8,
  emojiGap:             PRIMITIVE.sp4,
  nicknamePadH:         PRIMITIVE.sp6,
  nicknamePadV:         PRIMITIVE.sp4,
  controlBarH:          PRIMITIVE.size56,
  borderWidth:          PRIMITIVE.border1,
  modalRadius:          PRIMITIVE.radius16,
  emojiBarRadius:       PRIMITIVE.radius20,
  nicknameLabelRadius:  PRIMITIVE.radius4,
  modalCardPadding:     PRIMITIVE.sp20,
  postBtnRadius:        PRIMITIVE.radius8,
  modalElementGap:      PRIMITIVE.sp8,
  postBtnTopMargin:     PRIMITIVE.sp16,

  // Touch
  minTouchTarget:       PRIMITIVE.size44,
};

// ─────────────────────────────────────────────
// 섹션 6-2 — 파스텔 컬러 / 상수 (컴포넌트 바깥)
// ─────────────────────────────────────────────

const PHOTO_COLORS = ['#A8D8EA','#AA96DA','#FCBAD3','#FFFFD2','#B5EAD7','#FFD7BA','#C7CEEA'];
const AUTO_NICKNAMES = ['친구1', '친구2', '친구3'];
const EMOJI_LIST = ['🔥','😂','👍','😮','😢'];

// ─────────────────────────────────────────────
// 섹션 10 — 초기 유저 상수 (컴포넌트 바깥)
// ─────────────────────────────────────────────

const INITIAL_USER = {
  id: 'user_0',
  nickname: '나',
  notifOn: true,
  status: 'waiting',
  countdown: null,
  photo: null,
  caption: null,
  reactions: { '🔥': 0, '😂': 0, '👍': 0, '😮': 0, '😢': 0 },
};

// ─────────────────────────────────────────────
// 섹션 11 — App: SafeAreaProvider 루트 래핑
// ─────────────────────────────────────────────

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

// ─────────────────────────────────────────────
// AppContent: 모든 상태·로직 집중
// ─────────────────────────────────────────────

function AppContent() {
  // 섹션 5 — 반응형
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { top: safeAreaTop, bottom: safeAreaBottom } = useSafeAreaInsets();

  // 섹션 10 — 상태
  const [users, setUsers] = useState([INITIAL_USER]);
  const [activeCapturingUserId, setActiveCapturingUserId] = useState(null);
  const [captioningQueue, setCaptioningQueue] = useState([]);
  const [captionDraft, setCaptionDraft] = useState('');

  // 섹션 10 — Ref
  const intervalMap = useRef(new Map());
  const backgroundTimestamps = useRef(new Map());
  const appStateRef = useRef(AppState.currentState);

  // 섹션 5 — 파생 계산값
  const controlBarTotalH = TOKEN.controlBarH + safeAreaBottom;
  const stripHeight = (screenHeight - safeAreaTop - controlBarTotalH) / users.length;
  const canAddFriend =
    users.length < 4 &&
    (screenHeight - safeAreaTop - controlBarTotalH) / (users.length + 1) >= 120;
  const countdownFontSize = Math.min(80, Math.max(40, Math.floor(stripHeight * 0.4)));

  // ─── captioningQueue useEffect (레이스컨디션 방지) ───────────────────────
  useEffect(() => {
    if (activeCapturingUserId === null && captioningQueue.length > 0) {
      const nextId = captioningQueue[0];
      setActiveCapturingUserId(nextId);
      setCaptioningQueue(prev => prev.slice(1));
      setCaptionDraft('');
    }
  }, [captioningQueue, activeCapturingUserId]);

  // ─── AppState 백그라운드 처리 ────────────────────────────────────────────
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (prevState === 'active' && nextState.match(/inactive|background/)) {
        // 백그라운드 진입 — shooting 중인 유저 타임스탬프 저장 후 인터벌 정지
        setUsers(prev =>
          prev.map(u => {
            if (u.status === 'shooting') {
              backgroundTimestamps.current.set(u.id, Date.now());
              const id = intervalMap.current.get(u.id);
              if (id != null) {
                clearInterval(id);
                intervalMap.current.delete(u.id);
              }
            }
            return u;
          })
        );
      } else if (nextState === 'active' && prevState.match(/inactive|background/)) {
        // foreground 복귀 — 경과 시간 계산 후 재개
        setUsers(prev =>
          prev.map(u => {
            if (u.status !== 'shooting') return u;
            const enteredAt = backgroundTimestamps.current.get(u.id);
            if (!enteredAt) return u;
            const elapsedSeconds = Math.floor((Date.now() - enteredAt) / 1000);
            const remaining = (u.countdown ?? 0) - elapsedSeconds;
            backgroundTimestamps.current.delete(u.id);

            if (remaining <= 0) {
              // 즉시 셔터
              const photo = PHOTO_COLORS[Math.floor(Math.random() * PHOTO_COLORS.length)];
              setCaptioningQueue(q => [...q, u.id]);
              return { ...u, countdown: null, photo, status: 'captioning' };
            } else {
              // 남은 카운트로 재시작
              startCountdown(u.id, remaining);
              return { ...u, countdown: remaining };
            }
          })
        );
      }
    });

    return () => subscription.remove();
  }, []);

  // cleanup — 언마운트 시 전체 인터벌 정리
  useEffect(() => {
    return () => {
      intervalMap.current.forEach(id => clearInterval(id));
    };
  }, []);

  // ─── 카운트다운 시작 헬퍼 ────────────────────────────────────────────────
  const startCountdown = useCallback((userId, initialCount = 3) => {
    const id = setInterval(() => {
      setUsers(prev =>
        prev.map(u => {
          if (u.id !== userId) return u;
          if ((u.countdown ?? initialCount) <= 1) {
            clearInterval(id);
            intervalMap.current.delete(userId);
            const photo = PHOTO_COLORS[Math.floor(Math.random() * PHOTO_COLORS.length)];
            setCaptioningQueue(q => [...q, userId]);
            return { ...u, countdown: null, photo, status: 'captioning' };
          }
          return { ...u, countdown: (u.countdown ?? initialCount) - 1 };
        })
      );
    }, 1000);
    intervalMap.current.set(userId, id);
  }, []);

  // ─── 강제 트리거 ─────────────────────────────────────────────────────────
  const handleTrigger = useCallback(() => {
    Keyboard.dismiss();
    setUsers(prev =>
      prev.map(u => {
        if (u.status !== 'waiting' || !u.notifOn) return u;
        startCountdown(u.id, 3);
        return { ...u, status: 'shooting', countdown: 3 };
      })
    );
  }, [startCountdown]);

  // ─── 알림 토글 ───────────────────────────────────────────────────────────
  const handleNotifToggle = useCallback((userId) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== userId) return u;
        // shooting/captioning/posted 중이면 변경 없음 (플로우 보호)
        if (['shooting', 'captioning', 'posted'].includes(u.status)) return u;
        const nextNotifOn = !u.notifOn;
        return {
          ...u,
          notifOn: nextNotifOn,
          status: nextNotifOn ? 'waiting' : 'notif_off',
        };
      })
    );
  }, []);

  // ─── 친구 추가 ───────────────────────────────────────────────────────────
  const handleAddFriend = useCallback(() => {
    if (!canAddFriend) return;
    setUsers(prev => {
      const nextIndex = prev.length;
      const newUser = {
        id: `user_${nextIndex}`,
        nickname: AUTO_NICKNAMES[nextIndex - 1] ?? `친구${nextIndex}`,
        notifOn: true,
        status: 'waiting',
        countdown: null,
        photo: null,
        caption: null,
        reactions: { '🔥': 0, '😂': 0, '👍': 0, '😮': 0, '😢': 0 },
      };
      return [...prev, newUser];
    });
  }, [canAddFriend]);

  // ─── 친구 제거 ───────────────────────────────────────────────────────────
  const handleRemoveFriend = useCallback(() => {
    if (users.length <= 1) return;
    setUsers(prev => {
      const target = prev[prev.length - 1];
      // shooting 중: 인터벌 정리
      if (target.status === 'shooting') {
        const id = intervalMap.current.get(target.id);
        if (id != null) {
          clearInterval(id);
          intervalMap.current.delete(target.id);
        }
      }
      // captioning 중: 큐에서 제거
      if (target.status === 'captioning') {
        setCaptioningQueue(q => q.filter(id => id !== target.id));
        if (activeCapturingUserId === target.id) {
          setActiveCapturingUserId(null);
        }
      }
      return prev.slice(0, prev.length - 1);
    });
  }, [users.length, activeCapturingUserId]);

  // ─── 리셋 ────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    Alert.alert('초기화', '모든 콘텐츠를 초기화할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        style: 'destructive',
        onPress: () => {
          intervalMap.current.forEach(id => clearInterval(id));
          intervalMap.current.clear();
          backgroundTimestamps.current.clear();
          setActiveCapturingUserId(null);
          setCaptioningQueue([]);
          setCaptionDraft('');
          setUsers(prev =>
            prev.map(u => ({
              ...u,
              status: u.notifOn ? 'waiting' : 'notif_off',
              countdown: null,
              photo: null,
              caption: null,
              reactions: { '🔥': 0, '😂': 0, '👍': 0, '😮': 0, '😢': 0 },
            }))
          );
        },
      },
    ]);
  }, []);

  // ─── 이모지 리액션 ───────────────────────────────────────────────────────
  const handleEmoji = useCallback((userId, emoji) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== userId) return u;
        return {
          ...u,
          reactions: { ...u.reactions, [emoji]: u.reactions[emoji] + 1 },
        };
      })
    );
  }, []);

  // ─── 캡션 올리기 ─────────────────────────────────────────────────────────
  const handlePost = useCallback(() => {
    if (!activeCapturingUserId) return;
    const finalCaption = captionDraft.trim() === '' ? null : captionDraft.trim();
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== activeCapturingUserId) return u;
        return { ...u, caption: finalCaption, status: 'posted' };
      })
    );
    setActiveCapturingUserId(null);
    setCaptionDraft('');
  }, [activeCapturingUserId, captionDraft]);

  // ─── QA 컨트롤 바: 트리거 비활성 조건 ──────────────────────────────────
  const canTrigger = users.some(u => u.status === 'waiting' && u.notifOn);

  // ─────────────────────────────────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.root}>

        {/* ── MainCanvas ── */}
        <View style={styles.mainCanvas}>
          {users.map((user, index) => {
            const isLast = index === users.length - 1;
            const bgColor =
              user.status === 'waiting'   ? TOKEN.bgWaiting  :
              user.status === 'notif_off' ? TOKEN.bgNotifOff :
              user.status === 'shooting'  ? TOKEN.bgShooting :
              user.photo ?? TOKEN.bgWaiting;

            const nicknameBg =
              user.status === 'shooting'
                ? TOKEN.bgNicknameShooting
                : TOKEN.bgNicknameDefault;
            const nicknameColor =
              user.status === 'shooting'
                ? TOKEN.textOnShooting
                : TOKEN.textOnDark;

            return (
              <View
                key={user.id}
                style={[
                  styles.strip,
                  {
                    height: stripHeight,
                    backgroundColor: bgColor,
                    borderBottomWidth: isLast ? 0 : TOKEN.borderWidth,
                    borderBottomColor: TOKEN.borderDefault,
                  },
                ]}
              >
                {/* L2 — NicknameLabel */}
                <View
                  style={[
                    styles.nicknameLabel,
                    {
                      backgroundColor: nicknameBg,
                      paddingHorizontal: TOKEN.nicknamePadH,
                      paddingVertical: TOKEN.nicknamePadV,
                      borderRadius: TOKEN.nicknameLabelRadius,
                      top: TOKEN.stripPad,
                      left: TOKEN.stripPad,
                    },
                  ]}
                >
                  <Text style={{ color: nicknameColor, fontSize: TOKEN.fontNickname }}>
                    {user.nickname}
                  </Text>
                </View>

                {/* L3 — StatusLabel (waiting / notif_off) */}
                {(user.status === 'waiting' || user.status === 'notif_off') && (
                  <View style={styles.centerContent}>
                    <Text
                      style={{
                        color: TOKEN.textSecondary,
                        fontSize: TOKEN.fontStatus,
                      }}
                    >
                      {user.status === 'waiting' ? '대기 중' : '알림 끔'}
                    </Text>
                  </View>
                )}

                {/* L4 — CountdownOverlay (shooting + countdown > 0) */}
                {user.status === 'shooting' && user.countdown != null && user.countdown > 0 && (
                  <View style={[styles.fullOverlay, { backgroundColor: TOKEN.bgShooting }]}>
                    <Text
                      style={{
                        color: TOKEN.textOnDark,
                        fontSize: countdownFontSize,
                        fontWeight: 'bold',
                      }}
                    >
                      {user.countdown}
                    </Text>
                  </View>
                )}

                {/* L5 — CaptionLabel (posted + caption ≠ null) */}
                {user.status === 'posted' && user.caption != null && (
                  <View
                    style={[
                      styles.captionLabel,
                      {
                        backgroundColor: TOKEN.bgNicknameDefault,
                        paddingHorizontal: TOKEN.nicknamePadH,
                        paddingVertical: TOKEN.nicknamePadV,
                        borderRadius: TOKEN.nicknameLabelRadius,
                        bottom: TOKEN.stripPad,
                        left: TOKEN.stripPad,
                        right: screenWidth * 0.35,
                      },
                    ]}
                  >
                    <Text
                      style={{ color: TOKEN.textOnDark, fontSize: TOKEN.fontCaption }}
                      numberOfLines={2}
                    >
                      {user.caption}
                    </Text>
                  </View>
                )}

                {/* L6 — EmojiBar (posted) */}
                {user.status === 'posted' && (
                  <View
                    style={[
                      styles.emojiBarContainer,
                      {
                        backgroundColor: TOKEN.bgEmojiBar,
                        borderRadius: TOKEN.emojiBarRadius,
                        maxWidth: screenWidth * 0.7,
                        bottom: TOKEN.stripPad,
                        right: TOKEN.stripPad,
                        paddingHorizontal: TOKEN.stripPad / 2,
                        paddingVertical: TOKEN.stripPad / 2,
                        gap: TOKEN.emojiGap,
                      },
                    ]}
                  >
                    {EMOJI_LIST.map(emoji => (
                      <TouchableOpacity
                        key={emoji}
                        activeOpacity={0.6}
                        onPress={() => handleEmoji(user.id, emoji)}
                        style={[styles.emojiItem, { height: TOKEN.minTouchTarget }]}
                      >
                        <Text style={{ fontSize: TOKEN.fontEmoji }}>{emoji}</Text>
                        {user.reactions[emoji] > 0 && (
                          <Text
                            style={{
                              color: TOKEN.textOnDark,
                              fontSize: TOKEN.fontEmojiCount,
                            }}
                          >
                            {user.reactions[emoji]}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── QA 컨트롤 바 ── */}
        <View
          style={[
            styles.controlBar,
            {
              height: controlBarTotalH,
              paddingBottom: safeAreaBottom,
              backgroundColor: TOKEN.bgControlBar,
              borderTopWidth: TOKEN.borderWidth,
              borderTopColor: TOKEN.borderDefault,
            },
          ]}
        >
          {/* 알림 토글 — 첫 번째 유저(나) 기준 */}
          <ControlButton
            label={users[0].notifOn ? '🔔 ON' : '🔕 OFF'}
            onPress={() => handleNotifToggle(users[0].id)}
            disabled={false}
          />

          {/* 친구 추가 */}
          <ControlButton
            label="+ 친구"
            onPress={handleAddFriend}
            disabled={!canAddFriend}
          />

          {/* 친구 제거 */}
          <ControlButton
            label="- 친구"
            onPress={handleRemoveFriend}
            disabled={users.length <= 1}
          />

          {/* 강제 트리거 */}
          <ControlButton
            label="📣 발송"
            onPress={handleTrigger}
            disabled={!canTrigger}
          />

          {/* 리셋 */}
          <ControlButton
            label="↺ 리셋"
            onPress={handleReset}
            disabled={false}
          />
        </View>
      </View>

      {/* ── CaptionModal ── */}
      <Modal
        visible={activeCapturingUserId !== null}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* 딤드 배경 — 탭해도 닫힘 없음 */}
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalDim, { backgroundColor: TOKEN.bgModalDim }]} />
          </TouchableWithoutFeedback>

          {/* 모달 카드 */}
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: TOKEN.bgModalCard,
                borderTopLeftRadius: TOKEN.modalRadius,
                borderTopRightRadius: TOKEN.modalRadius,
                padding: TOKEN.modalCardPadding,
              },
            ]}
          >
            {/* NicknameHeader */}
            <Text
              style={{
                color: TOKEN.textPrimary,
                fontSize: TOKEN.fontNicknameHeader,
                fontWeight: '600',
                marginBottom: TOKEN.modalElementGap,
              }}
            >
              {users.find(u => u.id === activeCapturingUserId)?.nickname ?? ''}의 캡션
            </Text>

            {/* HintText */}
            <Text
              style={{
                color: TOKEN.textSecondary,
                fontSize: TOKEN.fontModalHint,
                marginBottom: TOKEN.modalElementGap,
              }}
            >
              사진 설명을 입력하세요 (선택, 최대 50자)
            </Text>

            {/* TextInput */}
            <TextInput
              value={captionDraft}
              onChangeText={setCaptionDraft}
              maxLength={50}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handlePost}
              style={[
                styles.textInput,
                {
                  fontSize: TOKEN.fontCaption,
                  color: TOKEN.textPrimary,
                  borderColor: TOKEN.borderDefault,
                  borderWidth: TOKEN.borderWidth,
                  borderRadius: TOKEN.nicknameLabelRadius,
                  padding: TOKEN.stripPad,
                  marginBottom: TOKEN.modalElementGap,
                  minHeight: TOKEN.minTouchTarget,
                },
              ]}
              placeholder="지금 이 순간을 기록하세요"
              placeholderTextColor={TOKEN.textSecondary}
            />

            {/* PostButton — Type A */}
            <TouchableOpacity
              onPress={handlePost}
              activeOpacity={0.8}
              style={[
                styles.postButton,
                {
                  backgroundColor: TOKEN.btnPostBg,
                  borderRadius: TOKEN.postBtnRadius,
                  height: TOKEN.minTouchTarget,
                  marginTop: TOKEN.postBtnTopMargin,
                },
              ]}
            >
              <Text
                style={{
                  color: TOKEN.btnPostText,
                  fontSize: TOKEN.fontPostBtn,
                  fontWeight: '600',
                }}
              >
                올리기
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// ControlButton — Type B
// ─────────────────────────────────────────────

function ControlButton({ label, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.controlBtn,
        { height: TOKEN.controlBarH },
        disabled && { opacity: TOKEN.btnDisabledOpacity },
      ]}
    >
      <Text style={{ color: TOKEN.btnControlText, fontSize: TOKEN.fontControl }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
// StyleSheet
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: TOKEN.bgWaiting,
  },
  root: {
    flex: 1,
    position: 'relative',
  },
  mainCanvas: {
    flex: 1,
    overflow: 'hidden',
  },
  strip: {
    overflow: 'hidden',
    position: 'relative',
  },
  nicknameLabel: {
    position: 'absolute',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionLabel: {
    position: 'absolute',
  },
  emojiBarContainer: {
    position: 'absolute',
    flexDirection: 'row',
  },
  emojiItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  controlBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TOKEN.btnControlBg,
  },
  keyboardAvoid: {
    flex: 1,
  },
  modalDim: {
    flex: 1,
  },
  modalCard: {
    // borderRadius는 인라인으로 적용 (TOKEN 참조)
  },
  textInput: {
    // 인라인 스타일로 TOKEN 참조
  },
  postButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});