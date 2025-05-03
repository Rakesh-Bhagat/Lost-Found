export type ItemType = {
  id: string
  title: string
  description: string
  category: string
  type: "lost" | "found"
  location?: string
  date?: string
  imageUrl?: string
  status: "active" | "resolved"
  createdAt: string
  updatedAt: string
  userId: string
  user?: {
    id: string
    name: string
    image: string | null
  }
}

export type MessageType = {
  id: string
  content: string
  senderId: string
  receiverId: string
  threadId: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export type MessageThreadType = {
  id: string
  participant1Id: string
  participant2Id: string
  itemId: string
  createdAt: string
  updatedAt: string
}
