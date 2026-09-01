interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav className="common-pagination" aria-label="Pagination">
      <button
        type="button"
        className="common-pagination-button"
        onClick={handlePrevious}
        disabled={disabled || currentPage === 1}
      >
        Previous
      </button>

      <div className="common-pagination-pages">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`common-pagination-page ${
              page === currentPage ? "common-pagination-page-active" : ""
            }`}
            onClick={() => onPageChange(page)}
            disabled={disabled}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="common-pagination-button"
        onClick={handleNext}
        disabled={disabled || currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;
