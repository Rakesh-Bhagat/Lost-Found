import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";
import { pusherServer } from "@/lib/pusher";
import { transporter } from "@/lib/email"


const prisma = new PrismaClient();

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
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { message: "Error fetching items" },
      { status: 500 }
    );
  }
}

// POST a new item
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const itemSchema = z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      category: z.string().min(1),
      type: z.enum(["lost", "found"]),
      location: z.string().optional(),
      date: z.string().optional(),
      imageUrl: z.string().optional(),
    });

    const validation = itemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { title, description, category, type, location, date, imageUrl } =
      body;

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
    });

    const oppositeType = type === "lost" ? "found" : "lost";

    const existingItems = await prisma.item.findMany({
      where: {
        type: oppositeType,
        status: "active",
      },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    console.log(item);
    console.log(existingItems)

    const response = await fetch("https://ml-matching-api.onrender.com/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        new_item: {
          id: item.id,
          title: item.title,
          description: item.description,
          email: session.user.email,
        },
        existing_items: existingItems.map(i => ({
          id: i.id,
          title: i.title,
          description: i.description,
          email: i.user.email,
        })),
      }),
    })
    
    const matchResult = await response.json()
    console.log(matchResult)
    if (matchResult.match_found) {
      const matched = matchResult.matched_item
      const siteUrl = process.env.SITE_URL || "http://localhost:3000"
    
      await transporter.sendMail({
        from: `"Lost & Found" <${process.env.EMAIL_USER}>`,
        to: session.user.email!,
        subject: "We Found a Possible Match for Your Lost Item!",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 10px;">
            <h2 style="color: #333;">🎉 We Found a Possible Match!</h2>
            <p>Your reported item matches with the following:</p>
            
            <h3>${matched.title}</h3>
            <p>${matched.description}</p>
            ${matched.imageUrl ? `<img src="${matched.imageUrl}" alt="Item image" style="max-width: 200px; height: auto; border-radius: 5px; margin-top: 10px;">` : ''}
            
            <p><b>Location:</b> ${matched.location}</p>
            <p><b>Date Reported:</b> ${new Date(matched.createdAt).toLocaleDateString()}</p>
      
            <a href="${siteUrl}/items/${matched.id}" style="display: inline-block; margin-top: 15px; padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
              View Matched Item
            </a>
          </div>
        `,
      })
      
      await transporter.sendMail({
        from: `"Lost & Found" <${process.env.EMAIL_USER}>`,
        to: matched.email,
        subject: "We Found a Possible Match for Your Found Item!",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 10px;">
            <h2 style="color: #333;">🎉 We Found a Possible Match!</h2>
            <p>Your reported item matches with the following:</p>
            
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="Item image" style="max-width: 200px; height: auto; border-radius: 5px; margin-top: 10px;">` : ''}
            
            <p><b>Location:</b> ${item.location}</p>
            <p><b>Date Reported:</b> ${new Date(item.createdAt).toLocaleDateString()}</p>
      
            <a href="${siteUrl}/items/${item.id}" style="display: inline-block; margin-top: 15px; padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
              View Matched Item
            </a>
          </div>
        `,
      })
    }
        

    // Trigger real-time notification
    // await pusherServer.trigger("items", "new-item", {
    //   item,
    // })

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { message: "Error creating item" },
      { status: 500 }
    );                     
  }
}
