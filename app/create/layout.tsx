"use client"

import { CreateEventProvider } from "./context/create-context"

export default function CreateLayout({ children }) {
  return <CreateEventProvider>{children}</CreateEventProvider>
}

