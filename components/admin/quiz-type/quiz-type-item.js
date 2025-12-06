import { Button } from "@/components/ui/button";

export default function QuizTypeItem({ item, onEdit, onDelete }) {
  return (
    <div
      className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50 transition"
    >
      <div>
        <div className="font-medium">
          {item.name}{" "}
        </div>
        {item.description && (
          <div className="text-sm text-muted-foreground">
            {item.description}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
          Sửa
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(item.id)}
        >
          Xóa
        </Button>
      </div>
    </div>
  );
}
