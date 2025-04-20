"use client"

import { ProfileProvider } from "./context/profile-context"

export default function ProfileLayout({ children }) {
  return <ProfileProvider>{children}</ProfileProvider>
}

