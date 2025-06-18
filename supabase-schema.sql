-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create education_centers table
CREATE TABLE education_centers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('superadmin', 'eduadmin', 'user')) NOT NULL,
    center_id UUID REFERENCES education_centers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create tests table
CREATE TABLE tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) NOT NULL,
    center_id UUID REFERENCES education_centers(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create questions table
CREATE TABLE questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('mcq', 'gap', 'tf', 'short')) NOT NULL,
    question TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    section VARCHAR(20) CHECK (section IN ('reading', 'listening', 'writing')) NOT NULL,
    order_index INTEGER NOT NULL,
    points INTEGER DEFAULT 1
);

-- Create assigned_tests table
CREATE TABLE assigned_tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    test_id UUID REFERENCES tests(id) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('assigned', 'in_progress', 'completed', 'confirmed')) DEFAULT 'assigned',
    score DECIMAL(5,2),
    confirmed_by_admin UUID REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create answers table
CREATE TABLE answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assigned_test_id UUID REFERENCES assigned_tests(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_center_id ON users(center_id);
CREATE INDEX idx_tests_created_by ON tests(created_by);
CREATE INDEX idx_tests_center_id ON tests(center_id);
CREATE INDEX idx_tests_is_active ON tests(is_active);
CREATE INDEX idx_questions_test_id ON questions(test_id);
CREATE INDEX idx_questions_section ON questions(section);
CREATE INDEX idx_assigned_tests_user_id ON assigned_tests(user_id);
CREATE INDEX idx_assigned_tests_test_id ON assigned_tests(test_id);
CREATE INDEX idx_assigned_tests_status ON assigned_tests(status);
CREATE INDEX idx_answers_assigned_test_id ON answers(assigned_test_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Enable Row Level Security (RLS)
ALTER TABLE education_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Education centers: Anyone can view, only superadmins can manage
CREATE POLICY "Anyone can view education centers" ON education_centers
    FOR SELECT USING (true);

CREATE POLICY "Only superadmins can manage education centers" ON education_centers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

-- Users: Users can view their own data, admins can view/manage based on role
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Superadmins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Eduadmins can view users in their center" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u1 
            WHERE u1.user_id = auth.uid() 
            AND u1.role = 'eduadmin' 
            AND u1.center_id = users.center_id
        )
    );

CREATE POLICY "Superadmins can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Eduadmins can manage users in their center" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u1 
            WHERE u1.user_id = auth.uid() 
            AND u1.role = 'eduadmin' 
            AND u1.center_id = users.center_id
        )
    );

-- Tests: Users can view assigned tests, admins can manage based on role
CREATE POLICY "Users can view assigned tests" ON tests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assigned_tests at
            JOIN users u ON at.user_id = u.id
            WHERE u.user_id = auth.uid() AND at.test_id = tests.id
        )
    );

CREATE POLICY "Superadmins can manage all tests" ON tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Eduadmins can manage tests in their center" ON tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() 
            AND role = 'eduadmin' 
            AND center_id = tests.center_id
        )
    );

-- Questions: Users can view questions for assigned tests, admins can manage
CREATE POLICY "Users can view questions for assigned tests" ON questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assigned_tests at
            JOIN users u ON at.user_id = u.id
            WHERE u.user_id = auth.uid() AND at.test_id = questions.test_id
        )
    );

CREATE POLICY "Superadmins can manage all questions" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Eduadmins can manage questions in their center" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tests t
            JOIN users u ON t.center_id = u.center_id
            WHERE u.user_id = auth.uid() 
            AND u.role = 'eduadmin' 
            AND t.id = questions.test_id
        )
    );

-- Assigned tests: Users can view their own, admins can manage based on role
CREATE POLICY "Users can view own assigned tests" ON assigned_tests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND id = assigned_tests.user_id
        )
    );

CREATE POLICY "Users can update own assigned tests" ON assigned_tests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND id = assigned_tests.user_id
        )
    );

CREATE POLICY "Superadmins can manage all assigned tests" ON assigned_tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Eduadmins can manage assigned tests in their center" ON assigned_tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u1
            JOIN users u2 ON u1.center_id = u2.center_id
            WHERE u1.user_id = auth.uid() 
            AND u1.role = 'eduadmin' 
            AND u2.id = assigned_tests.user_id
        )
    );

-- Answers: Users can view their own answers, admins can view based on role
CREATE POLICY "Users can view own answers" ON answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assigned_tests at
            JOIN users u ON at.user_id = u.id
            WHERE u.user_id = auth.uid() AND at.id = answers.assigned_test_id
        )
    );

CREATE POLICY "Users can insert own answers" ON answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM assigned_tests at
            JOIN users u ON at.user_id = u.id
            WHERE u.user_id = auth.uid() AND at.id = answers.assigned_test_id
        )
    );

CREATE POLICY "Superadmins can view all answers" ON answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Eduadmins can view answers in their center" ON answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assigned_tests at
            JOIN users u1 ON at.user_id = u1.id
            JOIN users u2 ON u1.center_id = u2.center_id
            WHERE u2.user_id = auth.uid() 
            AND u2.role = 'eduadmin' 
            AND at.id = answers.assigned_test_id
        )
    );

-- Insert sample data
INSERT INTO education_centers (id, name, location, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Cambridge English Center', 'Cambridge, UK', '2024-01-01T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440002', 'Oxford Language Institute', 'Oxford, UK', '2024-01-01T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440003', 'British Council', 'London, UK', '2024-01-01T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440004', 'IDP Education', 'Sydney, Australia', '2024-01-01T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440005', 'IELTS Academy', 'Toronto, Canada', '2024-01-01T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440006', 'Global English Center', 'New York, USA', '2024-01-01T00:00:00Z');

-- Note: Users will be created through Supabase Auth + profile extension
-- Tests and other data will be created through the application 