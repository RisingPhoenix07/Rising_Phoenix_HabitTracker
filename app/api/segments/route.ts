import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Segment name required' }, { status: 400 });
    }

    const segmentCount = await prisma.segment.count({ where: { userId } });

    const newSegment = await prisma.segment.create({
      data: {
        userId,
        name,
        order: segmentCount,
      },
    });

    return NextResponse.json(newSegment);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to create segment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Segment ID required' }, { status: 400 });
  }

  try {
    await prisma.segment.deleteMany({
      where: { id, userId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to delete segment' }, { status: 500 });
  }
}
