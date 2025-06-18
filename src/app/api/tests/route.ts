import { NextRequest, NextResponse } from 'next/server';
import { testService } from '@/lib/database';

export async function GET() {
  try {
    const tests = await testService.getAllTests();
    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const test = await testService.createTest(body);
    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
} 