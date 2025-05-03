import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "../auth/[...nextauth]/route"
import { z } from "zod"
import { pusherServer } from "@/lib/pusher"

const prisma = new PrismaClient()

// POST a new message
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const messageSchema = z.object({
      threadId: z.string(),
      content: z.string().min(1),
      receiverId: z.string(),
    })

    const validation = messageSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input data", errors: validation.error.errors }, { status: 400 })
    }

    const { threadId, content, receiverId } = body

    // Check if thread exists
    const thread = await prisma.messageThread.findUnique({
      where: {
        id: threadId,
      },
    })

    if (!thread) {
      return NextResponse.json({ message: "Thread not found" }, { status: 404 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
        threadId,
      },
    })

    // Update thread with last message
    await prisma.messageThread.update({
      where: {
        id: threadId,
      },
      data: {
        updatedAt: new Date(),
      },
    })

    // Trigger real-time notification
    // await pusherServer.trigger(`private-user-${receiverId}`, "new-message", {
    //   message,
    //   threadId,
    // })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ message: "Error creating message" }, { status: 500 })
  }
}
