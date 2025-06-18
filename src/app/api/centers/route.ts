import { NextRequest, NextResponse } from 'next/server';
import { centerService } from '@/lib/database';

export async function GET() {
  try {
    const centers = await centerService.getAllCenters();
    return NextResponse.json(centers);
  } catch (error) {
    console.error('Error fetching centers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch centers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const center = await centerService.createCenter(body);
    return NextResponse.json(center, { status: 201 });
  } catch (error) {
    console.error('Error creating center:', error);
    return NextResponse.json(
      { error: 'Failed to create center' },
      { status: 500 }
    );
  }
} 