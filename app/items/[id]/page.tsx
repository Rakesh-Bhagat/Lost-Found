"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { formatDistanceToNow, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ItemType } from "@/lib/types"
import { ArrowLeft, Calendar, MapPin, MessageSquare, User, CheckCircle, AlertCircle, Pencil, Trash } from "lucide-react"

export default function ItemDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [item, setItem] = useState<ItemType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isResolving, setIsResolving] = useState(false)

  
    async function fetchItem() {
      try {
        const {id} = useParams()
        const response = await fetch(`/api/items/${id}`)
        if (!response.ok) {
          throw new Error("Item not found")
        }
        const data = await response.json()
        setItem(data)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchItem()
  

  const isOwner = session?.user?.id === item?.userId

  async function handleResolveItem() {
    if (!item) return

    setIsResolving(true)
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "resolved" }),
      })

      if (!response.ok) {
        throw new Error("Failed to update item")
      }

      setItem({ ...item, status: "resolved" })
    } catch (error) {
      console.error("Error resolving item:", error)
    } finally {
      setIsResolving(false)
    }
  }

  async function handleDeleteItem() {
    if (!item) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete item")
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting item:", error)
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <ItemDetailsSkeleton />
  }

  if (error || !item) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">Item Not Found</h1>
          <p className="text-muted-foreground mb-6 max-w-md">{error || "The requested item could not be found."}</p>
          <Button asChild>
            <a href="/items">Browse Items</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="aspect-square relative rounded-lg overflow-hidden border">
            <img
              src={item.imageUrl || "/placeholder.svg?height=400&width=400"}
              alt={item.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-2 right-2">
              <Badge variant={item.type === "lost" ? "destructive" : "default"}>
                {item.type === "lost" ? "Lost" : "Found"}
              </Badge>
            </div>
            {item.status === "resolved" && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Badge variant="outline" className="text-lg font-semibold px-4 py-2">
                  Resolved
                </Badge>
              </div>
            )}
          </div>

          {isOwner && item.status !== "resolved" && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <a href={`/items/${item.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </a>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this item report.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteItem} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {isOwner && item.status !== "resolved" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as Resolved
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark as resolved?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the item as resolved. This means the item has been returned to its owner.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResolveItem} disabled={isResolving}>
                    {isResolving ? "Updating..." : "Confirm"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">{item.title}</h1>
              <Badge variant="outline">{item.category}</Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              {item.createdAt && (
                <span className="flex items-center mr-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </span>
              )}
              {item.location && (
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {item.location}
                </span>
              )}
            </div>
            <p className="text-muted-foreground whitespace-pre-line">{item.description}</p>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Reported by</h2>
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={item.user?.image || ""} alt={item.user?.name || ""} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{item.user?.name || "Anonymous"}</p>
                <p className="text-sm text-muted-foreground">
                  {item.date ? format(new Date(item.date), "PPP") : "Unknown date"}
                </p>
              </div>
            </div>
          </div>

          {item.status !== "resolved" && !isOwner && (
            <Button className="w-full" asChild>
              <a href={`/messages/new?itemId=${item.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" /> Contact Reporter
              </a>
            </Button>
          )}

          {item.status === "resolved" && (
            <div className="bg-green-500/10 text-green-500 p-4 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <div>
                <p className="font-medium">This item has been resolved</p>
                <p className="text-sm">The item has been returned to its owner</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ItemDetailsSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Skeleton className="h-10 w-[100px] mb-6" />

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-6 w-[100px]" />
            </div>
            <div className="flex items-center mb-4">
              <Skeleton className="h-4 w-[150px] mr-4" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <Skeleton className="h-[100px] w-full rounded-lg" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
