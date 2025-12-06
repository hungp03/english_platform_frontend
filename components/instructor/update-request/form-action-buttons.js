import Link from "next/link"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export const FormActionButtons = ({ 
  isReadOnly, 
  saving, 
  onDelete 
}) => {
  return (
    <div className="flex justify-between pt-6 border-t">
      <div className="flex gap-2">
        <Link href="/account/instructor">
          <Button variant="outline" type="button">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isReadOnly ? "Quay lại" : "Hủy"}
          </Button>
        </Link>
        <Button 
          variant="destructive" 
          className="hover:cursor-pointer"
          type="button"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Xóa yêu cầu
        </Button>
      </div>
      {!isReadOnly && (
        <Button type="submit" disabled={saving} className="min-w-[120px]">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              Lưu thay đổi
            </>
          )}
        </Button>
      )}
    </div>
  )
}
