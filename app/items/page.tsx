"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle, Search, Filter } from "lucide-react"
import { ItemCard } from "@/components/item-card"
import type { ItemType } from "@/lib/types"

const CATEGORIES = ["All Categories", "Electronics", "Clothing", "Books", "Accessories", "Keys", "ID Cards", "Other"]

export default function ItemsPage() {
  const [items, setItems] = useState<ItemType[]>([])
  const [filteredItems, setFilteredItems] = useState<ItemType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch("/api/items")
        const data = await response.json()
        setItems(data)
        setFilteredItems(data)
      } catch (error) {
        console.error("Failed to fetch items:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [])

  useEffect(() => {
    let filtered = [...items]

    // Filter by tab (all, lost, found)
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.type === activeTab)
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          (item.location && item.location.toLowerCase().includes(query)),
      )
    }

    setFilteredItems(filtered)
  }, [items, searchQuery, selectedCategory, activeTab])

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground">Browse all lost and found items on campus</p>
        </div>
        <Button asChild>
          <Link href="/items/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Report Item
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="lost">Lost Items</TabsTrigger>
          <TabsTrigger value="found">Found Items</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {renderItems()}
        </TabsContent>
        <TabsContent value="lost" className="space-y-4">
          {renderItems()}
        </TabsContent>
        <TabsContent value="found" className="space-y-4">
          {renderItems()}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderItems() {
    if (isLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )
    }

    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No items found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || selectedCategory !== "All Categories"
              ? "Try adjusting your filters or search query."
              : "There are no items to display at the moment."}
          </p>
          <Button asChild>
            <Link href="/items/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Report Item
            </Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    )
  }
}
