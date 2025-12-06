"use client"

export function TransactionStatus({ status }) {
  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Thành công'
      case 'failure':
        return 'Thất bại'
      case 'cancellation':
        return 'Đã hủy'
      case 'pending':
        return 'Đang xử lý'
      default:
        return 'Không xác định'
    }
  }

  return getStatusText(status)
}