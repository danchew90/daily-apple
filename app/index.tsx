import React from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'
import { Redirect } from 'expo-router'
import { Text, View } from '@/components/Themed'
import { useAuth } from '@/contexts/AuthContext'

export default function StartPage() {
  const { user, isLoading } = useAuth()

  // 로딩 중인 경우 스플래시 화면 표시
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logoText}>Daily Apple</Text>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    )
  }

  // 로그인 상태에 따라 라우팅
  if (user) {
    return <Redirect href="/(tabs)" />
  } else {
    return <Redirect href="/login" />
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
})