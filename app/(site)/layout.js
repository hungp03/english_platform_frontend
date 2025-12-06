import Header from "@/components/common/header"
import Footer from "@/components/common/footer"
import LabanDictFrame from "@/components/common/laban-dict-frame"
import MessengerChat from "@/components/common/messager-chat";
export const metadata = {
  title: "English Pro - Học tiếng Anh hiệu quả",
  description: "Làm chủ kỳ thi Tiếng Anh với English Pro",
}

export default function RootLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LabanDictFrame />
      <MessengerChat />
      <main className="grow">{children}</main>
      <Footer />
    </div>
  )
}