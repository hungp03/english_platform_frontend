import OrderDetailContent from './order-detail-content'

export async function generateMetadata({ params }) {
  const { id } = await params
  return {
    title: `Chi tiết đơn hàng ${id} - English Pro`,
    description: "Xem chi tiết thông tin đơn hàng của bạn"
  }
}

export default async function OrderDetailPage({ params }) {
  const { id } = await params
  return <OrderDetailContent orderId={id} />
}