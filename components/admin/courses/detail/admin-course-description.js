import { Card, CardContent } from "@/components/ui/card"

export function AdminCourseDescription({ course }) {
    if (!course.detailedDescription) {
        return null
    }

    return (
        <Card className="mb-8">
            <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Mô tả chi tiết</h2>
                <div
                    className="prose prose-slate max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: course.detailedDescription }}
                />
            </CardContent>
        </Card>
    )
}
