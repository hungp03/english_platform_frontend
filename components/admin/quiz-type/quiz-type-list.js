import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import QuizTypeItem from "./quiz-type-item";

export default function QuizTypeList({ list, loading, onEdit, onDelete }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Danh sách loại đề thi</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-3">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-gray-500 italic">Chưa có dữ liệu</div>
        ) : (
          <div className="space-y-3">
            {list.map((item) => (
              <QuizTypeItem
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
