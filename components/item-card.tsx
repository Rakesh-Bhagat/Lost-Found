import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ItemType } from "@/lib/types"
import { MapPin, Calendar, MessageSquare } from "lucide-react"

export function ItemCard({ item }: { item: ItemType }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={item.imageUrl || "/placeholder.svg?height=200&width=400"}
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
      <CardHeader className="p-4 pb-0">
        <Link href={`/items/${item.id}`} className="hover:underline">
          <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
        </Link>
        <div className="flex items-center text-sm text-muted-foreground">
          <Badge variant="outline" className="mr-2">
            {item.category}
          </Badge>
          {item.createdAt && (
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        {item.location && (
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/items/${item.id}`}>View Details</Link>
        </Button>
        {item.status !== "resolved" && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/messages/new?itemId=${item.id}`}>
              <MessageSquare className="h-4 w-4 mr-1" /> Contact
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
