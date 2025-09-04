import React, { useState } from 'react'
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { Link, router } from 'expo-router'
import { Text, View } from '@/components/Themed'
import { useAuth } from '@/contexts/AuthContext'

export default function FindEmailScreen() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [foundEmail, setFoundEmail] = useState('')
  const { findEmailByInfo } = useAuth()

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const limited = numbers.slice(0, 11)
    
    if (limited.length <= 3) {
      return limited
    } else if (limited.length <= 7) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`
    }
  }

  const handleFindEmail = async () => {
    if (!name.trim()) {
      Alert.alert('오류', '이름을 입력해주세요.')
      return
    }

    if (!phone.trim()) {
      Alert.alert('오류', '전화번호를 입력해주세요.')
      return
    }

    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('오류', '올바른 전화번호를 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      setFoundEmail('')
      
      const { email, error } = await findEmailByInfo(name.trim(), phone.trim())
      
      if (error) {
        Alert.alert('계정 찾기 실패', error)
      } else if (email) {
        setFoundEmail(email)
        Alert.alert('이메일 찾기 성공', `회원님의 이메일은 ${email} 입니다.`)
      }
    } catch (error) {
      Alert.alert('오류', '이메일 찾기 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToLogin = () => {
    router.replace('/login')
  }

  const handleGoToForgotPassword = () => {
    router.push('/forgot-password')
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>이메일 찾기</Text>
            <Text style={styles.subtitle}>
              회원가입 시 입력한 이름과 전화번호를{'\n'}
              정확히 입력해주세요.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                placeholder="회원가입 시 입력한 이름"
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>전화번호</Text>
              <TextInput
                style={styles.input}
                placeholder="010-1234-5678"
                value={phone}
                onChangeText={(text) => {
                  const formatted = formatPhoneNumber(text)
                  setPhone(formatted)
                }}
                keyboardType="numeric"
                maxLength={13}
                editable={!isLoading}
              />
            </View>

            {foundEmail ? (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>찾은 이메일:</Text>
                <Text style={styles.resultEmail}>{foundEmail}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.findButton, isLoading && styles.disabledButton]}
              onPress={handleFindEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.findButtonText}>이메일 찾기</Text>
              )}
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <TouchableOpacity 
                onPress={handleGoToLogin}
                disabled={isLoading}
              >
                <Text style={[styles.linkText, isLoading && styles.disabledText]}>
                  로그인하러 가기
                </Text>
              </TouchableOpacity>

              {foundEmail && (
                <TouchableOpacity 
                  onPress={handleGoToForgotPassword}
                  disabled={isLoading}
                >
                  <Text style={[styles.linkText, isLoading && styles.disabledText]}>
                    비밀번호 재설정
                  </Text>
                </TouchableOpacity>
              )}

              <Link href="/signup" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text style={[styles.linkText, isLoading && styles.disabledText]}>
                    회원가입하러 가기
                  </Text>
                </TouchableOpacity>
              </Link>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  resultContainer: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultEmail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  findButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  findButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    alignItems: 'center',
    gap: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
})