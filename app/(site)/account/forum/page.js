import MyForumThreads from "@/components/account/forum/my-threads";

export const metadata = {
  title: "Bài viết của tôi - Diễn đàn",
  description: "Danh sách chủ đề đã đăng trên diễn đàn"
};

export default function AccountForumPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <MyForumThreads />
    </div>
  );
}
