import { NextRequest, NextResponse } from 'next/server';
import { resultService } from '@/lib/database';

export async function GET() {
  try {
    const results = await resultService.getAllResults();
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await resultService.createResult(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating result:', error);
    return NextResponse.json(
      { error: 'Failed to create result' },
      { status: 500 }
    );
  }
} 