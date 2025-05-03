import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "../../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

// GET a specific message thread
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { id } = await params;
    const threadId = id

    // Get the thread and check if the user is a participant
    const thread = await prisma.messageThread.findUnique({
      where: {
        id: threadId,
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        item: {
          select: {
            id: true,
            title: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    if (!thread) {
      return NextResponse.json({ message: "Thread not found" }, { status: 404 })
    }

    if (thread.participant1Id !== userId && thread.participant2Id !== userId) {
      return NextResponse.json({ message: "You don't have permission to view this thread" }, { status: 403 })
    }

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        threadId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    // Transform the data to make it easier to use on the client
    const otherUser = thread.participant1Id === userId ? thread.participant2 : thread.participant1

    const transformedThread = {
      id: thread.id,
      otherUser,
      item: thread.item,
      messages: thread.messages,
    }

    return NextResponse.json(transformedThread)
  } catch (error) {
    console.error("Error fetching message thread:", error)
    return NextResponse.json({ message: "Error fetching message thread" }, { status: 500 })
  }
}
