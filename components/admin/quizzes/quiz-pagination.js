import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'; // Hoặc dùng icon thư viện khác

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  siblingCount = 2 // Số lượng trang muốn hiện bên cạnh trang hiện tại (tăng lên để hiện nhiều hơn)
}) => {

  // Danh sách các trang cần hiển thị
  const generatePagination = () => {
    // Luôn luôn hiện trang 1 và trang cuối
    // Nếu siblingCount = 2, và đang ở trang 11, sẽ hiện: 9, 10, [11], 12, 13
    
    const range = [];
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Trường hợp 1: Không hiện dấu ... (Tổng số trang ít)
    if (!shouldShowLeftDots && !shouldShowRightDots) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }

    // Trường hợp 2: Chỉ hiện dấu ... bên phải
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      for (let i = 1; i <= leftItemCount; i++) {
        range.push(i);
      }
      range.push('DOTS');
      range.push(totalPages);
      return range;
    }

    // Trường hợp 3: Chỉ hiện dấu ... bên trái
    if (shouldShowLeftDots && !shouldShowRightDots) {
      range.push(1);
      range.push('DOTS');
      let rightItemCount = 3 + 2 * siblingCount;
      for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }

    // Trường hợp 4: Hiện dấu ... ở cả 2 bên (Trường hợp bạn đang ở trang 11/22)
    if (shouldShowLeftDots && shouldShowRightDots) {
      range.push(1);
      range.push('DOTS');
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        range.push(i);
      }
      range.push('DOTS');
      range.push(totalPages);
      return range;
    }
  };

  const pages = generatePagination();

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {/* Nút về trang đầu tiên */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
        title="Về trang đầu"
      >
        <ChevronsLeft size={16} />
      </button>

      {/* Nút lùi 1 trang */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Danh sách các số trang */}
      {pages.map((page, index) => {
        if (page === 'DOTS') {
          return <span key={index} className="px-2">...</span>;
        }

        return (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded border ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600' // Style cho trang hiện tại
                : 'bg-white hover:bg-gray-50 border-gray-300'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Nút tiến 1 trang */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronRight size={16} />
      </button>

      {/* Nút đến trang cuối cùng */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
        title="Đến trang cuối"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;