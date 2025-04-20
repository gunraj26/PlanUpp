import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#e8d5c4]">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-[#f5efe6] shadow-lg">
        <div className="relative h-80 w-full bg-[#8a9a5b]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/images/basketball-illustration.png"
              alt="Basketball players illustration"
              width={400}
              height={300}
              className="max-h-full max-w-full object-contain"
              priority
            />
          </div>
        </div>
        <div className="p-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-[#5c4033]">PlanUpp</h1>
          <p className="mb-8 text-[#5c4033]">Connecting You to Unforgettable Events</p>

          <div className="space-y-4">
            <Link href="/signup" className="block w-full">
              <Button className="w-full bg-[#9c8170] hover:bg-[#7d6b5d] text-white">Sign Up</Button>
            </Link>
            <Link href="/login" className="block w-full">
              <Button
                variant="outline"
                className="w-full border-[#c3b091] bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081] hover:text-[#5c4033]"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

