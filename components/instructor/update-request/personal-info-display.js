import { User } from "lucide-react"

const PersonalInfoDisplay = ({ fullName, email }) => {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <User className="w-4 h-4" />
        Thông tin cá nhân (không thể chỉnh sửa)
      </h4>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Họ và tên:</span>
          <p className="text-gray-600">{fullName}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Email:</span>
          <p className="text-gray-600">{email}</p>
        </div>
      </div>
    </div>
  )
}

export default PersonalInfoDisplay
