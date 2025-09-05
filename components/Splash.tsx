// Splash.tsx
import React, { useEffect } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { Text } from '@/components/Themed'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated'
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg'
import * as SplashScreen from 'expo-splash-screen'

interface SplashProps {
  onFinish: () => void // 스플래시 완료 시 콜백
}

export default function Splash({ onFinish }: SplashProps) {
  // 애니메이션 값
  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0)

  useEffect(() => {
    // 네이티브 스플래시 숨기기
    SplashScreen.hideAsync()

    // 페이드 인 애니메이션
    opacity.value = withTiming(1, { duration: 800 })

    // 점프 애니메이션 시작
    const startBounceAnimation = () => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 600, easing: Easing.in(Easing.quad) })
        ),
        3, // 3번 반복 후 종료
        false
      )

      translateY.value = withRepeat(
        withSequence(
          withTiming(-15, { duration: 600, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 600, easing: Easing.in(Easing.quad) })
        ),
        3, // 3번 반복 후 종료
        false,
        () => {
          // 애니메이션 완료 후 페이드 아웃
          opacity.value = withTiming(0, { duration: 500 }, () => {
            runOnJS(onFinish)() // 스플래시 완료 콜백
          })
        }
      )
    }

    // 약간의 지연 후 애니메이션 시작
    const timer = setTimeout(startBounceAnimation, 300)

    return () => clearTimeout(timer)
  }, [])

  // 전체 컨테이너 애니메이션
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  // 이미지 애니메이션
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }))

  // 그림자 애니메이션
  const shadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(translateY.value, [-15, 0], [0.2, 0.6])
    const shadowScale = interpolate(translateY.value, [-15, 0], [0.5, 1])
    return {
      opacity: shadowOpacity,
      transform: [{ scaleX: shadowScale }, { scaleY: shadowScale * 0.7 }],
    }
  })

  // 텍스트 페이드 애니메이션 (이미지보다 살짝 늦게)
  const textStyle = useAnimatedStyle(() => {
    const textOpacity = interpolate(
      opacity.value,
      [0, 0.5, 1],
      [0, 0, 1]
    )
    return {
      opacity: textOpacity,
      transform: [
        {
          translateY: interpolate(
            opacity.value,
            [0, 1],
            [20, 0]
          )
        }
      ]
    }
  })

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.logoContainer}>
        {/* SVG 그림자 */}
        <Animated.View style={[styles.shadowWrapper, shadowStyle]}>
          <Svg width="100" height="25">
            <Defs>
              <RadialGradient id="splashGrad" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgba(0,0,0,0.5)" />
                <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </RadialGradient>
            </Defs>
            <Rect width="100" height="25" rx="50" fill="url(#splashGrad)" />
          </Svg>
        </Animated.View>

        {/* 점프하는 이미지 */}
        <Animated.View style={animatedStyle}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.mainImg}
          />
        </Animated.View>

        {/* 앱 이름 */}
        <Animated.View style={textStyle}>
          <Text style={styles.logoText}>오늘의 사과</Text>          
        </Animated.View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // 또는 원하는 배경색
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  shadowWrapper: {
    position: 'absolute',
    bottom: 60,
    width: 100,
    height: 25,
  },
  mainImg: {
    width: 120,
    height: 120,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
})