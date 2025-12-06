"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const initialCourses = [
  {
    id: 1,
    title: "TOEIC Mastery Course",
    instructor: "Nguyễn Văn A",
    submittedDate: "15/12/2024",
    modules: 12,
    lessons: 68,
    status: "pending",
    description:
      "Khóa học tổng hợp cho kỳ thi TOEIC, bao gồm tất cả các phần thi và chiến lược làm bài.",
  },
  {
    id: 2,
    title: "English Speaking Fluency",
    instructor: "Trần Thị B",
    submittedDate: "14/12/2024",
    modules: 8,
    lessons: 42,
    status: "pending",
    description:
      "Khóa học giúp cải thiện kỹ năng nói tiếng Anh tự nhiên và tự tin.",
  },
  {
    id: 3,
    title: "Business Writing Skills",
    instructor: "Lê Văn C",
    submittedDate: "13/12/2024",
    modules: 6,
    lessons: 35,
    status: "approved",
    description:
      "Kỹ năng viết email, báo cáo và tài liệu kinh doanh chuyên nghiệp.",
  },
  {
    id: 4,
    title: "Grammar Fundamentals",
    instructor: "Phạm Thị D",
    submittedDate: "12/12/2024",
    modules: 10,
    lessons: 55,
    status: "rejected",
    description:
      "Nền tảng ngữ pháp tiếng Anh từ cơ bản đến nâng cao.",
    rejectReason: "Nội dung chưa đầy đủ, cần bổ sung thêm bài tập thực hành.",
  },
]

const statusConfig = {
  pending: { label: "Chờ Duyệt", color: "bg-warning", icon: Clock },
  approved: { label: "Đã Duyệt", color: "bg-success", icon: CheckCircle },
  rejected: { label: "Từ Chối", color: "bg-destructive", icon: XCircle },
}

export default function CourseApprovalTable() {
  const [courses, setCourses] = useState(initialCourses)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [rejectReason, setRejectReason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // --- Actions ---
  const handleApprove = (id) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "approved", rejectReason: "" } : c
      )
    )
    toast.success("Đã phê duyệt khóa học thành công.")
  }

  const handleReject = (id, reason) => {
    if (!reason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối.")
      return
    }
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "rejected", rejectReason: reason } : c
      )
    )
    toast.error("Đã từ chối khóa học.")
  }

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm khóa học..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Course Table */}
      <Card className="shadow-elegant">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khóa Học</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Ngày Gửi</TableHead>
                <TableHead>Nội Dung</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead className="text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => {
                const StatusIcon = statusConfig[course.status].icon
                return (
                  <TableRow key={course.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {course.instructor}
                    </TableCell>
                    <TableCell>{course.submittedDate}</TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {course.modules} modules • {course.lessons} bài học
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusConfig[course.status].color} gap-1`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[course.status].label}
                      </Badge>
                    </TableCell>

                    {/* Detail Dialog */}
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCourse(course)
                              setRejectReason(course.rejectReason || "")
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem Chi Tiết
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl bg-popover">
                          <DialogHeader>
                            <DialogTitle>{selectedCourse?.title}</DialogTitle>
                            <DialogDescription>
                              Instructor: {selectedCourse?.instructor} • Ngày gửi:{" "}
                              {selectedCourse?.submittedDate}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2 text-foreground">
                                Mô Tả Khóa Học
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedCourse?.description}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2 text-foreground">
                                  Số Modules
                                </h4>
                                <p className="text-2xl font-bold text-primary">
                                  {selectedCourse?.modules}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2 text-foreground">
                                  Số Bài Học
                                </h4>
                                <p className="text-2xl font-bold text-primary">
                                  {selectedCourse?.lessons}
                                </p>
                              </div>
                            </div>

                            {selectedCourse?.status === "rejected" &&
                              selectedCourse.rejectReason && (
                                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                  <h4 className="font-semibold text-destructive mb-2">
                                    Lý Do Từ Chối
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedCourse.rejectReason}
                                  </p>
                                </div>
                              )}

                            {selectedCourse?.status === "pending" && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-foreground">
                                  Lý Do Từ Chối (nếu có)
                                </h4>
                                <Textarea
                                  placeholder="Nhập lý do từ chối..."
                                  value={rejectReason}
                                  onChange={(e) =>
                                    setRejectReason(e.target.value)
                                  }
                                  rows={3}
                                />
                              </div>
                            )}
                          </div>

                          {selectedCourse?.status === "pending" && (
                            <DialogFooter>
                              <Button
                                variant="outline"
                                className="gap-2 text-destructive border-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  handleReject(selectedCourse.id, rejectReason)
                                }
                              >
                                <XCircle className="h-4 w-4" />
                                Từ Chối
                              </Button>
                              <Button
                                className="bg-gradient-primary gap-2"
                                onClick={() => handleApprove(selectedCourse.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Phê Duyệt
                              </Button>
                            </DialogFooter>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
