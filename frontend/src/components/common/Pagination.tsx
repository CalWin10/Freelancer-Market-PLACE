import { classNames } from "../../utils/classNames";
import Icon from "./Icon";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

function getPaginationItems(page: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index);

  const items: PaginationItem[] = [0];
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages - 2, page + 1);

  if (start > 1) items.push("start-ellipsis");
  for (let current = start; current <= end; current += 1) items.push(current);
  if (end < totalPages - 2) items.push("end-ellipsis");
  items.push(totalPages - 1);
  return items;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className,
  ariaLabel = "Pagination",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const items = getPaginationItems(safePage, totalPages);

  return (
    <nav className={classNames("pagination", className)} aria-label={ariaLabel}>
      <button
        className="pagination__button pagination__button--previous"
        type="button"
        disabled={disabled || safePage === 0}
        onClick={() => onPageChange(safePage - 1)}
        aria-label="Go to previous page"
      >
        <Icon name="chevron-left" size={17} />
        <span>Previous</span>
      </button>

      <div className="pagination__pages">
        {items.map((item) => item === "start-ellipsis" || item === "end-ellipsis" ? (
          <span className="pagination__ellipsis" key={item} aria-hidden="true">…</span>
        ) : (
          <button
            className={classNames("pagination__page", item === safePage && "pagination__page--active")}
            type="button"
            key={item}
            disabled={disabled}
            onClick={() => onPageChange(item)}
            aria-label={`Go to page ${item + 1}`}
            aria-current={item === safePage ? "page" : undefined}
          >
            {item + 1}
          </button>
        ))}
      </div>

      <span className="pagination__summary">Page {safePage + 1} of {totalPages}</span>

      <button
        className="pagination__button pagination__button--next"
        type="button"
        disabled={disabled || safePage === totalPages - 1}
        onClick={() => onPageChange(safePage + 1)}
        aria-label="Go to next page"
      >
        <span>Next</span>
        <Icon name="chevron-right" size={17} />
      </button>
    </nav>
  );
}
