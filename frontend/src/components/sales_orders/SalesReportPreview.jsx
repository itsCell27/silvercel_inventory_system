import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import Fuse from "fuse.js";
import { API_BASE_URL } from "@/config";

export default function SalesReportPreview({ open, onOpenChange }) {
  const [reportData, setReportData] = useState([]);
  const [filteredReportData, setFilteredReportData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null); // for drag-to-scroll

  useEffect(() => {
    if (open) {
      setLoading(true); // start loading indicator
      fetch(`${API_BASE_URL}/sales_report.php?preview=true`)
        .then((response) => response.json())
        .then((data) => {
          setReportData(data);
          setFilteredReportData(data);
          setSelectedRows(data.map((row) => row.order_id));
        })
        .catch((error) => console.error("Error fetching sales report preview:", error))
        .finally(() => {
          // keep the loading state logical — set false since fetch complete
          setLoading(false);
        });
    }
  }, [open]);

  useEffect(() => {
    let data = [...reportData];

    // Apply "From" date (if any)
    if (fromDate) {
      data = data.filter((item) => new Date(item.order_date) >= fromDate);
    }

    // Apply "To" date (if any)
    if (toDate) {
      data = data.filter((item) => new Date(item.order_date) <= toDate);
    }

    // Fuse.js (date only) - though currently unused for search UI, we keep config
    const fuse = new Fuse(data, fuseOptions);
    data = data.filter((item) => item.order_date); // optional safety

    setFilteredReportData(data);
    setSelectedRows(data.map((r) => r.order_id));
  }, [fromDate, toDate, reportData]);

  // Fuse.js configured to match ONLY order_date
  const fuseOptions = {
    includeScore: false,
    threshold: 0.4,
    keys: ["order_date"],
  };

  const handleDownload = () => {
    const from = fromDate ? format(fromDate, "yyyy-MM-dd") : "all";
    const to = toDate ? format(toDate, "yyyy-MM-dd") : "all";

    const orderIdsQuery = selectedRows.map((id) => `order_ids[]=${id}`).join("&");

    window.location.href = `${API_BASE_URL}/sales_report.php?from=${from}&to=${to}&${orderIdsQuery}`;
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredReportData.map((row) => row.order_id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (orderId) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(orderId)
        ? prevSelectedRows.filter((id) => id !== orderId)
        : [...prevSelectedRows, orderId]
    );
  };

  // ---------- Drag-to-scroll handlers (desktop) ----------
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const onPointerDown = (e) => {
      // only react to primary button / touch
      if (e.pointerType === "mouse" && e.button !== 0) return;
      isDown = true;
      el.setPointerCapture?.(e.pointerId);
      el.classList.add("dragging"); // will show grabbing cursor
      startX = e.clientX;
      scrollLeft = el.scrollLeft;
    };

    const onPointerMove = (e) => {
      if (!isDown) return;
      const x = e.clientX;
      const walk = (x - startX) * 1; // scroll-fast multiplier (1 = natural)
      el.scrollLeft = scrollLeft - walk;
    };

    const onPointerUpOrCancel = (e) => {
      if (!isDown) return;
      isDown = false;
      el.releasePointerCapture?.(e.pointerId);
      el.classList.remove("dragging");
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUpOrCancel);
    window.addEventListener("pointercancel", onPointerUpOrCancel);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUpOrCancel);
      window.removeEventListener("pointercancel", onPointerUpOrCancel);
    };
  }, [scrollRef.current]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Sales Report Preview</DialogTitle>
          <DialogDescription>
            This is a preview of the sales report. You can download the full report in Excel format.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3">
          {/* FROM DATE */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[200px] justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "MMM dd, yyyy") : "From (Start Date)"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto max-w-[320px]" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                fromYear={2000}
                toYear={new Date().getFullYear()}
                selected={fromDate}
                onSelect={(date) => setFromDate(date || null)}
              />
            </PopoverContent>
          </Popover>

          {/* TO DATE */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[200px] justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "MMM dd, yyyy") : "To (End Date)"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto max-w-[320px]" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                fromYear={2000}
                toYear={new Date().getFullYear()}
                selected={toDate}
                onSelect={(date) => setToDate(date || null)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Scrollable table wrapper
            - pr-3 reserves space for scrollbar so it won't overlap
            - scrollbarGutter stable avoids layout shift when scrollbar appears
            - WebkitOverflowScrolling for smooth native touch scrolling
            - .thin-scrollbar class adds custom thin styling (WebKit + Firefox)
        */}
        <div
          ref={scrollRef}
          className="thin-scrollbar overflow-auto max-h-96 pr-3"
          style={{
            scrollbarGutter: "stable",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={
                      selectedRows.length === filteredReportData.length &&
                      filteredReportData.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>No.</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Quantity Sold</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Order Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReportData.map((row, index) => (
                <TableRow key={row.order_id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.order_id)}
                      onCheckedChange={() => handleSelectRow(row.order_id)}
                    />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="whitespace-normal">{row.product_name}</TableCell>
                  <TableCell>{row.quantity_sold}</TableCell>
                  <TableCell>{row.total_price}</TableCell>
                  <TableCell>{row.order_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleDownload} disabled={loading || selectedRows.length === 0} className="text-white">
            {loading ? <Spinner /> : <Download className="h-4 w-4 mr-2" />}
            Download Report
          </Button>
        </div>

        {/* ===== custom scrollbar CSS (scoped via class .thin-scrollbar) =====
            - WebKit (Chrome, Edge, Safari): use pseudo selectors
            - Firefox: scrollbar-width + scrollbar-color
            - .dragging: cursor feedback while dragging
        */}
        <style>{`
          /* Scrollbar variables */
          .thin-scrollbar {
            --scrollbar-thumb: rgba(255,255,255,0.18);  /* more visible thumb */
            --scrollbar-track: transparent;
          }

          /* WebKit (Chrome, Edge, Safari) */
          .thin-scrollbar::-webkit-scrollbar {
            width: 14px;      /* MUCH thicker */
            height: 14px;
          }

          .thin-scrollbar::-webkit-scrollbar-track {
            background: var(--scrollbar-track);
          }

          .thin-scrollbar::-webkit-scrollbar-thumb {
            background-color: var(--scrollbar-thumb);
            border-radius: 10px;
            border: 4px solid transparent; /* more padding for a chunkier look */
            background-clip: padding-box;
          }

          /* COMPLETELY remove hover shadow/highlight */
          .thin-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: var(--scrollbar-thumb) !important;
          }

          /* Firefox scrollbar styling */
          .thin-scrollbar {
            scrollbar-width: auto; /* thicker in Firefox */
            scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
          }

          /* Dragging cursor feedback */
          .thin-scrollbar.dragging {
            cursor: grabbing;
            user-select: none;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}