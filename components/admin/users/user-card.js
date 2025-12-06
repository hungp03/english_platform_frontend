import { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Lock, Unlock, CalendarDays } from "lucide-react";

const getInitials = (str) =>
  (str || "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const getStatusColor = (isActive) =>
  isActive ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive";

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const UserCard = memo(function UserCard({ user, onToggle }) {
  const isActive = user.isActive;
  
  const action = useMemo(() => 
    isActive
      ? { label: "Khóa", className: "text-destructive", willLock: true }
      : { label: "Mở khóa", className: "text-green-600", willLock: false },
    [isActive]
  );

  const handleToggle = useCallback(() => {
    onToggle(user, action.willLock);
  }, [onToggle, user, action.willLock]);

  const initials = useMemo(() => getInitials(user.fullName || user.email), [user.fullName, user.email]);
  const formattedDate = useMemo(() => formatDate(user.createdAt), [user.createdAt]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors w-full gap-4">
      <div className="flex items-center space-x-4 min-w-0 sm:flex-1">
        <div className="relative flex-shrink-0">
          <Avatar className={`h-12 w-12 ${isActive ? "" : "ring-2 ring-destructive/30"}`}>
            <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName || user.email} />
            <AvatarFallback className="bg-gradient-primary text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background ${
              isActive ? "bg-green-500" : "bg-red-500"
            }`}
            title={isActive ? "Đang hoạt động" : "Đã khóa"}
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{user.fullName}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${getStatusColor(isActive)}`}>
              {isActive ? "Hoạt động" : "Tạm khóa"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          {formattedDate && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 sm:hidden">
              <CalendarDays className="w-3 h-3" />
              Tham gia: {formattedDate}
            </p>
          )}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground w-32 flex-shrink-0">
        {formattedDate && (
          <>
            <CalendarDays className="w-4 h-4" />
            <span>{formattedDate}</span>
          </>
        )}
      </div>

      <div className="flex items-center justify-end space-x-2 sm:flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center justify-center gap-1 min-w-[85px] sm:min-w-[95px] ${action.className}`}
          onClick={handleToggle}
        >
          {isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <span className="hidden sm:inline">{action.label}</span>
        </Button>
      </div>
    </div>
  );
});

export default UserCard;
