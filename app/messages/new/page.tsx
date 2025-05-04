"use client";  // Add this to mark the component as a Client Component

import { useRouter } from 'next/navigation';  // Import from next/navigation for client-side routing
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from 'react';

export default function NewMessagePage() {
  const searchParams = useSearchParams();
  const router = useRouter(); // This will work now
  const itemId = searchParams.get("itemId");
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (itemId) {
      const fetchItem = async () => {
        const res = await fetch(`/api/items/${itemId}`);
        const data = await res.json();
        setItem(data);
      };
      fetchItem();
    }
  }, [itemId]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!item || !router) return;

    try {
      const res = await fetch("/api/messages/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          initialMessage: message,
          receiverId: item.userId,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setMessage("");
      } else {
        alert("Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!itemId) {
    return <div className="p-4 text-red-500">Invalid itemId in URL</div>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Contact Reporter</h1>
      {success ? (
        <div className="text-green-600 font-medium">
          ✅ Message sent successfully!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Item ID:</label>
            <Input value={itemId} disabled />
          </div>
          <div>
            <label className="block mb-1 font-medium">Your Message:</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      )}
    </div>
  );
}
