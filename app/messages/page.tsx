"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, MessageSquare, Search, User } from "lucide-react"

type MessageThread = {
  id: string
  otherUser: {
    id: string
    name: string
    image: string | null
  }
  lastMessage: {
    content: string
    createdAt: string
    isRead: boolean
  }
  itemId: string
  itemTitle: string
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchThreads() {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/messages/threads")
          const data = await response.json()
          setThreads(data)
        } catch (error) {
          console.error("Failed to fetch message threads:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (status !== "loading") {
      fetchThreads()
    }
  }, [status])

  if (status === "loading") {
    return <MessagesSkeleton />
  }

  if (status === "unauthenticated") {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-6 max-w-md">You need to be signed in to access your messages.</p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Communicate with other users about lost and found items</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-4 w-[100px]" />
            </div>
          ))}
        </div>
      ) : threads.length > 0 ? (
        <div className="space-y-4">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/messages/${thread.id}`}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={thread.otherUser.image || ""} alt={thread.otherUser.name} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{thread.otherUser.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(thread.lastMessage.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{thread.lastMessage.content}</p>
                <p className="text-xs text-muted-foreground mt-1">Re: {thread.itemTitle}</p>
              </div>
              {!thread.lastMessage.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            When you contact someone about an item or someone contacts you, your conversations will appear here.
          </p>
          <Button asChild>
            <Link href="/items">
              <Search className="mr-2 h-4 w-4" /> Browse Items
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

function MessagesSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Skeleton className="h-8 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>

      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>
    </div>
  )
}
