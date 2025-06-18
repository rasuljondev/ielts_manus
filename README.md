# IELTS Platform - Mock Exam System

A comprehensive IELTS mock exam platform built with Next.js, TypeScript, and Tailwind CSS. This platform supports three user roles: SuperAdmin, EduAdmin, and User (Student), with complete mock authentication and static data simulation.

## 🚀 Features

### Multi-Role System
- **SuperAdmin**: Platform management, EduAdmin creation, center oversight
- **EduAdmin**: Student management, test creation, result review
- **User/Student**: Take tests, view results, track progress

### Modern UI/UX
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Cyan and Blue color palette
- Mobile-optimized dashboards and test interface

### Comprehensive Test System
- Full IELTS-style mock exams (Reading, Listening, Writing)
- Multiple question types: MCQ, True/False/Not Given, Fill-in-blank, Writing tasks
- Timer per section with auto-submit
- Fullscreen test mode (Inspera-style)
- Review page before submission
- Detailed result analytics

### Mock Data & Authentication
- Static JSON data files for all entities
- Mock authentication with role-based routing
- Session persistence with localStorage
- Test progress saving and resumption

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (comes with Node.js)

## 🛠️ Installation & Setup

1. **Extract the project files**
   ```bash
   unzip ielts-platform.zip
   cd ielts-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Credentials

Use these credentials to test different user roles:

### SuperAdmin
- **Email**: `superadmin@gmail.com`
- **Password**: `12345678`
- **Access**: Platform management, EduAdmin creation, center overview

### EduAdmin
- **Email**: `eduadmin@gmail.com`
- **Password**: `12345678`
- **Access**: Student management, test creation, result review

### Student/User
- **Email**: `user@gmail.com`
- **Password**: `12345678`
- **Access**: Take tests, view results, track progress

## 📁 Project Structure

```
ielts-platform/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Role-based dashboards
│   │   │   ├── user/          # Student dashboard
│   │   │   ├── eduadmin/      # EduAdmin dashboard
│   │   │   └── superadmin/    # SuperAdmin dashboard
│   │   ├── test/              # Test-related pages
│   │   │   ├── start/[testId] # Test interface
│   │   │   └── result/[testId]# Test results
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── page.tsx           # Home page
│   └── components/            # Reusable components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── InputField.tsx
│       └── PageTransition.tsx
├── data/                      # Mock data files
│   ├── users.json            # User accounts
│   ├── centers.json          # Education centers
│   ├── tests.json            # Test templates
│   ├── results.json          # Test results
│   ├── assignments.json      # Test assignments
│   └── questions.json        # Sample questions
├── public/                   # Static assets
└── package.json             # Dependencies and scripts
```

## 🎯 Key Features Walkthrough

### 1. Authentication System
- Mock authentication with role-based redirection
- Session persistence using localStorage
- Signup available only for students
- Pre-created admin accounts

### 2. Student Dashboard
- View assigned tests with status indicators
- Start/resume tests with progress saving
- Comprehensive result history
- Performance analytics

### 3. EduAdmin Dashboard
- Manage students from their education center
- Create and assign IELTS-style tests
- Review and confirm test results
- Student performance tracking

### 4. SuperAdmin Dashboard
- Platform-wide analytics and statistics
- Create and manage EduAdmins
- Education center oversight
- Read-only access to all test templates

### 5. Test Interface
- Fullscreen mode for distraction-free testing
- Section-based timer with auto-submit
- Multiple question types support
- Review page before final submission
- Progress saving for test resumption

### 6. Results & Analytics
- Detailed score breakdown by section
- Performance analysis with strengths/weaknesses
- Instructor feedback system
- Visual score representation

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📊 Mock Data Overview

The platform includes comprehensive mock data:

- **6 Education Centers** across different locations
- **7 Users** with different roles and affiliations
- **5 Test Templates** with various types and sections
- **5 Test Results** with different completion statuses
- **7 Test Assignments** linking users to tests
- **Sample Questions** covering all IELTS question types

## 🎨 Design System

### Colors
- **Primary**: Cyan tones (#06b6d4 to #164e63)
- **Secondary**: Blue tones (#3b82f6 to #1e3a8a)
- **Gradients**: Used for headings and buttons

### Animations
- Page transitions with Framer Motion
- Hover effects on interactive elements
- Loading states and micro-interactions
- Smooth scaling and fade animations

### Typography
- Inter font family for clean readability
- Responsive text sizing
- Proper contrast ratios for accessibility

## 🔮 Future Integration Notes

This project is designed for easy Supabase integration:

1. **Database Schema**: Mock data structure matches typical database relationships
2. **API Endpoints**: Replace fetch calls to JSON files with Supabase queries
3. **Authentication**: Replace localStorage with Supabase Auth
4. **Real-time Features**: Add real-time updates for test assignments and results

### Suggested Supabase Tables
- `users` - User accounts and profiles
- `education_centers` - Center information
- `tests` - Test templates and configurations
- `test_sessions` - Active test sessions
- `results` - Completed test results
- `assignments` - Test assignments to users
- `questions` - Question bank with metadata

## 🐛 Known Limitations

1. **Static Data**: All data is mock and resets on page refresh
2. **File Upload**: No actual file upload for audio/image questions
3. **Real-time**: No real-time notifications or updates
4. **Email**: No actual email notifications
5. **Audio**: Listening section uses placeholder audio references

## 📞 Support

This is a prototype/demo application. For production use:

1. Integrate with a real database (Supabase recommended)
2. Implement proper authentication and authorization
3. Add file upload capabilities for multimedia questions
4. Set up email notifications
5. Add real-time features for live updates

## 📄 License

This project is created as a demonstration and is not licensed for commercial use without proper backend integration and security implementations.

---

**Note**: This is a static prototype with mock data. All user interactions are simulated and data will not persist between sessions. For production use, integrate with a proper backend service like Supabase.

