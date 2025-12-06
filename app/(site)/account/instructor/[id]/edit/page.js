import EditInstructorRequestContent from './edit-instructor-request-content'

export async function generateMetadata() {
  return {
    title: `Chỉnh sửa yêu cầu`,
    description: "Chỉnh sửa thông tin yêu cầu"
  }
}

export default async function EditInstructorRequestPage({ params }) {
  const { id } = await params
  return <EditInstructorRequestContent requestId={id} />
}

