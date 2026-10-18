import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { logs } = await req.json()
    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json({ success: true, count: 0 })
    }

    for (const log of logs) {
      const logDate = new Date(log.date)

      const existingLog = await prisma.dailyLog.findFirst({
        where: {
          taskId: log.taskId,
          date: logDate,
        },
      })

      if (existingLog) {
        await prisma.dailyLog.update({
          where: { id: existingLog.id },
          data: { completed: log.completed },
        })
      } else {
        await prisma.dailyLog.create({
          data: {
            taskId: log.taskId,
            date: logDate,
            completed: log.completed,
          },
        })
      }
    }

    return NextResponse.json({ success: true, count: logs.length })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: "Failed to sync offline logs" }, { status: 500 })
  }
}