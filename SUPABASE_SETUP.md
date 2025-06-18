# Supabase Setup Guide for IELTS Platform

This guide will help you set up Supabase for your IELTS platform to make it dynamic instead of using static JSON files.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Your IELTS platform project

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `ielts-platform` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Replace the placeholder values with your actual Supabase credentials

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `supabase-schema.sql` file
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

This will create:
- All necessary tables (users, education_centers, tests, questions, assigned_tests, answers)
- Indexes for better performance
- Row Level Security (RLS) policies
- Sample education centers data

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following settings:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/login`
   - **Enable email confirmations**: Set to `false` for development (or `true` for production)
   - **Enable email change confirmations**: Set to `false` for development

## Step 6: Create Initial SuperAdmin User

**IMPORTANT**: SuperAdmin accounts can ONLY be created manually through:
- Supabase SQL script
- Supabase Dashboard
- Never through signup page or frontend UI

1. In your Supabase dashboard, go to **Authentication** → **Users**
2. Click "Add user"
3. Create a user with:
   - **Email**: `superadmin@gmail.com`
   - **Password**: `12345678`
   - **Email confirmed**: `true`
4. After creating the user, go to **SQL Editor** and run:

```sql
-- Insert SuperAdmin profile
INSERT INTO users (user_id, name, phone, role, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'superadmin@gmail.com'),
  'Super Administrator',
  '+1234567890',
  'superadmin',
  NOW()
);
```

## Step 7: Role Creation Logic

### SuperAdmin Creation:
- ✅ **ONLY** via Supabase SQL script or Dashboard
- ❌ **NEVER** via signup page or frontend UI
- ❌ **NEVER** via API endpoints

### EduAdmin Creation:
- ✅ **ONLY** by SuperAdmin through admin dashboard
- ✅ Requires: name, email, phone, center_id
- ✅ Uses temporary password flow
- ✅ Email auto-confirmed for admin-created accounts

### User Creation:
- ✅ **ONLY** through signup page
- ✅ User selects education center during signup
- ✅ Role automatically set to 'user'
- ✅ Email verification required (configurable)

## Step 8: Install Dependencies

Run the following command in your project directory:

```bash
npm install @supabase/supabase-js
```

## Step 9: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Visit your application and test the following:
   - Login with SuperAdmin credentials
   - User signup functionality
   - Role-based access control
   - Dashboard access based on roles

## Database Schema Overview

### Tables Created:

1. **education_centers** - Educational institutions
2. **users** - User profiles (extends Supabase auth.users)
3. **tests** - IELTS test definitions
4. **questions** - Individual test questions
5. **assigned_tests** - Test assignments to users
6. **answers** - User answers to questions

### Key Features:

- **Supabase Auth Integration** - Email/password authentication
- **Row Level Security (RLS)** - Users can only access data they're authorized to see
- **Role-based Access Control** - SuperAdmin, EduAdmin, User roles
- **Center-based Restrictions** - EduAdmins can only manage their center
- **UUID Primary Keys** - Secure, unique identifiers
- **JSONB Fields** - Flexible storage for question options
- **Foreign Key Relationships** - Maintains data integrity
- **Indexes** - Optimized for common queries

## Authentication Flow

### User Signup (Users only):
1. User visits `/signup`
2. Fills in: email, password, name, phone, education center
3. Account created in Supabase Auth
4. Profile created in `users` table with role='user'
5. Email verification sent (if enabled)

### User Login:
1. User visits `/login`
2. Enters email/password
3. Supabase Auth validates credentials
4. User profile loaded from `users` table
5. Redirected to appropriate dashboard based on role

### Admin Creation:
- **SuperAdmins**: Created manually in Supabase dashboard
- **EduAdmins**: Created by SuperAdmin through admin interface
- **Users**: Can sign up through signup page

## Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Role-based access control with RLS
- **Data Protection**: Users only see their own data
- **Input Validation**: Database constraints prevent invalid data
- **Center Isolation**: EduAdmins restricted to their center

## API Endpoints

The following API endpoints are now available:

- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create a new user (admin only)
- `GET /api/tests` - Get all tests
- `POST /api/tests` - Create a new test (admin only)
- `GET /api/centers` - Get all education centers
- `POST /api/centers` - Create a new center (superadmin only)
- `GET /api/assigned-tests` - Get assigned tests
- `POST /api/assigned-tests` - Assign a test to user
- `GET /api/answers` - Get answers for assigned test
- `POST /api/answers` - Submit an answer

## Role Permissions

### SuperAdmin:
- Manage all education centers
- Create/manage all users (SuperAdmin, EduAdmin, User)
- Create/manage all tests
- View all data

### EduAdmin:
- Manage users in their education center only
- Create/manage tests for their center
- Assign tests to users in their center
- Review and confirm test results

### User:
- View assigned tests
- Take tests
- View their own results (once confirmed)
- Update their profile

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**
   - Make sure your `.env.local` file is in the project root
   - Restart your development server after adding environment variables

2. **Database Connection Errors**
   - Verify your Supabase URL and key are correct
   - Check that your Supabase project is active

3. **Authentication Errors**
   - Ensure email confirmations are disabled for development
   - Check that the user exists in both auth.users and users tables

4. **RLS Policy Errors**
   - Make sure you're authenticated
   - Check that your user has the appropriate role
   - Verify center_id matches for EduAdmin restrictions

### Getting Help:

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Supabase JavaScript client docs](https://supabase.com/docs/reference/javascript)
- Check the console for detailed error messages

## Next Steps

After setting up Supabase, you can:

1. **Add Real-time Features**: Use Supabase's real-time subscriptions
2. **Add File Storage**: Use Supabase Storage for test materials
3. **Add Email Notifications**: Use Supabase Edge Functions
4. **Add Analytics**: Track user behavior and test performance
5. **Scale**: Supabase automatically scales with your needs

Your IELTS platform is now fully dynamic with authentication and ready for production use! 