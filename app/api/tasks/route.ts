import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const targetDate = new Date(dateStr);

  try {
    const segments = await prisma.segment.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: {
        tasks: {
          where: { userId },
          orderBy: { order: 'asc' },
          include: {
            logs: {
              where: {
                date: {
                  gte: new Date(targetDate.setHours(0, 0, 0, 0)),
                  lte: new Date(targetDate.setHours(23, 59, 59, 999)),
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(segments);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { taskId, date, completed } = await request.json();
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        taskId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingLog) {
      const updatedLog = await prisma.dailyLog.update({
        where: { id: existingLog.id },
        data: { completed },
      });
      return NextResponse.json(updatedLog);
    } else {
      const newLog = await prisma.dailyLog.create({
        data: {
          taskId,
          date: startOfDay,
          completed,
        },
      });
      return NextResponse.json(newLog);
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 });
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
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
  }

  try {
    await prisma.task.deleteMany({
      where: { id, userId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
