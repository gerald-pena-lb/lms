-- ============================================================
-- LMS Seed Data for Development
-- ============================================================
-- NOTE: This seed file inserts directly into tables.
-- Auth users must be created via Supabase Auth API or dashboard.
-- After creating auth users, update the UUIDs below to match.
-- ============================================================

-- Schools
INSERT INTO schools (id, name, code, address) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Partner School Alpha', 'PSA', '123 Education Lane, Bangkok 10100'),
  ('a0000000-0000-0000-0000-000000000002', 'Partner School Beta', 'PSB', '456 Learning Road, Chiang Mai 50200');

-- Profiles (placeholder UUIDs — replace with actual auth.users IDs)
-- Admin
INSERT INTO profiles (id, full_name, email, role, school_id, is_active, onboarded_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Admin User', 'admin@lms.dev', 'admin', NULL, true, now());

-- Supervisor
INSERT INTO profiles (id, full_name, email, role, school_id, is_active, onboarded_at) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'Supervisor User', 'supervisor@lms.dev', 'supervisor', 'a0000000-0000-0000-0000-000000000001', true, now());

-- Teacher
INSERT INTO profiles (id, full_name, email, role, school_id, is_active, onboarded_at) VALUES
  ('b0000000-0000-0000-0000-000000000003', 'Teacher User', 'teacher@lms.dev', 'teacher', 'a0000000-0000-0000-0000-000000000001', true, now());

-- Student
INSERT INTO profiles (id, full_name, email, role, school_id, is_active, onboarded_at) VALUES
  ('b0000000-0000-0000-0000-000000000004', 'Student User', 'student@lms.dev', 'student', 'a0000000-0000-0000-0000-000000000001', true, now());

-- Course
INSERT INTO courses (id, title, description, level, status, created_by, school_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Creative Media Foundations', 'An introductory course to creative media concepts and tools.', 'Level 1', 'published', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001');

-- Modules
INSERT INTO modules (id, course_id, title, description, sort_order, status) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Module 1: What is Media?', 'Understanding the concept of media in our daily lives.', 1, 'published'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Module 2: Types of Media', 'Exploring different types of media including print, digital, and broadcast.', 2, 'published');

-- Lessons
INSERT INTO lessons (id, module_id, title, description, content_json, teacher_notes, timing_guide, sort_order, status) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Media Around Us', 'Identifying media in our everyday environment.', '{"blocks": [{"type": "text", "content": "Media is everywhere around us. From the signs we read to the videos we watch, media shapes how we understand the world."}]}', 'Start with a discussion about what students noticed on their way to school.', '15 minutes intro, 20 minutes activity, 10 minutes wrap-up', 1, 'published'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Why Media Matters', 'Understanding the impact of media on society.', '{"blocks": [{"type": "text", "content": "Media influences our opinions, decisions, and understanding of the world."}]}', 'Use local examples that students can relate to.', '10 minutes intro, 25 minutes activity, 10 minutes reflection', 2, 'published'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'Print Media', 'Newspapers, magazines, posters, and more.', '{"blocks": [{"type": "text", "content": "Print media has been one of the oldest forms of mass communication."}]}', 'Bring sample newspapers and magazines to class.', '15 minutes intro, 20 minutes hands-on, 10 minutes discussion', 1, 'published'),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'Digital Media', 'Websites, social media, apps, and digital content.', '{"blocks": [{"type": "text", "content": "Digital media has transformed how we create, share, and consume information."}]}', 'Discuss responsible digital media usage.', '10 minutes intro, 30 minutes interactive activity, 5 minutes summary', 2, 'published');

-- Activities
INSERT INTO activities (id, lesson_id, title, type, config_json, sort_order, points, time_limit_seconds) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Media Around Us Quiz', 'quiz', '{"questions": [{"question": "Which of these is an example of media?", "options": ["A newspaper", "A rock", "A shoe", "A pencil"], "correct": 0}, {"question": "What is the main purpose of media?", "options": ["Entertainment only", "Communication and information", "Making money", "Wasting time"], "correct": 1}]}', 1, 10, 300),
  ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Match Media Types', 'matching', '{"pairs": [{"left": "Newspaper", "right": "Print Media"}, {"left": "YouTube", "right": "Digital Media"}, {"left": "Radio", "right": "Broadcast Media"}, {"left": "Billboard", "right": "Outdoor Media"}]}', 2, 10, 180),
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 'Media Impact Discussion', 'discussion_prompt', '{"prompt": "Think of one way media has influenced your life this week. Share your experience and explain whether the influence was positive or negative."}', 1, 5, null),
  ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000003', 'Print Media Flashcards', 'flashcards', '{"cards": [{"front": "Newspaper", "back": "A daily or weekly publication containing news, articles, and advertisements."}, {"front": "Magazine", "back": "A periodical publication with articles, photographs, and advertisements."}, {"front": "Poster", "back": "A large printed picture or notice used for decoration or advertising."}]}', 1, 5, null),
  ('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000004', 'Digital Media Fill-in-the-Blank', 'fill_in_blank', '{"sentences": [{"text": "A ___ is a website where people share short updates and photos.", "answer": "social media platform"}, {"text": "Digital media can be shared ___ across the world.", "answer": "instantly"}]}', 1, 10, 240);

-- Class
INSERT INTO classes (id, name, course_id, school_id, grade_level, academic_year) VALUES
  ('g0000000-0000-0000-0000-000000000001', 'Level 1 - Section A', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Level 1', '2025-2026');

-- Enroll teacher and student
INSERT INTO class_teachers (class_id, teacher_id) VALUES
  ('g0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003');

INSERT INTO class_students (class_id, student_id) VALUES
  ('g0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004');

-- Assign lessons to class
INSERT INTO lesson_assignments (lesson_id, class_id, assigned_by) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000002', 'g0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000003', 'g0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000004', 'g0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002');

-- Badges
INSERT INTO badges (id, name, description, criteria_json) VALUES
  ('h0000000-0000-0000-0000-000000000001', 'First Steps', 'Completed your first lesson!', '{"type": "lessons_completed", "count": 1}'),
  ('h0000000-0000-0000-0000-000000000002', 'Quiz Master', 'Scored 100% on a quiz!', '{"type": "perfect_quiz_score", "count": 1}'),
  ('h0000000-0000-0000-0000-000000000003', 'Consistent Learner', 'Completed 5 lessons in a row.', '{"type": "lessons_completed", "count": 5}');
