import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Add a new task
export async function POST(request: Request) {
  try {
    const { title, segmentId } = await request.json()
    if (!title || !segmentId) {
      return NextResponse.json({ error: 'Title and segmentId required' }, { status: 400 })
    }

    const taskCount = await prisma.task.count({ where: { segmentId } })
    const task = await prisma.task.create({
      data: { title, segmentId, order: taskCount + 1 },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

// Delete a task
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 })

    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
