import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Search, Bell, MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with University Image Background */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 z-0">
          <img src="/university-entrance.jpg" alt="University Entrance" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">Campus Lost & Found</h1>
            <p className="text-xl text-white/80">
              The easiest way to find your lost items or report found items on campus. Connect with the community and
              help each other out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-white bg-white/10 border-white hover:bg-white">
                <Link href="/items">Browse Items</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Search className="h-10 w-10" />}
              title="Report & Find"
              description="Easily report lost items or items you've found on campus. Add photos and details to help with identification."
            />
            <FeatureCard
              icon={<Bell className="h-10 w-10" />}
              title="Get Notified"
              description="Receive real-time notifications when new items matching your criteria are reported or when someone claims your item."
            />
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10" />}
              title="Connect"
              description="Chat privately with other users to arrange item returns and verify ownership."
            />
          </div>
        </div>
      </section>

      {/* Created By Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Created By</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <CreatorCard name="Rakesh Bhagat" role="ECE 6th Semester" image="/rakesh.jpg" />
            <CreatorCard name="Tanisha Bhushan" role="ECE 6th Semester" image="/tanisha.jpg" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to find what you've lost?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our campus community today and help make lost items found again.
          </p>
          <Button asChild size="lg">
            <Link href="/auth/signup">
              Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )}


function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function CreatorCard({ name, role, image }: { name: string; role: string; image: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
      <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
        <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-muted-foreground">{role}</p>
    </div>
  )
}
  


