export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "student" | "teacher" | "supervisor" | "admin";
export type ContentStatus = "draft" | "published" | "archived";
export type ActivityType =
  | "quiz"
  | "drag_and_drop"
  | "matching"
  | "flashcards"
  | "poll"
  | "game_challenge"
  | "assignment_upload"
  | "interactive_video"
  | "fill_in_blank"
  | "story_sequencing"
  | "image_recognition"
  | "audio_recognition"
  | "video_response"
  | "discussion_prompt";
export type SubmissionStatus = "pending" | "submitted" | "graded" | "returned";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          avatar_url: string | null;
          school_id: string | null;
          is_active: boolean;
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          avatar_url?: string | null;
          school_id?: string | null;
          is_active?: boolean;
          onboarded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string;
          role?: UserRole;
          avatar_url?: string | null;
          school_id?: string | null;
          is_active?: boolean;
          onboarded_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          }
        ];
      };
      schools: {
        Row: {
          id: string;
          name: string;
          code: string;
          logo_url: string | null;
          address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          logo_url?: string | null;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          code?: string;
          logo_url?: string | null;
          address?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          level: string | null;
          cover_image_url: string | null;
          status: ContentStatus;
          created_by: string;
          school_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          level?: string | null;
          cover_image_url?: string | null;
          status?: ContentStatus;
          created_by: string;
          school_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          level?: string | null;
          cover_image_url?: string | null;
          status?: ContentStatus;
          school_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "courses_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "courses_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          }
        ];
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          sort_order: number;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          description: string | null;
          content_json: Json | null;
          teacher_notes: string | null;
          timing_guide: string | null;
          sort_order: number;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          description?: string | null;
          content_json?: Json | null;
          teacher_notes?: string | null;
          timing_guide?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          content_json?: Json | null;
          teacher_notes?: string | null;
          timing_guide?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          }
        ];
      };
      activities: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          type: ActivityType;
          config_json: Json | null;
          sort_order: number;
          points: number;
          time_limit_seconds: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          type: ActivityType;
          config_json?: Json | null;
          sort_order?: number;
          points?: number;
          time_limit_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          type?: ActivityType;
          config_json?: Json | null;
          sort_order?: number;
          points?: number;
          time_limit_seconds?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          }
        ];
      };
      classes: {
        Row: {
          id: string;
          name: string;
          course_id: string;
          school_id: string;
          grade_level: string | null;
          academic_year: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          course_id: string;
          school_id: string;
          grade_level?: string | null;
          academic_year: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          grade_level?: string | null;
          academic_year?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "classes_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classes_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          }
        ];
      };
      class_teachers: {
        Row: {
          id: string;
          class_id: string;
          teacher_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          teacher_id: string;
          created_at?: string;
        };
        Update: {};
        Relationships: [
          {
            foreignKeyName: "class_teachers_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_teachers_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      class_students: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id: string;
          enrolled_at?: string;
        };
        Update: {};
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_students_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      lesson_assignments: {
        Row: {
          id: string;
          lesson_id: string;
          class_id: string;
          assigned_by: string;
          assigned_at: string;
          due_date: string | null;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          class_id: string;
          assigned_by: string;
          assigned_at?: string;
          due_date?: string | null;
        };
        Update: {
          due_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_assignments_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_assignments_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_assignments_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      attendance: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          lesson_id: string;
          date: string;
          status: AttendanceStatus;
          marked_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id: string;
          lesson_id: string;
          date: string;
          status: AttendanceStatus;
          marked_by: string;
          created_at?: string;
        };
        Update: {
          status?: AttendanceStatus;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_marked_by_fkey";
            columns: ["marked_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      submissions: {
        Row: {
          id: string;
          activity_id: string;
          student_id: string;
          class_id: string;
          response_json: Json | null;
          file_url: string | null;
          score: number | null;
          max_score: number | null;
          status: SubmissionStatus;
          feedback: string | null;
          graded_by: string | null;
          submitted_at: string;
          graded_at: string | null;
        };
        Insert: {
          id?: string;
          activity_id: string;
          student_id: string;
          class_id: string;
          response_json?: Json | null;
          file_url?: string | null;
          score?: number | null;
          max_score?: number | null;
          status?: SubmissionStatus;
          feedback?: string | null;
          graded_by?: string | null;
          submitted_at?: string;
          graded_at?: string | null;
        };
        Update: {
          response_json?: Json | null;
          file_url?: string | null;
          score?: number | null;
          max_score?: number | null;
          status?: SubmissionStatus;
          feedback?: string | null;
          graded_by?: string | null;
          graded_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_graded_by_fkey";
            columns: ["graded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      student_progress: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string;
          class_id: string;
          started_at: string | null;
          completed_at: string | null;
          completion_percentage: number;
        };
        Insert: {
          id?: string;
          student_id: string;
          lesson_id: string;
          class_id: string;
          started_at?: string | null;
          completed_at?: string | null;
          completion_percentage?: number;
        };
        Update: {
          started_at?: string | null;
          completed_at?: string | null;
          completion_percentage?: number;
        };
        Relationships: [
          {
            foreignKeyName: "student_progress_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_progress_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          }
        ];
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon_url: string | null;
          criteria_json: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon_url?: string | null;
          criteria_json?: Json | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          icon_url?: string | null;
          criteria_json?: Json | null;
        };
        Relationships: [];
      };
      student_badges: {
        Row: {
          id: string;
          student_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {};
        Relationships: [
          {
            foreignKeyName: "student_badges_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_badges_badge_id_fkey";
            columns: ["badge_id"];
            isOneToOne: false;
            referencedRelation: "badges";
            referencedColumns: ["id"];
          }
        ];
      };
      certificates: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          issued_at: string;
          certificate_url: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          issued_at?: string;
          certificate_url?: string | null;
        };
        Update: {
          certificate_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "certificates_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      teaching_sessions: {
        Row: {
          id: string;
          teacher_id: string;
          lesson_id: string;
          class_id: string;
          started_at: string;
          ended_at: string | null;
          activities_launched: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          lesson_id: string;
          class_id: string;
          started_at?: string;
          ended_at?: string | null;
          activities_launched?: Json | null;
          created_at?: string;
        };
        Update: {
          ended_at?: string | null;
          activities_launched?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "teaching_sessions_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teaching_sessions_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teaching_sessions_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      user_role: UserRole;
      content_status: ContentStatus;
      activity_type: ActivityType;
      submission_status: SubmissionStatus;
      attendance_status: AttendanceStatus;
    };
  };
}
