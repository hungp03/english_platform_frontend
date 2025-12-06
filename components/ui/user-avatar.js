import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function UserAvatar({ src, name, className }) {
  const getInitials = (name) => {
    if (!name) return "?"
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] || ""
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (first + last).toUpperCase() || first.toUpperCase() || "?"
  }

  return (
    <Avatar className={className}>
      <AvatarImage src={src} alt={name || "Avatar"} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
