'use client';

import { memo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProfileCard from '@/components/account/profile';
import TestHistory from '@/components/account/test-history';
import GoogleLinkCard from '@/components/account/google-link-card';

const AccountContent = memo(() => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHistoryParam = searchParams.has('history-tests');
  const defaultTab = hasHistoryParam ? 'history' : 'profile';

  const handleTabChange = useCallback((value) => {
    if (value === 'history') {
      router.push('/account?history-tests', { scroll: false });
    } else {
      router.push('/account', { scroll: false });
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tài khoản của bạn</h1>
            <p className="text-gray-600 mt-2">Quản lý hồ sơ, lịch sử học tập và cài đặt cá nhân</p>
          </div>

          <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
              {/* <TabsTrigger value="preferences">Thông báo</TabsTrigger> */}
            </TabsList>

            <TabsContent value="profile">
              <div className="grid md:grid-cols-1 gap-6">
                <ProfileCard />
                <GoogleLinkCard />
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Đơn hàng của bạn</h3>
                      <p className="text-sm text-gray-600">Xem và quản lý lịch sử đơn hàng</p>
                    </div>
                    <Link href="/account/orders">
                      <Button variant="outline">
                        Xem đơn hàng
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Yêu cầu giảng viên</h3>
                      <p className="text-sm text-gray-600">Đăng ký làm giảng viên tại đây</p>
                    </div>
                    <Link href="/account/instructor">
                      <Button variant="outline">
                        Xem yêu cầu
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Bài viết diễn đàn
                      </h3>
                      <p className="text-sm text-gray-600">
                        Xem và quản lý các chủ đề bạn đã đăng
                      </p>
                    </div>
                    <Link href="/account/forum">
                      <Button variant="outline">Xem bài viết</Button>
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Đánh giá của bạn</h3>
                      <p className="text-sm text-gray-600">Xem và quản lý các đánh giá bạn đã viết</p>
                    </div>
                    <Link href="/account/reviews">
                      <Button variant="outline">
                        Xem đánh giá
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>
            </TabsContent>

            <TabsContent value="history">
              <TestHistory />
            </TabsContent>

            {/* <TabsContent value="preferences">
              <NotificationSettingsWrapper />
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
});

AccountContent.displayName = "AccountContent";

export default AccountContent;