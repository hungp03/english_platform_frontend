import AdminLayoutClient from "./admin-layout-client";

export const metadata = {
  title: "Admin - English Pro",
  description: "Admin dashboard for English Pro platform",
};

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
