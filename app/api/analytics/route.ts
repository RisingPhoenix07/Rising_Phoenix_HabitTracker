import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userTasks = await prisma.task.findMany({
      where: { userId },
      include: {
        logs: true,
      },
    });

    const totalTasksCount = userTasks.length;
    if (totalTasksCount === 0) {
      return NextResponse.json({
        history: [],
        weeklyAverage: 0,
        currentStreak: 0,
      });
    }

    const history = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      let completedCount = 0;
      userTasks.forEach((task) => {
        const hasCompletedLog = task.logs.some(
          (log) => log.completed && log.date >= dayStart && log.date <= dayEnd
        );
        if (hasCompletedLog) completedCount++;
      });

      const percentage = Math.round((completedCount / totalTasksCount) * 100);
      const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      history.push({ date: dateLabel, percentage });
    }

    const weeklySum = history.reduce((acc, curr) => acc + curr.percentage, 0);
    const weeklyAverage = Math.round(weeklySum / history.length);

    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const hasActivity = userTasks.some((task) =>
        task.logs.some((log) => log.completed && log.date >= dayStart && log.date <= dayEnd)
      );

      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return NextResponse.json({
      history,
      weeklyAverage,
      currentStreak: streak,
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Failed to calculate analytics' }, { status: 500 });
  }
}
