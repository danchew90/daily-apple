import React, { useState, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import EditScreenInfo from '@/components/EditScreenInfo'
import { Text, View } from '@/components/Themed'
import { UserInfoBottomSheet } from '@/components/UserInfoBottomSheet'
import { useAuth } from '@/contexts/AuthContext'

export default function TabOneScreen() {
  const { user, userInfo, isLoading } = useAuth()
  const [showBottomSheet, setShowBottomSheet] = useState(false)

  useEffect(() => {
    // 로그인된 상태이고, 로딩이 끝났으며, userInfo가 없거나 필수 정보가 없는 경우
    if (user && !isLoading && userInfo) {
      const hasRequiredInfo = userInfo.name && userInfo.nick_name
      if (!hasRequiredInfo) {
        setShowBottomSheet(true)
      }
    }
  }, [user, userInfo, isLoading])

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false)
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Daily Apple</Text>
        {userInfo && userInfo.nick_name && (
          <Text style={styles.welcome}>
            안녕하세요, {userInfo.nick_name}님! 🍎
          </Text>
        )}
        <View style={styles.separator} lightColor="#eee" />
        <EditScreenInfo path="app/(tabs)/index.tsx" />
      </View>

      <UserInfoBottomSheet
        isVisible={showBottomSheet}
        onClose={handleCloseBottomSheet}
      />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  welcome: {
    fontSize: 18,
    marginBottom: 20,
    color: '#007AFF',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});