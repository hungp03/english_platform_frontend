"use client";

import { memo, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const NotificationItem = memo(({ item, onRead, onDelete, compact = false }) => {
  const vietnamTime = useMemo(() => {
    if (!item.createdAt) return null;
    const date = new Date(item.createdAt);
    return new Date(date.getTime() + 7 * 60 * 60 * 1000);
  }, [item.createdAt]);

  const timeAgo = useMemo(() => {
    if (!vietnamTime) return "";
    return formatDistanceToNow(vietnamTime, { addSuffix: true, locale: vi });
  }, [vietnamTime]);

  const handleRead = useCallback(() => {
    onRead(item.id);
  }, [item.id, onRead]);

  const handleDelete = useCallback(() => {
    onDelete(item.id);
  }, [item.id, onDelete]);

  return (
    <div className={cn(
      "group flex gap-3 p-4 transition-colors hover:bg-accent/50 border-b last:border-0",
      !item.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : "bg-background"
    )}>
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        !item.isRead ? "bg-blue-100 text-blue-600" : "bg-muted text-muted-foreground"
      )}>
        <Bell className="h-5 w-5" />
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium leading-none", !item.isRead && "text-primary font-bold")}>
            {item.title}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
        <p className={cn("text-sm text-muted-foreground", compact && "line-clamp-2")}>
            {item.content}
        </p>
        
        <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!item.isRead && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleRead}>
              <Check className="mr-1 h-3 w-3" /> Đã đọc
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="mr-1 h-3 w-3" /> Xóa
          </Button>
        </div>
      </div>
      
      {/* Dot indicator for unread */}
      {!item.isRead && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 group-hover:opacity-0 transition-opacity">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
        </div>
      )}
    </div>
  );
});

NotificationItem.displayName = "NotificationItem";

export default NotificationItem;