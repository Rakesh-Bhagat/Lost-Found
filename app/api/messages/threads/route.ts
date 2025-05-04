import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET all message threads for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all threads where the user is either participant1 or participant2
    const threads = await prisma.messageThread.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
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
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform the data to make it easier to use on the client
    const transformedThreads = threads.map((thread) => {
      const otherUser =
        thread.participant1Id === userId
          ? thread.participant2
          : thread.participant1;

      return {
        id: thread.id,
        otherUser,
        itemId: thread.itemId,
        itemTitle: thread.item.title,
        lastMessage: thread.messages[0] || null,
      };
    });

    return NextResponse.json(transformedThreads);
  } catch (error) {
    console.error("Error fetching message threads:", error);
    return NextResponse.json(
      { message: "Error fetching message threads" },
      { status: 500 }
    );
  }
}

// POST to create a new message thread
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId, receiverId, initialMessage } = body;

    // Check if a thread already exists between these users for this item
    const existingThread = await prisma.messageThread.findFirst({
      where: {
        itemId,
        OR: [
          {
            AND: [
              { participant1Id: session.user.id },
              { participant2Id: receiverId },
            ],
          },
          {
            AND: [
              { participant1Id: receiverId },
              { participant2Id: session.user.id },
            ],
          },
        ],
      },
    });

    if (existingThread) {
      // If thread exists, create a new message in it
      if (initialMessage) {
        await prisma.message.create({
          data: {
            content: initialMessage,
            senderId: session.user.id,
            receiverId,
            threadId: existingThread.id,
          },
        });

        // Update thread timestamp
        await prisma.messageThread.update({
          where: {
            id: existingThread.id,
          },
          data: {
            updatedAt: new Date(),
          },
        });
      }

      return NextResponse.json(existingThread);
    }

    // Create a new thread
    console.log("tesytsgud");
    const thread = await prisma.messageThread.create({
      data: {
        participant1: { connect: { id: session.user.id } },
        participant2: { connect: { id: receiverId } },
        item: { connect: { id: itemId } },
      },
    });

    // Create initial message if provided
    if (initialMessage) {
      await prisma.message.create({
        data: {
          content: initialMessage,
          sender: { connect: { id: session.user.id } },
          receiver: { connect: { id: receiverId } },
          thread: { connect: { id: thread.id } },
        },
      });
    }

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error("Error creating message thread:", error);
    return NextResponse.json(
      { message: "Error creating message thread" },
      { status: 500 }
    );
  }
}
