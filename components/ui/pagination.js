import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DOTS = "…";

const toInt = (v, d = 1) => {
  const n = typeof v === "number" ? v : parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const range = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

function getPaginationRange(totalPages, currentPage, siblingCount) {
  const total = toInt(totalPages, 1);
  const curr = clamp(toInt(currentPage, 1), 1, total);
  const sib = Math.max(toInt(siblingCount, 1), 0);

  const totalPageNumbers = sib * 2 + 5;
  if (total <= totalPageNumbers) return range(1, total);

  const left = Math.max(curr - sib, 2);
  const right = Math.min(curr + sib, total - 1);

  const showLeftDots = left > 2;
  const showRightDots = right < total - 1;

  const pages = [1];
  if (showLeftDots) pages.push(DOTS);
  pages.push(...range(left, right));
  if (showRightDots) pages.push(DOTS);
  pages.push(total);
  return pages;
}

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  siblingCount = 1,
}) {
  const total = Math.max(1, toInt(totalPages, 1));
  const curr = clamp(toInt(currentPage, 1), 1, total);

  if (total < 1) return null;

  const goTo = (p) => {
    const next = clamp(toInt(p, curr), 1, total);
    if (next !== curr) onPageChange?.(next); // 1-based
  };

  const pages = getPaginationRange(total, curr, siblingCount);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Trang <strong>{curr}</strong> / {total}
      </span>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goTo(curr - 1)}
          disabled={curr === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pages.map((p, i) =>
          p === DOTS ? (
            <span key={`dots-${i}`} className="px-2 text-muted-foreground">
              {DOTS}
            </span>
          ) : (
            <Button
              key={p}
              variant={p === curr ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-9 h-9 p-0",
                p === curr && "bg-blue-600 text-white hover:bg-blue-700"
              )}
              onClick={() => goTo(p)}
              aria-current={p === curr ? "page" : undefined}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => goTo(curr + 1)}
          disabled={curr === total}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
