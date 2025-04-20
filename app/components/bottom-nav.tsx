"use client"

import { usePathname, useRouter } from "next/navigation"
import { Search, MessageSquare, PlusCircle, User } from "lucide-react"

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { label: "EVENTS", path: "/events", icon: Search },
    { label: "CHATS", path: "/chats", icon: MessageSquare },
    { label: "CREATE", path: "/create", icon: PlusCircle },
    { label: "PROFILE", path: "/profile", icon: User },
  ]

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`)
    router.push(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around border-t bg-[#c3b091] p-4 z-50">
      {navItems.map((item) => {
        const Icon = item.icon
        // Check if the current path starts with the navigation item's path
        const isActive = pathname.startsWith(item.path)

        return (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`flex flex-col items-center ${isActive ? `text-[#5c4033]` : `text-[#5c4033] opacity-50`}`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

