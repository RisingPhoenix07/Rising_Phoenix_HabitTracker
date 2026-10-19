import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  await connection();
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);

    const comment = await prisma.comment.findFirst({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        ...(userId ? { userId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comment || { content: "", text: "" });
  } catch (error) {
    console.error("Failed to fetch comment:", error);
    return NextResponse.json({ error: "Failed to fetch comment" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connection();
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { content, text, taskId } = body;

    const noteText = content || text;
    if (!noteText || !noteText.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        userId: userId || "legacy_user",
        content: noteText,
        text: noteText,
        taskId: taskId || null,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Failed to save comment:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
