import { NextRequest, NextResponse } from 'next/server';
import { assignedTestService } from '@/lib/database';

export async function GET() {
  try {
    const assignedTests = await assignedTestService.getAllAssignedTests();
    return NextResponse.json(assignedTests);
  } catch (error) {
    console.error('Error fetching assigned tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned tests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const assignedTest = await assignedTestService.assignTest(body);
    return NextResponse.json(assignedTest, { status: 201 });
  } catch (error) {
    console.error('Error assigning test:', error);
    return NextResponse.json(
      { error: 'Failed to assign test' },
      { status: 500 }
    );
  }
} 