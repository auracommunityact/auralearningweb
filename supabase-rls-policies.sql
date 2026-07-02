-- Supabase RLS Policies for Content Gate

-- 1. Enable RLS on the tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 2. Define the policy for 'books' table
-- This policy allows only authenticated users to SELECT (read) the data.
CREATE POLICY "Allow authenticated users to read books"
ON books
FOR SELECT
TO authenticated
USING (true);

-- 3. Define the policy for 'videos' table
-- This policy allows only authenticated users to SELECT (read) the data.
CREATE POLICY "Allow authenticated users to read videos"
ON videos
FOR SELECT
TO authenticated
USING (true);

-- Note: Guest users (anonymous) will receive an empty array 
-- when trying to fetch from these tables because there is no policy 
-- allowing 'anon' or 'public' roles to SELECT from them.
