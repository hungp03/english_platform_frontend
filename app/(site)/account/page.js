import { Suspense } from 'react'
import AccountContent from './account-content'
import { Loader2 } from 'lucide-react'

export const metadata = {
  title: "Tài khoản - English Pro",
  description: "Quản lý thông tin tài khoản"
}

function AccountLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    </div>
  )
}

export default async function AccountPage() {
  return (
    <Suspense fallback={<AccountLoading />}>
      <AccountContent />
    </Suspense>
  )
}
