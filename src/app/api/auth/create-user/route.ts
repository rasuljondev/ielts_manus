import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { userService, centerService } from '@/lib/database';

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create admin database client for bypassing RLS
const supabaseAdminDB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, centerName, centerLocation } = body;

    // Validate required fields
    if (!email || !password || !centerName || !centerLocation) {
      return NextResponse.json(
        { error: 'Email, password, center name, and location are required' },
        { status: 400 }
      );
    }

    // Create education center using admin client to bypass RLS
    const { data: center, error: centerError } = await supabaseAdminDB
      .from('education_centers')
      .insert([{
        name: centerName,
        location: centerLocation,
      }])
      .select()
      .single();

    if (centerError) {
      console.error('Center creation error:', centerError);
      return NextResponse.json(
        { error: 'Failed to create education center' },
        { status: 500 }
      );
    }

    // Create user in Supabase Auth with admin privileges
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin-created accounts
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user profile using admin client to bypass RLS
    const { data: userProfile, error: userError } = await supabaseAdminDB
      .from('users')
      .insert([{
        user_id: authData.user.id,
        name: centerName, // Use center name as initial name
        phone: '', // Will be filled when user logs in
        role: 'eduadmin',
        center_id: center.id,
        email: email // Store email in profile
      }])
      .select()
      .single();

    if (userError) {
      console.error('User profile creation error:', userError);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Send welcome email (optional - you can implement this later)
    // await sendWelcomeEmail(email, centerName, password);

    return NextResponse.json({
      success: true,
      user: {
        ...userProfile,
        email: email,
        centerName: centerName
      },
      center: center,
      message: 'Education center and EduAdmin account created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating education center:', error);
    return NextResponse.json(
      { error: 'Failed to create education center' },
      { status: 500 }
    );
  }
} 