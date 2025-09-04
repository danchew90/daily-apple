import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserInfo, UserInfoInsert, UserInfoUpdate } from '@/types/database'

interface AuthContextType {
  user: User | null
  userInfo: UserInfo | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateUserInfo: (updates: UserInfoUpdate) => Promise<{ error?: string }>
  checkNicknameAvailability: (nickname: string) => Promise<{ available: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ error?: string }>
  findEmailByInfo: (name: string, phone: string) => Promise<{ email?: string; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // user_info 테이블에서 사용자 정보 가져오기
  const fetchUserInfo = async (userId: string): Promise<UserInfo | null> => {
    try {
      const { data, error } = await supabase
        .from('user_info')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user info:', error)
        return null
      }

      return data || null
    } catch (error) {
      console.error('Error in fetchUserInfo:', error)
      return null
    }
  }

  // user_info 테이블에 기본 사용자 정보 생성
  const createUserInfo = async (userId: string, userEmail?: string): Promise<UserInfo | null> => {
    try {
      console.log('Creating user info for user ID:', userId, 'with email:', userEmail)
      
      // 먼저 이미 존재하는지 확인
      const existing = await fetchUserInfo(userId)
      if (existing) {
        console.log('User info already exists:', existing)
        // 이메일이 없으면 업데이트
        if (!existing.email && userEmail) {
          const { data: updatedData } = await supabase
            .from('user_info')
            .update({ email: userEmail, update_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single()
          return updatedData || existing
        }
        return existing
      }

      const userInfoData: UserInfoInsert = {
        id: userId,
        name: null,
        phone: null,
        birth_day: null,
        nick_name: null,
        email: userEmail || null,
        created_at: new Date().toISOString(),
        update_at: new Date().toISOString(),
      }

      console.log('Inserting user info data:', userInfoData)

      const { data, error } = await supabase
        .from('user_info')
        .insert(userInfoData)
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // 중복 키 오류인 경우 기존 데이터를 반환
        if (error.code === '23505') {
          console.log('Duplicate key error, fetching existing data')
          return await fetchUserInfo(userId)
        }
        return null
      }

      console.log('User info created successfully:', data)
      return data
    } catch (error) {
      console.error('Error in createUserInfo:', error)
      return null
    }
  }

  // 닉네임 중복 확인
  const checkNicknameAvailability = async (nickname: string): Promise<{ available: boolean; error?: string }> => {
    if (!nickname.trim()) {
      return { available: false, error: '닉네임을 입력해주세요.' }
    }

    try {
      const { data, error } = await supabase
        .from('user_info')
        .select('id')
        .eq('nick_name', nickname.trim())
        .neq('id', user?.id || '') // 본인 제외

      if (error) {
        console.error('Error checking nickname:', error)
        return { available: false, error: '닉네임 확인 중 오류가 발생했습니다.' }
      }

      const available = !data || data.length === 0
      return { 
        available, 
        error: available ? undefined : '이미 사용 중인 닉네임입니다.' 
      }
    } catch (error) {
      console.error('Error in checkNicknameAvailability:', error)
      return { available: false, error: '닉네임 확인 중 오류가 발생했습니다.' }
    }
  }

  // 사용자 정보 업데이트
  const updateUserInfo = async (updates: UserInfoUpdate): Promise<{ error?: string }> => {
    if (!user) {
      return { error: '로그인이 필요합니다.' }
    }

    try {
      const { data, error } = await supabase
        .from('user_info')
        .update({
          ...updates,
          update_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user info:', error)
        return { error: '사용자 정보 업데이트에 실패했습니다.' }
      }

      if (data) {
        setUserInfo(data)
      }

      return {}
    } catch (error) {
      console.error('Error in updateUserInfo:', error)
      return { error: '사용자 정보 업데이트에 실패했습니다.' }
    }
  }

  // 로그인
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: '로그인에 실패했습니다.' }
    } finally {
      setIsLoading(false)
    }
  }

  // 회원가입
  const signUp = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setIsLoading(true)
      console.log('Starting signup process for:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('Supabase auth signup result:', { data, error })

      if (error) {
        console.error('Supabase auth signup error:', error)
        return { error: error.message }
      }

      console.log('Signup successful')
      return {}
    } catch (error) {
      console.error('Signup catch error:', error)
      return { error: '회원가입에 실패했습니다.' }
    } finally {
      setIsLoading(false)
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setUserInfo(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 비밀번호 재설정
  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.EXPO_PUBLIC_API_URL}/auth/callback`,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: '비밀번호 재설정 메일 전송에 실패했습니다.' }
    }
  }

  // 이름과 전화번호로 이메일 찾기
  const findEmailByInfo = async (name: string, phone: string): Promise<{ email?: string; error?: string }> => {
    try {
      console.log('Searching for user with:', { name: name.trim(), phone: phone.trim() })
      
      // user_info 테이블에서 일치하는 사용자의 이메일 찾기
      const { data: userInfoData, error: userInfoError } = await supabase
        .from('user_info')
        .select('email')
        .eq('name', name.trim())
        .eq('phone', phone.trim())
        .single()

      console.log('User info search result:', { userInfoData, userInfoError })

      if (userInfoError) {
        console.error('Error searching user info:', userInfoError)
        return { error: '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.' }
      }

      if (!userInfoData || !userInfoData.email) {
        return { error: '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.' }
      }

      const email = userInfoData.email
      
      // 이메일 마스킹 처리
      const [localPart, domain] = email.split('@')
      const maskedLocal = localPart.length > 2 
        ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
        : localPart[0] + '*'.repeat(localPart.length - 1)
      const maskedEmail = `${maskedLocal}@${domain}`

      console.log('Found user, returning masked email:', maskedEmail)
      return { email: maskedEmail }
    } catch (error) {
      console.error('Error finding email:', error)
      return { error: '이메일 찾기 중 오류가 발생했습니다.' }
    }
  }

  // 인증 상태 변경 감지
  useEffect(() => {
    // 초기 세션 확인
    const getSession = async () => {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // 사용자 정보 가져오기 또는 생성
        let info = await fetchUserInfo(session.user.id)
        if (!info) {
          info = await createUserInfo(session.user.id, session.user.email)
        }
        setUserInfo(info)
      }
      
      setIsLoading(false)
    }

    getSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, 'Session:', session)
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          console.log('User authenticated, setting up user info for:', session.user.id)
          // 사용자 정보 가져오기 또는 생성
          let info = await fetchUserInfo(session.user.id)
          if (!info) {
            console.log('No user info found, creating new one')
            info = await createUserInfo(session.user.id, session.user.email)
            if (!info) {
              console.error('Database error saving new user')
            }
          }
          setUserInfo(info)
        } else {
          console.log('No user session, clearing user info')
          setUserInfo(null)
        }

        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextType = {
    user,
    userInfo,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUserInfo,
    checkNicknameAvailability,
    resetPassword,
    findEmailByInfo,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}