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
          <img src="/gate.png" alt="University Entrance" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">GGV Lost & Found</h1>
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
            
            <CreatorCard
              name="Tanisha Bhushan"
              role="ECE 6th Semester"
              image="/tanisha.jpg"
              socialLinks={{
                linkedin: "https://www.linkedin.com/in/tanisha-bhushan-038450254/",
                twitter: "https://twitter.com/",
                instagram: "https://www.instagram.com/tanisha_bhushan/",
                github: "https://github.com/",
              }}
            />
            <CreatorCard
              name="Rakesh Bhagat"
              role="ECE 6th Semester"
              image="/rakesh.jpg"
              socialLinks={{
                linkedin: "https://www.linkedin.com/in/irakesh-bhagat/",
                twitter: "https://x.com/irakesh_bhagat",
                instagram: "https://www.instagram.com/irakesh_bhagat/",
                github: "https://github.com/Rakesh-Bhagat",
              }}
            />
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

function CreatorCard({
  name,
  role,
  image,
  socialLinks,
}: {
  name: string
  role: string
  image: string
  socialLinks: {
    linkedin?: string
    twitter?: string
    instagram?: string
    github?: string
  }
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
      <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
        <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-muted-foreground mb-3">{role}</p>

      <div className="flex space-x-3 mt-2">
        {socialLinks.linkedin && (
          <a
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label={`${name}'s LinkedIn`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-linkedin"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        )}

        {socialLinks.twitter && (
          <a
            href={socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label={`${name}'s Twitter`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-twitter"
            >
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </a>
        )}

        {socialLinks.instagram && (
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label={`${name}'s Instagram`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-instagram"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
        )}

        {socialLinks.github && (
          <a
            href={socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label={`${name}'s GitHub`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-github"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
  


