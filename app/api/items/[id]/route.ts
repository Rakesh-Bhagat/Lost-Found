import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

// GET a specific item
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.item.findUnique({
      where: {
        id: params.id,
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

    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json({ message: "Error fetching item" }, { status: 500 })
  }
}

// PATCH to update an item
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Check if item exists and belongs to the user
    const item = await prisma.item.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 })
    }

    if (item.userId !== session.user.id) {
      return NextResponse.json({ message: "You don't have permission to update this item" }, { status: 403 })
    }

    // Update item
    const updatedItem = await prisma.item.update({
      where: {
        id: params.id,
      },
      data: {
        ...body,
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

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json({ message: "Error updating item" }, { status: 500 })
  }
}

// DELETE an item
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if item exists and belongs to the user
    const item = await prisma.item.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 })
    }

    if (item.userId !== session.user.id) {
      return NextResponse.json({ message: "You don't have permission to delete this item" }, { status: 403 })
    }

    // Delete item
    await prisma.item.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json({ message: "Error deleting item" }, { status: 500 })
  }
}
