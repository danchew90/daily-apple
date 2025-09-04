export interface Database {
  public: {
    Tables: {
      user_info: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          birth_day: string | null
          created_at: string
          update_at: string | null
          nick_name: string | null
        }
        Insert: {
          id: string
          name?: string | null
          phone?: string | null
          birth_day?: string | null
          created_at?: string
          update_at?: string | null
          nick_name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          phone?: string | null
          birth_day?: string | null
          created_at?: string
          update_at?: string | null
          nick_name?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type UserInfo = Database['public']['Tables']['user_info']['Row']
export type UserInfoInsert = Database['public']['Tables']['user_info']['Insert']
export type UserInfoUpdate = Database['public']['Tables']['user_info']['Update']