import { supabase } from './supabase'
import type { 
  User, 
  EducationCenter, 
  Test, 
  Question, 
  AssignedTest, 
  Answer,
  SignupData,
  CreateTestData,
  AssignTestData
} from './supabase'

// Authentication services
export const authService = {
  async signUp(signupData: SignupData) {
    // IMPORTANT: Only 'user' role can be created through signup
    // SuperAdmin and EduAdmin accounts must be created through admin interface
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
    })

    if (authError) throw authError

    if (authData.user) {
      // Create user profile with role='user' (enforced)
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          user_id: authData.user.id,
          name: signupData.name,
          phone: signupData.phone,
          role: 'user', // Always 'user' for signup
          center_id: signupData.center_id,
        })

      if (profileError) throw profileError
    }

    return authData
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return data
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// User operations
export const userService = {
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getUserByAuthId(authId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authId)
      .single()
    
    if (error) throw error
    return data
  },

  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Education Center operations
export const centerService = {
  async getAllCenters(): Promise<EducationCenter[]> {
    const { data, error } = await supabase
      .from('education_centers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getCenterById(id: string): Promise<EducationCenter | null> {
    const { data, error } = await supabase
      .from('education_centers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createCenter(center: Omit<EducationCenter, 'id' | 'created_at'>): Promise<EducationCenter> {
    const { data, error } = await supabase
      .from('education_centers')
      .insert([center])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateCenter(id: string, updates: Partial<EducationCenter>): Promise<EducationCenter> {
    const { data, error } = await supabase
      .from('education_centers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Test operations
export const testService = {
  async getAllTests(): Promise<Test[]> {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getTestById(id: string): Promise<Test | null> {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getActiveTests(): Promise<Test[]> {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createTest(testData: CreateTestData): Promise<Test> {
    // Start a transaction
    const { data: test, error: testError } = await supabase
      .from('tests')
      .insert([{
        title: testData.title,
        description: testData.description,
        center_id: testData.center_id,
        created_by: (await authService.getCurrentUserProfile())?.id || '',
      }])
      .select()
      .single()
    
    if (testError) throw testError

    // Add questions
    if (testData.questions.length > 0) {
      const questionsWithTestId = testData.questions.map(q => ({
        ...q,
        test_id: test.id
      }))

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsWithTestId)

      if (questionsError) throw questionsError
    }

    return test
  },

  async updateTest(id: string, updates: Partial<Test>): Promise<Test> {
    const { data, error } = await supabase
      .from('tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Question operations
export const questionService = {
  async getQuestionsByTest(testId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', testId)
      .order('order_index', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createQuestion(question: Omit<Question, 'id'>): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert([question])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Assigned Test operations
export const assignedTestService = {
  async getAllAssignedTests(): Promise<AssignedTest[]> {
    const { data, error } = await supabase
      .from('assigned_tests')
      .select('*')
      .order('assigned_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getAssignedTestsByUser(userId: string): Promise<AssignedTest[]> {
    const { data, error } = await supabase
      .from('assigned_tests')
      .select('*')
      .eq('user_id', userId)
      .order('assigned_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getAssignedTestById(id: string): Promise<AssignedTest | null> {
    const { data, error } = await supabase
      .from('assigned_tests')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async assignTest(assignmentData: AssignTestData): Promise<AssignedTest> {
    const { data, error } = await supabase
      .from('assigned_tests')
      .insert([{
        user_id: assignmentData.user_id,
        test_id: assignmentData.test_id,
        status: 'assigned'
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateAssignedTest(id: string, updates: Partial<AssignedTest>): Promise<AssignedTest> {
    const { data, error } = await supabase
      .from('assigned_tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async startTest(assignedTestId: string): Promise<AssignedTest> {
    return this.updateAssignedTest(assignedTestId, {
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
  },

  async submitTest(assignedTestId: string): Promise<AssignedTest> {
    return this.updateAssignedTest(assignedTestId, {
      status: 'completed',
      submitted_at: new Date().toISOString()
    })
  }
}

// Answer operations
export const answerService = {
  async getAnswersByAssignedTest(assignedTestId: string): Promise<Answer[]> {
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('assigned_test_id', assignedTestId)
      .order('answered_at', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async submitAnswer(answer: Omit<Answer, 'id' | 'answered_at'>): Promise<Answer> {
    const { data, error } = await supabase
      .from('answers')
      .insert([answer])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateAnswer(id: string, updates: Partial<Answer>): Promise<Answer> {
    const { data, error } = await supabase
      .from('answers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
} 