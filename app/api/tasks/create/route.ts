import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { segmentId, title } = await request.json();

    if (!segmentId || !title) {
      return NextResponse.json({ error: 'Segment ID and title are required' }, { status: 400 });
    }

    const taskCount = await prisma.task.count({ where: { segmentId, userId } });

    const newTask = await prisma.task.create({
      data: {
        userId,
        segmentId,
        title,
        order: taskCount,
      },
    });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
