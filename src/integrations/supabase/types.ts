export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      institution_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          images: Json | null
          institution_id: string
          is_pinned: boolean | null
          links: Json | null
          post_type: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          images?: Json | null
          institution_id: string
          is_pinned?: boolean | null
          links?: Json | null
          post_type?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          images?: Json | null
          institution_id?: string
          is_pinned?: boolean | null
          links?: Json | null
          post_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_posts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institution_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_profiles: {
        Row: {
          additional_info: string | null
          address: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          contact_number: string | null
          cover_photo_url: string | null
          created_at: string | null
          description: string | null
          id: string
          institution_name: string
          institution_type: string | null
          location: string | null
          mission: string | null
          profile_photo_url: string | null
          registration_number: string | null
          social_media: Json | null
          updated_at: string | null
          user_id: string
          vision: string | null
          website_url: string | null
        }
        Insert: {
          additional_info?: string | null
          address?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          contact_number?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          institution_name: string
          institution_type?: string | null
          location?: string | null
          mission?: string | null
          profile_photo_url?: string | null
          registration_number?: string | null
          social_media?: Json | null
          updated_at?: string | null
          user_id: string
          vision?: string | null
          website_url?: string | null
        }
        Update: {
          additional_info?: string | null
          address?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          contact_number?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          institution_name?: string
          institution_type?: string | null
          location?: string | null
          mission?: string | null
          profile_photo_url?: string | null
          registration_number?: string | null
          social_media?: Json | null
          updated_at?: string | null
          user_id?: string
          vision?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "institution_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "institution_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          completed_at: string
          id: string
          quiz_id: string
          score: number | null
          student_id: string
          time_taken: number | null
          total_questions: number | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string
          id?: string
          quiz_id: string
          score?: number | null
          student_id: string
          time_taken?: number | null
          total_questions?: number | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string
          id?: string
          quiz_id?: string
          score?: number | null
          student_id?: string
          time_taken?: number | null
          total_questions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_favorites: {
        Row: {
          created_at: string
          id: string
          quiz_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quiz_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quiz_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_favorites_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          background_image: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          image_url: string | null
          institution_id: string
          question_count: number | null
          questions: Json | null
          sound_enabled: boolean | null
          status: string
          subject: string | null
          time_limit: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_image?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          institution_id: string
          question_count?: number | null
          questions?: Json | null
          sound_enabled?: boolean | null
          status?: string
          subject?: string | null
          time_limit?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_image?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          institution_id?: string
          question_count?: number | null
          questions?: Json | null
          sound_enabled?: boolean | null
          status?: string
          subject?: string | null
          time_limit?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institution_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code_used: string
          coins_awarded: number
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          code_used: string
          coins_awarded?: number
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          code_used?: string
          coins_awarded?: number
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      scholarship_applications: {
        Row: {
          created_at: string
          external_link: string | null
          form_fields: Json | null
          form_type: string
          id: string
          scholarship_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_link?: string | null
          form_fields?: Json | null
          form_type: string
          id?: string
          scholarship_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_link?: string | null
          form_fields?: Json | null
          form_type?: string
          id?: string
          scholarship_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_applications_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_favorites: {
        Row: {
          created_at: string
          id: string
          scholarship_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scholarship_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scholarship_id?: string
          student_id?: string
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          application_date: string | null
          application_deadline: string | null
          benefits: string | null
          created_at: string | null
          description: string | null
          eligibility_criteria: string | null
          id: string
          image_url: string | null
          institution_id: string
          requirements: Json | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          application_date?: string | null
          application_deadline?: string | null
          benefits?: string | null
          created_at?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          id?: string
          image_url?: string | null
          institution_id: string
          requirements?: Json | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          application_date?: string | null
          application_deadline?: string | null
          benefits?: string | null
          created_at?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          id?: string
          image_url?: string | null
          institution_id?: string
          requirements?: Json | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institution_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          earned_at: string
          icon: string | null
          id: string
          student_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          earned_at?: string
          icon?: string | null
          id?: string
          student_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          earned_at?: string
          icon?: string | null
          id?: string
          student_id?: string
        }
        Relationships: []
      }
      student_applications: {
        Row: {
          application_data: Json
          completion_checklist: Json | null
          id: string
          progress_percentage: number | null
          scholarship_id: string
          status: string | null
          student_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          application_data: Json
          completion_checklist?: Json | null
          id?: string
          progress_percentage?: number | null
          scholarship_id: string
          status?: string | null
          student_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          application_data?: Json
          completion_checklist?: Json | null
          id?: string
          progress_percentage?: number | null
          scholarship_id?: string
          status?: string | null
          student_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_applications_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          file_size: string | null
          file_url: string
          id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          file_size?: string | null
          file_url: string
          id?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          file_size?: string | null
          file_url?: string
          id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_materials: {
        Row: {
          content: string | null
          created_at: string
          downloaded_at: string
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          material_id: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          downloaded_at?: string
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          material_id?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          downloaded_at?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          material_id?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "study_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          academic_level: string | null
          completed_onboarding: boolean | null
          created_at: string
          extracurricular: string[] | null
          field_of_study: string | null
          gpa: number | null
          id: string
          interests: string[] | null
          location_preference: string | null
          preferred_scholarship_types: string[] | null
          skills: string[] | null
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_level?: string | null
          completed_onboarding?: boolean | null
          created_at?: string
          extracurricular?: string[] | null
          field_of_study?: string | null
          gpa?: number | null
          id?: string
          interests?: string[] | null
          location_preference?: string | null
          preferred_scholarship_types?: string[] | null
          skills?: string[] | null
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_level?: string | null
          completed_onboarding?: boolean | null
          created_at?: string
          extracurricular?: string[] | null
          field_of_study?: string | null
          gpa?: number | null
          id?: string
          interests?: string[] | null
          location_preference?: string | null
          preferred_scholarship_types?: string[] | null
          skills?: string[] | null
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_tasks: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          is_completed: boolean
          scholarship_id: string | null
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          is_completed?: boolean
          scholarship_id?: string | null
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          is_completed?: boolean
          scholarship_id?: string | null
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_tasks_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      study_materials: {
        Row: {
          created_at: string | null
          description: string | null
          file_size: string | null
          file_type: string | null
          file_url: string | null
          id: string
          image_url: string | null
          institution_id: string
          subject: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          institution_id: string
          subject: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          institution_id?: string
          subject?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_materials_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institution_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_packages: {
        Row: {
          coins: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          coins: number
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          coins?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          banned_at: string
          banned_by: string
          banned_until: string
          created_at: string
          id: string
          is_active: boolean
          reason: string
          user_id: string
        }
        Insert: {
          banned_at?: string
          banned_by: string
          banned_until: string
          created_at?: string
          id?: string
          is_active?: boolean
          reason: string
          user_id: string
        }
        Update: {
          banned_at?: string
          banned_by?: string
          banned_until?: string
          created_at?: string
          id?: string
          is_active?: boolean
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_coins: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "institution" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "institution", "student"],
    },
  },
} as const
