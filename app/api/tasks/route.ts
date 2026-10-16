import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const startOfDay = new Date(`${dateParam}T00:00:00.000Z`)
    const endOfDay = new Date(`${dateParam}T23:59:59.999Z`)

    const segments = await prisma.segment.findMany({
      orderBy: { order: 'asc' },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
          include: {
            logs: {
              where: {
                date: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(segments)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}
