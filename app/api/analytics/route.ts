import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const daysParam = parseInt(searchParams.get('days') || '7', 10)

    const totalTasksCount = await prisma.task.count()
    if (totalTasksCount === 0) {
      return NextResponse.json({ history: [], weeklyAverage: 0, currentStreak: 0 })
    }

    const history = []
    const today = new Date()
    let totalScoreSum = 0

    // Fetch historical 7-day completion data
    for (let i = daysParam - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]

      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`)
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`)

      const completedCount = await prisma.dailyLog.count({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          completed: true,
        },
      })

      const percentage = Math.round((completedCount / totalTasksCount) * 100)
      totalScoreSum += percentage

      history.push({
        date: dateStr.slice(5), // "MM-DD"
        completed: completedCount,
        percentage,
      })
    }

    const weeklyAverage = Math.round(totalScoreSum / daysParam)

    // Calculate current streak (days with >= 70% completion)
    let currentStreak = 0
    let checkDate = new Date(today)

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0]
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`)
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`)

      const completedCount = await prisma.dailyLog.count({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          completed: true,
        },
      })

      const pct = Math.round((completedCount / totalTasksCount) * 100)
      if (pct >= 70) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return NextResponse.json({
      history,
      weeklyAverage,
      currentStreak,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
