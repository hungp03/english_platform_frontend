export function EmptyState({ message = "Không tìm thấy khóa học nào" }) {
  return (
    <div className="flex justify-center items-center py-12">
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
