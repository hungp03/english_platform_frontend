import SavedThreads from "@/components/account/forum/saved-threads";

export const metadata = {
  title: "Bài viết đã lưu - Diễn đàn",
  description: "Danh sách các chủ đề bạn đã lưu"
};

export default function SavedThreadsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <SavedThreads />
    </div>
  );
}