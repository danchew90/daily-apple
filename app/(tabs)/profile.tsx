import React, { useState } from 'react'
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Text, View } from '@/components/Themed'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfileScreen() {
  const { user, userInfo, signOut, updateUserInfo } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: userInfo?.name || '',
    nick_name: userInfo?.nick_name || '',
    phone: userInfo?.phone || '',
    birth_day: userInfo?.birth_day || '',
  })

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const { error } = await updateUserInfo(formData)
      
      if (error) {
        Alert.alert('오류', error)
      } else {
        setIsEditing(false)
        Alert.alert('성공', '프로필이 업데이트되었습니다.')
      }
    } catch (error) {
      Alert.alert('오류', '프로필 업데이트 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: userInfo?.name || '',
      nick_name: userInfo?.nick_name || '',
      phone: userInfo?.phone || '',
      birth_day: userInfo?.birth_day || '',
    })
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    Alert.alert(
      '로그아웃',
      '정말로 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/login')
          },
        },
      ]
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  }

  if (!user || !userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>프로필 로딩 중...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>프로필</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개인 정보</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이름</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={!isLoading}
              />
            ) : (
              <Text style={styles.value}>{formData.name || '이름 없음'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>닉네임</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                placeholder="닉네임을 입력하세요"
                value={formData.nick_name}
                onChangeText={(text) => setFormData({ ...formData, nick_name: text })}
                editable={!isLoading}
              />
            ) : (
              <Text style={styles.value}>{formData.nick_name || '닉네임 없음'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>전화번호</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                placeholder="전화번호를 입력하세요"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            ) : (
              <Text style={styles.value}>{formData.phone || '전화번호 없음'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>생년월일</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD 형식으로 입력하세요"
                value={formData.birth_day}
                onChangeText={(text) => setFormData({ ...formData, birth_day: text })}
                editable={!isLoading}
              />
            ) : (
              <Text style={styles.value}>
                {formData.birth_day ? formatDate(formData.birth_day) : '생년월일 없음'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 정보</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>가입일</Text>
            <Text style={styles.value}>
              {formatDate(userInfo.created_at)}
            </Text>
          </View>
          {userInfo.update_at && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>마지막 수정일</Text>
              <Text style={styles.value}>
                {formatDate(userInfo.update_at)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, isLoading && styles.disabledButton]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>저장</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>프로필 수정</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleSignOut}
            disabled={isLoading}
          >
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    opacity: 0.7,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  value: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minHeight: 44,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
})