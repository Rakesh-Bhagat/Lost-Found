"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, ArrowLeft, Send, User } from "lucide-react"

type Message = {
  id: string
  content: string
  createdAt: string
  senderId: string
  receiverId: string
}

type Thread = {
  id: string
  otherUser: {
    id: string
    name: string
    image: string | null
  }
  item: {
    id: string
    title: string
  }
  messages: Message[]
}

export default function MessageThreadPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [thread, setThread] = useState<Thread | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchThread() {
      if (status === "authenticated") {
        try {
          const response = await fetch(`/api/messages/threads/${params.id}`)
          if (!response.ok) {
            throw new Error("Thread not found")
          }
          const data = await response.json()
          setThread(data)
        } catch (error) {
          console.error("Failed to fetch thread:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (status !== "loading") {
      fetchThread()
    }
  }, [params.id, status])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [thread?.messages])

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !thread || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: thread.id,
          content: newMessage,
          receiverId: thread.otherUser.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const message = await response.json()
      setThread({
        ...thread,
        messages: [...thread.messages, message],
      })
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <MessageThreadSkeleton />
  }

  if (status === "unauthenticated") {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-6 max-w-md">You need to be signed in to access your messages.</p>
          <Button asChild>
            <a href="/auth/signin">Sign In</a>
          </Button>
        </div>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">Thread Not Found</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            The message thread you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <a href="/messages">Back to Messages</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Messages
      </Button>

      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={thread.otherUser.image || ""} alt={thread.otherUser.name} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">{thread.otherUser.name}</h2>
              <p className="text-xs text-muted-foreground">
                Re:{" "}
                <a href={`/items/${thread.item.id}`} className="hover:underline">
                  {thread.item.title}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 h-[400px] overflow-y-auto flex flex-col space-y-4">
          {thread.messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            thread.messages.map((message) => {
              const isCurrentUser = message.senderId === session?.user?.id
              return (
                <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending}>
            <Send className="h-4 w-4 mr-2" /> Send
          </Button>
        </form>
      </div>
    </div>
  )
}

function MessageThreadSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Skeleton className="h-10 w-[150px] mb-6" />

      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div>
              <Skeleton className="h-5 w-[150px] mb-1" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
        </div>

        <div className="p-4 h-[400px] overflow-y-auto flex flex-col space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <Skeleton className={`h-[60px] w-[250px] rounded-lg`} />
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
    </div>
  )
}
