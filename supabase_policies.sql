-- Supabase RLS 정책 설정
-- 이 파일의 SQL을 Supabase 대시보드 > SQL Editor에서 실행하세요

-- 1. 기존 정책들 삭제 (있다면)
DROP POLICY IF EXISTS "Users can manage own user_info" ON user_info;
DROP POLICY IF EXISTS "Anyone can view user_info" ON user_info;
DROP POLICY IF EXISTS "Users can insert own user_info" ON user_info;
DROP POLICY IF EXISTS "Users can update own user_info" ON user_info;

-- 2. RLS 활성화
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;

-- 3. 새로운 정책 생성

-- 모든 인증된 사용자가 모든 사용자 정보를 조회할 수 있음 (소셜 기능용)
CREATE POLICY "authenticated_users_can_view_all_user_info" ON user_info
    FOR SELECT TO authenticated USING (true);

-- 사용자는 자신의 정보만 생성할 수 있음
CREATE POLICY "users_can_insert_own_user_info" ON user_info
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 사용자는 자신의 정보만 수정할 수 있음 (프로필 화면용)
CREATE POLICY "users_can_update_own_user_info" ON user_info
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 사용자는 자신의 정보만 삭제할 수 있음
CREATE POLICY "users_can_delete_own_user_info" ON user_info
    FOR DELETE TO authenticated USING (auth.uid() = id);

-- 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_info';