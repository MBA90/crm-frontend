import React from "react";
import { Icon } from "@/components/ui/Icon";

const DEFAULT_PAGE_SIZE_OPTIONS = [2, 5, 10, 20, 50];

interface PaginationProps {
  /** 0-based current page index. */
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
}

/** Prev/next pager with an optional page-size selector for API-backed, page-based listings. */
export class Pagination extends React.Component<PaginationProps> {
  render(): React.ReactNode {
    const {
      page,
      totalPages,
      totalElements,
      pageSize,
      onPageChange,
      onPageSizeChange,
      pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
      disabled,
    } = this.props;
    if (totalElements === 0) return null;

    const start = page * pageSize + 1;
    const end = Math.min(totalElements, start + pageSize - 1);

    return (
      <div className="row" style={{ justifyContent: "space-between", marginTop: 18, flexWrap: "wrap", gap: 12 }}>
        <span className="cell-sub">
          {start}–{end} of {totalElements}
        </span>
        <div className="row" style={{ gap: 16 }}>
          {onPageSizeChange && (
            <div className="row" style={{ gap: 6 }}>
              <span className="cell-sub">Rows per page</span>
              <select
                value={pageSize}
                disabled={disabled}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                style={{
                  height: 32,
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0 8px",
                  fontSize: 12.5,
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="row" style={{ gap: 8 }}>
            <button
              className="btn btn--ghost btn--sm"
              disabled={disabled || page <= 0}
              onClick={() => onPageChange(page - 1)}
            >
              <Icon name="back" size={14} />
              Prev
            </button>
            <span className="cell-sub">
              Page {page + 1} of {Math.max(totalPages, 1)}
            </span>
            <button
              className="btn btn--ghost btn--sm"
              disabled={disabled || page + 1 >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <Icon name="back" size={14} className="pagination__next-icon" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}
