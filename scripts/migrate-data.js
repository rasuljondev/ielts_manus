const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // Read JSON files
    const dataDir = path.join(__dirname, '..', 'data');
    
    // Migrate education centers
    const centersData = JSON.parse(fs.readFileSync(path.join(dataDir, 'centers.json'), 'utf8'));
    console.log('Migrating education centers...');
    for (const center of centersData) {
      const { error } = await supabase
        .from('education_centers')
        .upsert({
          id: center.id,
          name: center.name,
          location: center.location,
          students_count: center.studentsCount,
          tests_completed: center.testsCompleted,
          created_at: center.createdAt
        });
      
      if (error) {
        console.error('Error migrating center:', center.name, error);
      }
    }

    // Migrate users
    const usersData = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8'));
    console.log('Migrating users...');
    for (const user of usersData) {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          education_center_id: user.educationCenter || null,
          created_at: user.createdAt
        });
      
      if (error) {
        console.error('Error migrating user:', user.name, error);
      }
    }

    // Migrate tests
    const testsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'tests.json'), 'utf8'));
    console.log('Migrating tests...');
    for (const test of testsData) {
      const { error } = await supabase
        .from('tests')
        .upsert({
          id: test.id,
          title: test.title,
          description: test.description,
          type: test.type,
          sections: test.sections,
          total_duration: test.totalDuration,
          total_questions: test.totalQuestions,
          created_by: test.createdBy,
          created_at: test.createdAt,
          is_active: test.isActive
        });
      
      if (error) {
        console.error('Error migrating test:', test.title, error);
      }
    }

    // Migrate results
    const resultsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'results.json'), 'utf8'));
    console.log('Migrating test results...');
    for (const result of resultsData) {
      const { error } = await supabase
        .from('test_results')
        .upsert({
          id: result.id,
          user_id: result.userId,
          test_id: result.testId,
          status: result.status,
          started_at: result.startedAt,
          completed_at: result.completedAt,
          scores: result.scores,
          section_results: result.sectionResults,
          feedback: result.feedback,
          confirmed_by: result.confirmedBy,
          confirmed_at: result.confirmedAt,
          current_section: result.currentSection,
          assigned_at: result.assignedAt
        });
      
      if (error) {
        console.error('Error migrating result:', result.id, error);
      }
    }

    // Migrate assignments
    const assignmentsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'assignments.json'), 'utf8'));
    console.log('Migrating assignments...');
    for (const assignment of assignmentsData) {
      const { error } = await supabase
        .from('assignments')
        .upsert({
          id: assignment.id,
          user_id: assignment.userId,
          test_id: assignment.testId,
          assigned_by: assignment.assignedBy,
          assigned_at: assignment.assignedAt,
          due_date: assignment.dueDate,
          status: assignment.status
        });
      
      if (error) {
        console.error('Error migrating assignment:', assignment.id, error);
      }
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData(); 