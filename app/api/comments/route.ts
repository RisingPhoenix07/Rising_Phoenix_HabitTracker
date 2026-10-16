import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const startOfDay = new Date(`${dateParam}T00:00:00.000Z`)
    const endOfDay = new Date(`${dateParam}T23:59:59.999Z`)

    const comment = await prisma.comment.findFirst({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
    })

    return NextResponse.json(comment || { text: '' })
  } catch (error) {
    console.error('Error fetching comment:', error)
    return NextResponse.json({ error: 'Failed to fetch comment' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { date, text } = await request.json()
    if (!date) return NextResponse.json({ error: 'Date is required' }, { status: 400 })

    const startOfDay = new Date(`${date}T00:00:00.000Z`)
    const endOfDay = new Date(`${date}T23:59:59.999Z`)

    const existing = await prisma.comment.findFirst({
      where: { date: { gte: startOfDay, lte: endOfDay } },
    })

    if (existing) {
      const updated = await prisma.comment.update({
        where: { id: existing.id },
        data: { text },
      })
      return NextResponse.json(updated)
    } else {
      const created = await prisma.comment.create({
        data: { date: startOfDay, text },
      })
      return NextResponse.json(created)
    }
  } catch (error) {
    console.error('Error saving comment:', error)
    return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 })
  }
}
