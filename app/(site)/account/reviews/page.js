import MyReviews from "@/components/account/reviews/my-reviews";

export const metadata = {
  title: "Lịch sử đánh giá | English Pro",
  description: "Xem lại các đánh giá khóa học của bạn",
};

export default function ReviewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <MyReviews />
    </div>
  );
}