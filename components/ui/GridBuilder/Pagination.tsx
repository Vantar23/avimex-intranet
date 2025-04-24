import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex justify-center mt-4 gap-2 text-sm flex-wrap">
      <button
        className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {currentPage > 3 && (
        <>
          <button
            className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-green-500 text-white" : "bg-gray-200"}`}
            onClick={() => handlePageClick(1)}
          >
            1
          </button>
          {currentPage > 4 && <span className="px-2 py-1">...</span>}
        </>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((page) => Math.abs(currentPage - page) <= 2)
        .map((page) => (
          <button
            key={page}
            className={`px-3 py-1 rounded ${currentPage === page ? "bg-green-500 text-white" : "bg-gray-200"}`}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </button>
        ))}

      {currentPage < totalPages - 2 && (
        <>
          {currentPage < totalPages - 3 && <span className="px-2 py-1">...</span>}
          <button
            className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-green-500 text-white" : "bg-gray-200"}`}
            onClick={() => handlePageClick(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
