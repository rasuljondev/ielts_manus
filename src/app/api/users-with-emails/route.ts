import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to access both public and auth tables
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch all user profiles from the users table
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*');

    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Fetch all auth users (to get emails)
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      return NextResponse.json({ error: 'Failed to fetch auth users' }, { status: 500 });
    }

    // Map auth user id to email
    const emailMap = new Map();
    for (const authUser of authUsers.users) {
      emailMap.set(authUser.id, authUser.email);
    }

    // Combine user profile with email
    const usersWithEmails = users.map((user) => ({
      ...user,
      email: emailMap.get(user.user_id) || null,
    }));

    return NextResponse.json(usersWithEmails);
  } catch (error) {
    console.error('Error in users-with-emails API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 