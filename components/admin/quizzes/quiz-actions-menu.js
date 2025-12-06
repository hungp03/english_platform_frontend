"use client";

import { memo } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const QuizActionsMenu = memo(({ quizId, onDelete }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem asChild>
        <a href={`/admin/quizzes/${quizId}`}>Sửa</a>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <a href={`/admin/quizzes/${quizId}/questions`}>Danh sách câu hỏi</a>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onDelete} className="text-destructive">
        Xóa
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));

QuizActionsMenu.displayName = "QuizActionsMenu";

export default QuizActionsMenu;
