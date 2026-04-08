-- ============================================================
-- LMS Initial Schema Migration
-- ============================================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'supervisor', 'admin');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE activity_type AS ENUM (
  'quiz', 'drag_and_drop', 'matching', 'flashcards', 'poll',
  'game_challenge', 'assignment_upload', 'interactive_video',
  'fill_in_blank', 'story_sequencing', 'image_recognition',
  'audio_recognition', 'video_response', 'discussion_prompt'
);
CREATE TYPE submission_status AS ENUM ('pending', 'submitted', 'graded', 'returned');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- ============================================================
-- HELPER: auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SCHOOLS
-- ============================================================
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_school_id ON profiles(school_id);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Auto-create profile on signup
-- NOTE: After running this migration, go to Supabase Dashboard:
--   Database → Functions → handle_new_user (already created below)
--   Database → Triggers → Create trigger:
--     Name: on_auth_user_created
--     Table: auth.users
--     Events: INSERT (AFTER)
--     Function: handle_new_user
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  level TEXT,
  cover_image_url TEXT,
  status content_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_school_id ON courses(school_id);
CREATE INDEX idx_courses_created_by ON courses(created_by);

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MODULES
-- ============================================================
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_modules_course_id ON modules(course_id);

CREATE TRIGGER modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- LESSONS
-- ============================================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_json JSONB,
  teacher_notes TEXT,
  timing_guide TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lessons_module_id ON lessons(module_id);

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ACTIVITIES
-- ============================================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type activity_type NOT NULL,
  config_json JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  time_limit_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activities_lesson_id ON activities(lesson_id);
CREATE INDEX idx_activities_type ON activities(type);

CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- CLASSES
-- ============================================================
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  grade_level TEXT,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_classes_course_id ON classes(course_id);
CREATE INDEX idx_classes_school_id ON classes(school_id);

CREATE TRIGGER classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- CLASS ENROLLMENTS
-- ============================================================
CREATE TABLE class_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, teacher_id)
);

CREATE INDEX idx_class_teachers_teacher_id ON class_teachers(teacher_id);

CREATE TABLE class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id)
);

CREATE INDEX idx_class_students_student_id ON class_students(student_id);

-- ============================================================
-- LESSON ASSIGNMENTS
-- ============================================================
CREATE TABLE lesson_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ,
  UNIQUE(lesson_id, class_id)
);

CREATE INDEX idx_lesson_assignments_class_id ON lesson_assignments(class_id);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  marked_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id, lesson_id, date)
);

CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_class_id ON attendance(class_id);

-- ============================================================
-- SUBMISSIONS
-- ============================================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  response_json JSONB,
  file_url TEXT,
  score NUMERIC,
  max_score NUMERIC,
  status submission_status NOT NULL DEFAULT 'pending',
  feedback TEXT,
  graded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  graded_at TIMESTAMPTZ
);

CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_activity_id ON submissions(activity_id);
CREATE INDEX idx_submissions_class_id ON submissions(class_id);
CREATE INDEX idx_submissions_status ON submissions(status);

-- ============================================================
-- STUDENT PROGRESS
-- ============================================================
CREATE TABLE student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  UNIQUE(student_id, lesson_id, class_id)
);

CREATE INDEX idx_student_progress_student_id ON student_progress(student_id);

-- ============================================================
-- BADGES
-- ============================================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  criteria_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, badge_id)
);

CREATE INDEX idx_student_badges_student_id ON student_badges(student_id);

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  certificate_url TEXT,
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_certificates_student_id ON certificates(student_id);

-- ============================================================
-- TEACHING SESSIONS
-- ============================================================
CREATE TABLE teaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  activities_launched JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teaching_sessions_teacher_id ON teaching_sessions(teacher_id);
CREATE INDEX idx_teaching_sessions_class_id ON teaching_sessions(class_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS POLICIES: Admin (full access)
-- ============================================================
CREATE POLICY admin_all_schools ON schools FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_profiles ON profiles FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_courses ON courses FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_modules ON modules FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_lessons ON lessons FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_activities ON activities FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_classes ON classes FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_class_teachers ON class_teachers FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_class_students ON class_students FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_lesson_assignments ON lesson_assignments FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_attendance ON attendance FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_submissions ON submissions FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_student_progress ON student_progress FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_badges ON badges FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_student_badges ON student_badges FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_certificates ON certificates FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_teaching_sessions ON teaching_sessions FOR ALL
  USING (public.user_role() = 'admin');

CREATE POLICY admin_all_notifications ON notifications FOR ALL
  USING (public.user_role() = 'admin');

-- ============================================================
-- RLS POLICIES: Supervisor (CRUD courses/modules/lessons/activities, read all)
-- ============================================================
CREATE POLICY supervisor_read_schools ON schools FOR SELECT
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_read_profiles ON profiles FOR SELECT
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_all_courses ON courses FOR ALL
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_all_modules ON modules FOR ALL
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_all_lessons ON lessons FOR ALL
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_all_activities ON activities FOR ALL
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_read_classes ON classes FOR SELECT
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_read_class_teachers ON class_teachers FOR SELECT
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_read_class_students ON class_students FOR SELECT
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_all_lesson_assignments ON lesson_assignments FOR ALL
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_read_attendance ON attendance FOR SELECT
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_read_submissions ON submissions FOR SELECT
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_read_student_progress ON student_progress FOR SELECT
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_all_badges ON badges FOR ALL
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_read_student_badges ON student_badges FOR SELECT
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_read_certificates ON certificates FOR SELECT
  USING (public.user_role() = 'supervisor');

CREATE POLICY supervisor_read_teaching_sessions ON teaching_sessions FOR SELECT
  USING (public.user_role() = 'supervisor');

-- ============================================================
-- RLS POLICIES: Teacher (read assigned classes, manage attendance/submissions)
-- ============================================================
CREATE POLICY teacher_read_own_profile ON profiles FOR SELECT
  USING (public.user_role() = 'teacher' AND id = auth.uid());

CREATE POLICY teacher_update_own_profile ON profiles FOR UPDATE
  USING (public.user_role() = 'teacher' AND id = auth.uid());

CREATE POLICY teacher_read_schools ON schools FOR SELECT
  USING (public.user_role() = 'teacher');

CREATE POLICY teacher_read_assigned_classes ON classes FOR SELECT
  USING (
    public.user_role() = 'teacher'
    AND id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
  );

CREATE POLICY teacher_read_own_class_teachers ON class_teachers FOR SELECT
  USING (public.user_role() = 'teacher' AND teacher_id = auth.uid());

CREATE POLICY teacher_read_class_students ON class_students FOR SELECT
  USING (
    public.user_role() = 'teacher'
    AND class_id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
  );

CREATE POLICY teacher_read_student_profiles ON profiles FOR SELECT
  USING (
    public.user_role() = 'teacher'
    AND id IN (
      SELECT student_id FROM class_students
      WHERE class_id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
    )
  );

CREATE POLICY teacher_read_courses ON courses FOR SELECT
  USING (
    public.user_role() = 'teacher'
    AND id IN (
      SELECT course_id FROM classes
      WHERE id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
    )
  );

CREATE POLICY teacher_read_modules ON modules FOR SELECT
  USING (
    public.user_role() = 'teacher'
    AND course_id IN (
      SELECT course_id FROM classes
      WHERE id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
    )
  );

CREATE POLICY teacher_read_lessons ON lessons FOR SELECT
  USING (
    public.user_role() = 'teacher'
    AND module_id IN (
      SELECT id FROM modules WHERE course_id IN (
        SELECT course_id FROM classes
        WHERE id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
      )
    )
  );

CREATE POLICY teacher_read_activities ON activities FOR SELECT
  USING (
    public.user_role() = 'teacher'
    AND lesson_id IN (
      SELECT id FROM lessons WHERE module_id IN (
        SELECT id FROM modules WHERE course_id IN (
          SELECT course_id FROM classes
          WHERE id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
        )
      )
    )
  );

CREATE POLICY teacher_read_lesson_assignments ON lesson_assignments FOR SELECT
  USING (
    public.user_role() = 'teacher'
    AND class_id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
  );

CREATE POLICY teacher_manage_attendance ON attendance FOR ALL
  USING (
    public.user_role() = 'teacher'
    AND class_id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
  );

CREATE POLICY teacher_read_submissions ON submissions FOR SELECT
  USING (
    public.user_role() = 'teacher'
    AND class_id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
  );

CREATE POLICY teacher_grade_submissions ON submissions FOR UPDATE
  USING (
    public.user_role() = 'teacher'
    AND class_id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
  );

CREATE POLICY teacher_read_student_progress ON student_progress FOR SELECT
  USING (
    public.user_role() = 'teacher'
    AND class_id IN (SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid())
  );

CREATE POLICY teacher_manage_teaching_sessions ON teaching_sessions FOR ALL
  USING (public.user_role() = 'teacher' AND teacher_id = auth.uid());

CREATE POLICY teacher_read_badges ON badges FOR SELECT
  USING (public.user_role() = 'teacher');

-- ============================================================
-- RLS POLICIES: Student (read own data, submit work)
-- ============================================================
CREATE POLICY student_read_own_profile ON profiles FOR SELECT
  USING (public.user_role() = 'student' AND id = auth.uid());

CREATE POLICY student_update_own_profile ON profiles FOR UPDATE
  USING (public.user_role() = 'student' AND id = auth.uid());

CREATE POLICY student_read_schools ON schools FOR SELECT
  USING (public.user_role() = 'student');

CREATE POLICY student_read_enrolled_classes ON classes FOR SELECT
  USING (
    public.user_role() = 'student'
    AND id IN (SELECT class_id FROM class_students WHERE student_id = auth.uid())
  );

CREATE POLICY student_read_own_enrollments ON class_students FOR SELECT
  USING (public.user_role() = 'student' AND student_id = auth.uid());

CREATE POLICY student_read_class_teachers ON class_teachers FOR SELECT
  USING (
    public.user_role() = 'student'
    AND class_id IN (SELECT class_id FROM class_students WHERE student_id = auth.uid())
  );

CREATE POLICY student_read_courses ON courses FOR SELECT
  USING (
    public.user_role() = 'student'
    AND status = 'published'
    AND id IN (
      SELECT course_id FROM classes
      WHERE id IN (SELECT class_id FROM class_students WHERE student_id = auth.uid())
    )
  );

CREATE POLICY student_read_modules ON modules FOR SELECT
  USING (
    public.user_role() = 'student'
    AND status = 'published'
    AND course_id IN (
      SELECT course_id FROM classes
      WHERE id IN (SELECT class_id FROM class_students WHERE student_id = auth.uid())
    )
  );

CREATE POLICY student_read_lessons ON lessons FOR SELECT
  USING (
    public.user_role() = 'student'
    AND status = 'published'
    AND module_id IN (
      SELECT id FROM modules WHERE status = 'published' AND course_id IN (
        SELECT course_id FROM classes
        WHERE id IN (SELECT class_id FROM class_students WHERE student_id = auth.uid())
      )
    )
  );

CREATE POLICY student_read_activities ON activities FOR SELECT
  USING (
    public.user_role() = 'student'
    AND lesson_id IN (
      SELECT id FROM lessons WHERE status = 'published' AND module_id IN (
        SELECT id FROM modules WHERE status = 'published' AND course_id IN (
          SELECT course_id FROM classes
          WHERE id IN (SELECT class_id FROM class_students WHERE student_id = auth.uid())
        )
      )
    )
  );

CREATE POLICY student_read_lesson_assignments ON lesson_assignments FOR SELECT
  USING (
    public.user_role() = 'student'
    AND class_id IN (SELECT class_id FROM class_students WHERE student_id = auth.uid())
  );

CREATE POLICY student_read_own_attendance ON attendance FOR SELECT
  USING (public.user_role() = 'student' AND student_id = auth.uid());

CREATE POLICY student_read_own_submissions ON submissions FOR SELECT
  USING (public.user_role() = 'student' AND student_id = auth.uid());

CREATE POLICY student_insert_submissions ON submissions FOR INSERT
  WITH CHECK (
    public.user_role() = 'student'
    AND student_id = auth.uid()
    AND class_id IN (SELECT class_id FROM class_students WHERE student_id = auth.uid())
  );

CREATE POLICY student_read_own_progress ON student_progress FOR SELECT
  USING (public.user_role() = 'student' AND student_id = auth.uid());

CREATE POLICY student_update_own_progress ON student_progress FOR UPDATE
  USING (public.user_role() = 'student' AND student_id = auth.uid());

CREATE POLICY student_insert_own_progress ON student_progress FOR INSERT
  WITH CHECK (public.user_role() = 'student' AND student_id = auth.uid());

CREATE POLICY student_read_badges ON badges FOR SELECT
  USING (public.user_role() = 'student');

CREATE POLICY student_read_own_badges ON student_badges FOR SELECT
  USING (public.user_role() = 'student' AND student_id = auth.uid());

CREATE POLICY student_read_own_certificates ON certificates FOR SELECT
  USING (public.user_role() = 'student' AND student_id = auth.uid());

-- ============================================================
-- RLS POLICIES: Notifications (own only)
-- ============================================================
CREATE POLICY notifications_read_own ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY notifications_update_own ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKETS (run via Supabase dashboard or supabase CLI)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-media', 'lesson-media', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false);
