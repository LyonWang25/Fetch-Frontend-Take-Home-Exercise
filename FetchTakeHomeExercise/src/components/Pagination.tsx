const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // If total pages is 7 or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // If current page is near the start
        pages.push(2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        // If current page is near the end
        pages.push(
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        // If current page is in the middle
        pages.push(
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  return (
    <div className="mt-6 flex justify-center items-center gap-2">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:hover:bg-gray-200"
      >
        Prev
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((pageNumber, index) => (
        <button
          key={index}
          onClick={() =>
            typeof pageNumber === "number" && onPageChange(pageNumber)
          }
          disabled={pageNumber === "..."}
          className={`px-3 py-1 rounded ${
            pageNumber === currentPage
              ? "bg-blue-500 text-white"
              : pageNumber === "..."
              ? "bg-transparent cursor-default"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {pageNumber}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:hover:bg-gray-200"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;