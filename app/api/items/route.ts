import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "../auth/[...nextauth]/route"
import { z } from "zod"
import { pusherServer } from "@/lib/pusher"

const prisma = new PrismaClient()

// GET all items
export async function GET() {
  try {
    const items = await prisma.item.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ message: "Error fetching items" }, { status: 500 })
  }
}

// POST a new item
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const itemSchema = z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      category: z.string().min(1),
      type: z.enum(["lost", "found"]),
      location: z.string().optional(),
      date: z.string().optional(),
      imageUrl: z.string().optional(),
    })

    const validation = itemSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input data", errors: validation.error.errors }, { status: 400 })
    }

    const { title, description, category, type, location, date, imageUrl } = body

    // Create item
    const item = await prisma.item.create({
      data: {
        title,
        description,
        category,
        type,
        location,
        date,
        imageUrl,
        status: "active",
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Trigger real-time notification
    // await pusherServer.trigger("items", "new-item", {
    //   item,
    // })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Error creating item:", error)
    return NextResponse.json({ message: "Error creating item" }, { status: 500 })
  }
}
