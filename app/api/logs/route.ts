import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { taskId, date, completed } = body

    if (!taskId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const startOfDay = new Date(`${date}T00:00:00.000Z`)
    const endOfDay = new Date(`${date}T23:59:59.999Z`)

    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        taskId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    if (existingLog) {
      const updatedLog = await prisma.dailyLog.update({
        where: { id: existingLog.id },
        data: { completed },
      })
      return NextResponse.json(updatedLog)
    } else {
      const newLog = await prisma.dailyLog.create({
        data: {
          taskId,
          date: startOfDay,
          completed,
        },
      })
      return NextResponse.json(newLog)
    }
  } catch (error) {
    console.error('Error updating log:', error)
    return NextResponse.json({ error: 'Failed to update task log' }, { status: 500 })
  }
}
