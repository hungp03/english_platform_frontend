"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CourseStatusConfirmDialog({
  open,
  onOpenChange,
  courseTitle,
  action,
  onConfirm,
}) {
  const getActionConfig = (actionType) => {
    switch (actionType) {
      case 'approve':
        return {
          title: "Phê duyệt khóa học",
          description: `Bạn có chắc chắn muốn phê duyệt khóa học "${courseTitle}"? Khóa học sẽ được công khai và học viên có thể đăng ký.`,
          confirmText: "Phê duyệt",
          variant: "default"
        }
      case 'reject':
        return {
          title: "Từ chối khóa học",
          description: `Bạn có chắc chắn muốn từ chối khóa học "${courseTitle}"? Khóa học sẽ không được hiển thị công khai.`,
          confirmText: "Từ chối",
          variant: "destructive"
        }
      case 'unpublish':
        return {
          title: "Gỡ xuất bản khóa học",
          description: `Bạn có chắc chắn muốn gỡ xuất bản khóa học "${courseTitle}"? Khóa học sẽ không còn công khai nhưng vẫn tồn tại trong hệ thống.`,
          confirmText: "Gỡ xuất bản",
          variant: "destructive"
        }
      default:
        return {
          title: "Xác nhận hành động",
          description: `Bạn có chắc chắn muốn thực hiện hành động này cho khóa học "${courseTitle}"?`,
          confirmText: "Xác nhận",
          variant: "default"
        }
    }
  }

  const config = getActionConfig(action)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={config.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {config.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}