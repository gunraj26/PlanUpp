export default function ChatsLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-planupp-beige">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-planupp-primary border-t-transparent mx-auto"></div>
        <p className="text-planupp-text">Loading chats...</p>
      </div>
    </div>
  )
}

