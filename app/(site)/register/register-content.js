import Link from 'next/link'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'
import RegisterForm from './register-form'

export function RegisterContent() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center">
                    <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">English Pro</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900">Tạo tài khoản</h2>
                </div>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Đăng ký</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RegisterForm />
                        <p className="mt-6 text-center text-sm text-gray-600">
                            Đã có tài khoản?{' '}
                            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Đăng nhập tại đây
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
