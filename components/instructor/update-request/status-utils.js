export const getStatusVariant = (status) => {
  switch (status) {
    case "APPROVED":
      return "default"
    case "PENDING":
      return "secondary"
    case "REJECTED":
      return "destructive"
    default:
      return "outline"
  }
}

export const getStatusText = (status) => {
  switch (status) {
    case "APPROVED":
      return "Đã duyệt"
    case "PENDING":
      return "Chờ duyệt"
    case "REJECTED":
      return "Đã từ chối"
    default:
      return "Không xác định"
  }
}
