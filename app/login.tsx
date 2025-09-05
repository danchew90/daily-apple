import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native'
import { Link, router } from 'expo-router'
import { Text, View } from '@/components/Themed'
import { useAuth } from '@/contexts/AuthContext'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated'

// ✅ SVG를 이용해 자연스러운 블러 그림자 구현
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()

  // 애니메이션 값
  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)

  useEffect(() => {
    const startBounceAnimation = () => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 600, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      )

      translateY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 600, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 600, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      )
    }

    startBounceAnimation()

    return () => {
      cancelAnimation(scale)
      cancelAnimation(translateY)
    }
  }, [])

  // 이미지 애니메이션
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }))

  // 그림자 애니메이션 (크기 & 투명도 변화)
  const shadowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [-10, 0], [0.3, 0.8])
    const shadowScale = interpolate(translateY.value, [-10, 0], [0.6, 1])
    return {
      opacity,
      transform: [{ scaleX: shadowScale }, { scaleY: shadowScale * 0.7 }],
    }
  })

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.')
      return
    }
    if (!email.includes('@')) {
      Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      const { error } = await signIn(email, password)
      if (error) {
        Alert.alert('로그인 실패', error)
      } else {
        router.replace('/(tabs)')
      }
    } catch (error) {
      Alert.alert('오류', '로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            {/* ✅ SVG 블러 그림자 */}
            <Animated.View style={[styles.shadowWrapper, shadowStyle]}>
              <Svg width="80" height="20">
                <Defs>
                  <RadialGradient id="grad" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
                    <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </RadialGradient>
                </Defs>
                <Rect width="80" height="20" rx="50" fill="url(#grad)" />
              </Svg>
            </Animated.View>

            {/* ✅ 점프하는 이미지 */}
            <Animated.View style={[animatedStyle]}>
              <Image
                source={require('../assets/images/icon.png')}
                style={styles.mainImg}
              />
            </Animated.View>

            <Text style={styles.logoText}>오늘의 사과</Text>
          </View>

          {/* ✅ 로그인 폼 */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="이메일"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>로그인</Text>
              )}
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <View style={styles.forgotContainer}>
                <Link href="/find-email" asChild>
                  <TouchableOpacity disabled={isLoading}>
                    <Text
                      style={[
                        styles.forgotLink,
                        isLoading && styles.disabledText,
                      ]}
                    >
                      이메일 찾기
                    </Text>
                  </TouchableOpacity>
                </Link>
                <Text style={styles.separator}>|</Text>
                <Link href="/forgot-password" asChild>
                  <TouchableOpacity disabled={isLoading}>
                    <Text
                      style={[
                        styles.forgotLink,
                        isLoading && styles.disabledText,
                      ]}
                    >
                      비밀번호 찾기
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>계정이 없으신가요? </Text>
                <Link href="/signup" asChild>
                  <TouchableOpacity disabled={isLoading}>
                    <Text
                      style={[styles.signupLink, isLoading && styles.disabledText]}
                    >
                      회원가입
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
    position: 'relative',
  },
  shadowWrapper: {
    position: 'absolute',
    bottom: 45,
    width: 80,
    height: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 20,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    alignItems: 'center',
    gap: 20,
  },
  forgotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  forgotLink: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  separator: {
    fontSize: 14,
    color: '#ccc',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
  },
  signupLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  disabledText: {
    opacity: 0.5,
  },
  mainImg: {
    width: 100,
    height: 100,
  },
})
