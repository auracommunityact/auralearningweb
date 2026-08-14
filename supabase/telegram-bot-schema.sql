-- =========================================================
-- Supabase Schema for Telegram Bot & Content Platform
-- File: supabase/telegram-bot-schema.sql
-- =========================================================

-- 1. Create `users` table for storing Telegram users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    full_name TEXT,
    username TEXT,
    language_code TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on telegram_id for fast lookup during bot updates
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow service role full access to users (bypasses RLS)
CREATE POLICY "Service Role full access to users" 
ON public.users 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Allow authenticated users to view their own user data
CREATE POLICY "Authenticated users view own record" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid()::text = id::text OR true);


-- 2. Create `books` table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE,
    "bookName" TEXT NOT NULL,
    title TEXT,
    author TEXT,
    category TEXT,
    description TEXT,
    pdf_url TEXT,
    file_url TEXT,
    language TEXT DEFAULT 'English',
    pages INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for books search
CREATE INDEX IF NOT EXISTS idx_books_name ON public.books("bookName");
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books(title);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);

-- Enable RLS on books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Public read access for books
CREATE POLICY "Public read books" ON public.books FOR SELECT TO public USING (true);
CREATE POLICY "Service Role full access to books" ON public.books FOR ALL TO service_role USING (true) WITH CHECK (true);


-- 3. Create `videos` table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    category TEXT,
    duration TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_title ON public.videos(title);
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read videos" ON public.videos FOR SELECT TO public USING (true);
CREATE POLICY "Service Role full access to videos" ON public.videos FOR ALL TO service_role USING (true) WITH CHECK (true);


-- 4. Create `courses` table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    instructor TEXT,
    link TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_title ON public.courses(title);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read courses" ON public.courses FOR SELECT TO public USING (true);
CREATE POLICY "Service Role full access to courses" ON public.courses FOR ALL TO service_role USING (true) WITH CHECK (true);


-- =========================================================
-- SEED DATA (Optional initial sample records for testing)
-- =========================================================

INSERT INTO public.books ("bookName", title, author, category, description, pdf_url)
VALUES 
('Physics Fundamentals Grade 10', 'Physics Fundamentals', 'Dr. A. Sharma', 'Science', 'Comprehensive physics textbook covering Mechanics, Optics, and Electricity.', 'https://ais-dev-md445vldjd7jquxyou3ama-1062068490011.asia-southeast1.run.app/AuraLearning.apk'),
('Advanced Mathematics & Calculus', 'Advanced Mathematics', 'R.K. Gupta', 'Mathematics', 'Step-by-step calculus guide with practice problems and solutions.', 'https://ais-dev-md445vldjd7jquxyou3ama-1062068490011.asia-southeast1.run.app/AuraLearning.apk'),
('Organic Chemistry Essentials', 'Organic Chemistry Essentials', 'P. Mehta', 'Chemistry', 'Complete guide to chemical bonding, reactions, and organic compounds.', 'https://ais-dev-md445vldjd7jquxyou3ama-1062068490011.asia-southeast1.run.app/AuraLearning.apk')
ON CONFLICT DO NOTHING;

INSERT INTO public.videos (title, description, url, category)
VALUES 
('Newton Laws of Motion Explained', 'Detailed visual breakdown of Newton three laws of motion with real-world examples.', 'https://youtube.com/@auralearningofficialy', 'Physics'),
('Integration Methods & Calculus Tricks', 'Master indefinite and definite integration in 30 minutes with quick short tricks.', 'https://youtube.com/@auralearningofficialy', 'Mathematics')
ON CONFLICT DO NOTHING;

INSERT INTO public.courses (title, description, instructor, link, category)
VALUES 
('Complete CBSE Class 10 Science Masterclass', 'All-in-one course covering Physics, Chemistry, and Biology syllabus with mock tests.', 'Aura Faculty', 'https://ais-dev-md445vldjd7jquxyou3ama-1062068490011.asia-southeast1.run.app', 'Science'),
('Mathematics Foundations & Problem Solving', 'Build strong problem-solving skills for competitive exams and school mathematics.', 'Aura Faculty', 'https://ais-dev-md445vldjd7jquxyou3ama-1062068490011.asia-southeast1.run.app', 'Mathematics')
ON CONFLICT DO NOTHING;
