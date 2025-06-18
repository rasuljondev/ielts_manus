import { NextRequest, NextResponse } from 'next/server';
import { answerService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignedTestId = searchParams.get('assignedTestId');
    
    if (!assignedTestId) {
      return NextResponse.json(
        { error: 'assignedTestId is required' },
        { status: 400 }
      );
    }

    const answers = await answerService.getAnswersByAssignedTest(assignedTestId);
    return NextResponse.json(answers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch answers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const answer = await answerService.submitAnswer(body);
    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
} 