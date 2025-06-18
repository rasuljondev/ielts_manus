# Project Todo

## Phase 1: Project Setup and Initial Configuration
- [x] Create Next.js project with TypeScript, Tailwind CSS, ESLint, App Router, and src directory.
- [x] Install Framer Motion.
- [ ] Create `todo.md` file.

## Phase 2: Implement UI/UX Design and Core Components
- [x] Configure Tailwind CSS for custom colors (Cyan and Blue tones).
- [x] Implement global CSS for smooth transitions and page fades.
- [x] Create `layout.tsx` for common UI elements and animations.
- [x] Develop core components (e.g., buttons, input fields) with Framer Motion animations.

## Phase 3: Develop Mock Authentication and Routing
- [x] Create `/login` page with mock credentials.
- [x] Implement mock authentication logic to redirect based on user role.
- [x] Create `/signup` page for users with specified fields.
- [x] Implement mock signup logic.
- [x] Set up Next.js App Router for all specified routes.

## Phase 4: Create Static Data Mocks
- [x] Create `/data` directory.
- [x] Create `users.json` with mock user data (SuperAdmin, EduAdmin, User).
- [x] Create `centers.json` with mock education center data.
- [x] Create `tests.json` with mock test data.
- [x] Create `results.json` with mock test results.
- [x] Create `assignments.json` with mock test assignments.

## Phase 5: Implement Role-Based Dashboards and Features
- [x] Develop `/dashboard/user` with assigned tests list, start/resume test functionality, and result history.
- [x] Implement timer per section for tests.
- [x] Develop `/dashboard/eduadmin` with student list, test creation form, test assignment, and result review/modification.
- [x] Develop `/dashboard/superadmin` with EduAdmin management, center overview, and read-only test templates.

## Phase 6: Build Mock Test Interface
- [x] Create `/test/start/[testId]` for the mock test interface.
- [x] Implement different question types (MCQ, fill-the-gap, T/F/NG, short answer).
- [x] Implement review page before submission.
- [x] Implement auto-submit when time ends.
- [x] Create `/test/review/[testId]` and `/test/result/[testId]` pages.

## Phase 7: Package Project and Provide Instructions
- [ ] Create a `README.md` file with instructions on how to run the project locally.
- [ ] Zip the entire project folder.

## Phase 8: Deliver Final Project to User
- [ ] Send the zipped project folder to the user.

