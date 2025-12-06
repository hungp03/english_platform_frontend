export const metadata = {
  title: "Instructor Portal | English Pro",
  description: "Quản lý khóa học, bài học và học viên của bạn",
};

import ClientLayout from "./client-layout";

export default function InstructorLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>;
}
