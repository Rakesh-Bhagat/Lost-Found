"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle, Search, AlertCircle, CheckCircle2 } from "lucide-react"
import { ItemCard } from "@/components/item-card"
import type { ItemType } from "@/lib/types"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<ItemType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchItems() {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/items/user")
          const data = await response.json()
          setItems(data)
        } catch (error) {
          console.error("Failed to fetch items:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (status !== "loading") {
      fetchItems()
    }
  }, [status])

  if (status === "loading") {
    return <DashboardSkeleton />
  }

  if (status === "unauthenticated") {
    return (
      <div className="container max-w-7xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-6 max-w-md">You need to be signed in to access your dashboard.</p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const lostItems = items.filter((item) => item.type === "lost")
  const foundItems = items.filter((item) => item.type === "found")
  const resolvedItems = items.filter((item) => item.status === "resolved")

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name || "User"}</p>
        </div>
        <Button asChild>
          <Link href="/items/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Report Item
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-8">
        <StatsCard
          title="Lost Items"
          value={lostItems.length}
          description="Items you've reported as lost"
          icon={<AlertCircle className="h-4 w-4" />}
          variant="destructive"
        />
        <StatsCard
          title="Found Items"
          value={foundItems.length}
          description="Items you've reported as found"
          icon={<Search className="h-4 w-4" />}
          variant="default"
        />
        <StatsCard
          title="Resolved"
          value={resolvedItems.length}
          description="Items that have been returned"
          icon={<CheckCircle2 className="h-4 w-4" />}
          variant="success"
        />
      </div>

      <Tabs defaultValue="my-items" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="my-items">My Items</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="my-items">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No items yet</h3>
              <p className="text-muted-foreground mb-6">You haven't reported any lost or found items yet.</p>
              <Button asChild>
                <Link href="/items/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Report Item
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="recent-activity">
          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No recent activity</h3>
                <p className="text-muted-foreground">Your recent activity will appear here.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="messages">
          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No messages</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any messages yet. When someone contacts you about an item, it will appear here.
                </p>
                <Button asChild variant="outline">
                  <Link href="/items">
                    <Search className="mr-2 h-4 w-4" /> Browse Items
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatsCard({
  title,
  value,
  description,
  icon,
  variant = "default",
}: {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  variant?: "default" | "destructive" | "success"
}) {
  const variantClasses = {
    default: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-green-500/10 text-green-500",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${variantClasses[variant]}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Skeleton className="h-8 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[50px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <Skeleton className="h-10 w-[300px]" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
