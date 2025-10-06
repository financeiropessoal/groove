import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const pageNumbers = [];
  // Logic to show a limited number of page numbers
  const maxPagesToShow = 5;
  let startPage: number, endPage: number;

  if (totalPages <= maxPagesToShow) {
    // show all pages
    startPage = 1;
    endPage = totalPages;
  } else {
    // show a subset of pages
    const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
    if (currentPage <= maxPagesBeforeCurrent) {
      // near the start
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
      // near the end
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      // in the middle
      startPage = currentPage - maxPagesBeforeCurrent;
      endPage = currentPage + maxPagesAfterCurrent;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const commonButtonClasses = "px-4 py-2 rounded-md transition-colors duration-200 text-sm font-semibold";
  const activeClasses = "bg-gradient-to-r from-pink-500 to-orange-500 text-white";
  const inactiveClasses = "bg-gray-800 text-gray-300 hover:bg-gray-700";
  const disabledClasses = "bg-gray-800 text-gray-500 cursor-not-allowed";

  return (
    <nav className="flex justify-center items-center gap-2 mt-12" aria-label="Pagination">
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${commonButtonClasses} ${currentPage === 1 ? disabledClasses : inactiveClasses}`}
        aria-label="Previous Page"
      >
        <i className="fas fa-chevron-left"></i>
      </button>

      {startPage > 1 && (
        <>
          <button onClick={() => handlePageClick(1)} className={`${commonButtonClasses} ${inactiveClasses}`}>1</button>
          {startPage > 2 && <span className="text-gray-500">...</span>}
        </>
      )}

      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => handlePageClick(number)}
          className={`${commonButtonClasses} ${currentPage === number ? activeClasses : inactiveClasses}`}
          aria-current={currentPage === number ? 'page' : undefined}
        >
          {number}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
          <button onClick={() => handlePageClick(totalPages)} className={`${commonButtonClasses} ${inactiveClasses}`}>{totalPages}</button>
        </>
      )}

      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${commonButtonClasses} ${currentPage === totalPages ? disabledClasses : inactiveClasses}`}
        aria-label="Next Page"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </nav>
  );
};

export default Pagination;