import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight, User } from "lucide-react"
import Editor from "@/components/common/editor"

export const BasicInformationStep = ({
  register,
  errors,
  handleSubmit,
  loading,
  onBioChange,
  bioValue
}) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Bước 1: Thông tin cơ bản
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bio">Tiểu sử *</Label>
          <div className="border rounded-lg">
            <Editor
              initialContent={bioValue || ""}
              onContentChange={onBioChange}
            />
          </div>
          {errors.bio && (
            <p className="text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="expertise">Chuyên môn *</Label>
            <Input
              id="expertise"
              {...register('expertise')}
              placeholder="VD: IELTS, Business English, Conversation"
            />
            {errors.expertise && (
              <p className="text-sm text-red-600">{errors.expertise.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceYears">Số năm kinh nghiệm *</Label>
            <Input
              id="experienceYears"
              type="number"
              min="0"
              {...register('experienceYears', {
                valueAsNumber: true,
                setValueAs: (value) => {
                  const num = parseFloat(value);
                  return isNaN(num) ? 0 : num;
                }
              })}
              placeholder="VD: 5"
            />
            {errors.experienceYears && (
              <p className="text-sm text-red-600">{errors.experienceYears.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="qualification">Bằng cấp *</Label>
            <Input
              id="qualification"
              {...register('qualification')}
              placeholder="VD: TESOL, Master's in English Literature"
            />
            {errors.qualification && (
              <p className="text-sm text-red-600">{errors.qualification.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Lý do muốn trở thành giảng viên *</Label>
          <Textarea
            id="reason"
            {...register('reason')}
            placeholder="Chia sẻ lý do tại sao bạn muốn trở thành giảng viên trên nền tảng của chúng tôi"
            rows={4}
            className="resize-none"
          />
          {errors.reason && (
            <p className="text-sm text-red-600">{errors.reason.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <form onSubmit={handleSubmit}>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Tiếp tục
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}