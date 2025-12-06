import { Button } from "@/components/ui/button";

const ConfirmModal = ({ isOpen, onClose, onConfirm, willLock }) => {
  if (!isOpen) return null;

  const actionText = willLock ? "khóa" : "mở khóa";

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <h3 className="text-xl font-semibold mb-4">
          Xác nhận {actionText} tài khoản
        </h3>
        <p className="text-sm mb-4">
          Bạn có chắc chắn muốn {actionText} tài khoản này?
        </p>
        <div className="flex justify-end space-x-4">
          <Button
            className="bg-gray-100 text-gray-800 hover:bg-gray-200"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            className={
              willLock
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-green-500 text-white hover:bg-green-600"
            }
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
