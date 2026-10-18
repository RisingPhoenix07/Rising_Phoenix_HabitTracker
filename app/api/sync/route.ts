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

    // Process all queued offline updates using the exact Prisma "log" model
    await prisma.$transaction(
      logs.map((log: { taskId: string; date: string; completed: boolean }) =>
        prisma.log.upsert({
          where: {
            taskId_date: {
              taskId: log.taskId,
              date: log.date
            }
          },
          update: {
            completed: log.completed
          },
          create: {
            taskId: log.taskId,
            date: log.date,
            completed: log.completed
          }
        })
      )
    )

    return NextResponse.json({ success: true, count: logs.length })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: "Failed to sync offline logs" }, { status: 500 })
  }
}
