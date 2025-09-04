import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Text, View } from '@/components/Themed'
import { useAuth } from '@/contexts/AuthContext'

interface UserInfoBottomSheetProps {
  isVisible: boolean
  onClose: () => void
}

export const UserInfoBottomSheet: React.FC<UserInfoBottomSheetProps> = ({
  isVisible,
  onClose,
}) => {
  const { updateUserInfo, checkNicknameAvailability } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingNickname, setIsCheckingNickname] = useState(false)
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
  const [nicknameError, setNicknameError] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [formData, setFormData] = useState({
    name: '',
    nick_name: '',
    phone: '',
    birth_day: '',
  })

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['85%'], [])

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '')
    
    // 최대 11자리까지만
    const limited = numbers.slice(0, 11)
    
    // 형식 적용: 010-1234-5678
    if (limited.length <= 3) {
      return limited
    } else if (limited.length <= 7) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`
    }
  }

  // 닉네임 중복 확인 버튼 핸들러
  const handleCheckNickname = async () => {
    if (!formData.nick_name.trim() || formData.nick_name.length < 2) {
      Alert.alert('알림', '2자 이상의 닉네임을 입력해주세요.')
      return
    }

    setIsCheckingNickname(true)
    setNicknameStatus('checking')
    
    const { available, error } = await checkNicknameAvailability(formData.nick_name)
    
    if (error) {
      setNicknameStatus('unavailable')
      setNicknameError(error)
      Alert.alert('오류', error)
    } else {
      setNicknameStatus(available ? 'available' : 'unavailable')
      setNicknameError(available ? '' : '이미 사용 중인 닉네임입니다.')
      Alert.alert(
        available ? '사용 가능' : '사용 불가', 
        available ? '사용 가능한 닉네임입니다!' : '이미 사용 중인 닉네임입니다.'
      )
    }
    
    setIsCheckingNickname(false)
  }

  // 닉네임이 변경되면 검증 상태 초기화
  useEffect(() => {
    setNicknameStatus('idle')
    setNicknameError('')
  }, [formData.nick_name])

  // 날짜 선택 처리
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
      if (selectedDate && event.type !== 'dismissed') {
        setSelectedDate(selectedDate)
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate.getDate()).padStart(2, '0')
        const formattedDate = `${year}-${month}-${day}`
        setFormData({ ...formData, birth_day: formattedDate })
      }
    } else {
      // iOS에서는 실시간으로 날짜만 업데이트
      if (selectedDate) {
        setSelectedDate(selectedDate)
      }
    }
  }

  // iOS에서 날짜 확인
  const handleDateConfirm = () => {
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`
    setFormData({ ...formData, birth_day: formattedDate })
    setShowDatePicker(false)
  }

  // iOS에서 날짜 취소
  const handleDateCancel = () => {
    setShowDatePicker(false)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('오류', '이름을 입력해주세요.')
      return false
    }
    if (!formData.nick_name.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.')
      return false
    }
    if (nicknameStatus !== 'available') {
      Alert.alert('오류', '사용 가능한 닉네임을 입력해주세요.')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)
      const { error } = await updateUserInfo({
        name: formData.name.trim(),
        nick_name: formData.nick_name.trim(),
        phone: formData.phone.trim() || null,
        birth_day: formData.birth_day.trim() || null,
      })

      if (error) {
        Alert.alert('오류', error)
      } else {
        Alert.alert('완료', '프로필 정보가 저장되었습니다!', [
          { text: '확인', onPress: onClose }
        ])
      }
    } catch (error) {
      Alert.alert('오류', '정보 저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // 바텀시트가 완전히 닫힌 상태
      // 첫 로그인 시에는 닫히지 않도록 제한할 수 있음
    }
  }, [])

  if (!isVisible) return null

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={false} // 첫 로그인시 강제로 입력하도록
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <Text style={styles.title}>프로필 정보 입력</Text>
            <Text style={styles.subtitle}>
              Daily Apple을 시작하기 위해 기본 정보를 입력해주세요
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이름 *</Text>
              <TextInput
                style={styles.input}
                placeholder="실명을 입력해주세요"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>닉네임 *</Text>
              <View style={styles.nicknameInputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.nicknameInput,
                    nicknameStatus === 'available' && styles.inputSuccess,
                    nicknameStatus === 'unavailable' && styles.inputError
                  ]}
                  placeholder="다른 사용자에게 보여질 이름"
                  value={formData.nick_name}
                  onChangeText={(text) => setFormData({ ...formData, nick_name: text })}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    (isCheckingNickname || !formData.nick_name.trim() || formData.nick_name.length < 2) && styles.checkButtonDisabled
                  ]}
                  onPress={handleCheckNickname}
                  disabled={isCheckingNickname || !formData.nick_name.trim() || formData.nick_name.length < 2 || isLoading}
                >
                  {isCheckingNickname ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.checkButtonText}>중복확인</Text>
                  )}
                </TouchableOpacity>
              </View>
              {nicknameStatus === 'available' && (
                <Text style={styles.nicknameStatus}>✓ 사용 가능한 닉네임입니다</Text>
              )}
              {nicknameStatus === 'unavailable' && (
                <Text style={styles.nicknameStatusError}>✗ {nicknameError}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>전화번호</Text>
              <TextInput
                style={styles.input}
                placeholder="010-1234-5678"
                value={formData.phone}
                onChangeText={(text) => {
                  const formatted = formatPhoneNumber(text)
                  setFormData({ ...formData, phone: formatted })
                }}
                keyboardType="numeric"
                maxLength={13} // 010-1234-5678
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>생년월일</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateButton]}
                onPress={() => setShowDatePicker(true)}
                disabled={isLoading}
              >
                <Text style={[styles.dateText, !formData.birth_day && styles.placeholder]}>
                  {formData.birth_day ? 
                    new Date(formData.birth_day).toLocaleDateString('ko-KR') : 
                    '생년월일을 선택하세요 (선택사항)'
                  }
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && Platform.OS === 'ios' && (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={showDatePicker}
                  onRequestClose={handleDateCancel}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.datePickerModal}>
                      <View style={styles.datePickerHeader}>
                        <TouchableOpacity onPress={handleDateCancel}>
                          <Text style={styles.datePickerCancel}>취소</Text>
                        </TouchableOpacity>
                        <Text style={styles.datePickerTitle}>생년월일 선택</Text>
                        <TouchableOpacity onPress={handleDateConfirm}>
                          <Text style={styles.datePickerConfirm}>확인</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1900, 0, 1)}
                        locale="ko-KR"
                      />
                    </View>
                  </View>
                </Modal>
              )}
              
              {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>시작하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  indicator: {
    backgroundColor: '#ddd',
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputSuccess: {
    borderColor: '#34C759',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  nicknameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nicknameInput: {
    flex: 1,
  },
  checkButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: '#ccc',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  nicknameStatus: {
    fontSize: 12,
    color: '#34C759',
    marginTop: 4,
    fontWeight: '600',
  },
  nicknameStatusError: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    fontWeight: '600',
  },
  dateButton: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area for iPhone
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerCancel: {
    fontSize: 16,
    color: '#666',
  },
  datePickerConfirm: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})