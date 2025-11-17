import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Fuse from "fuse.js"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Spinner } from "@/components/ui/spinner"
import { API_BASE_URL } from "@/config";


export default function SalesReportPreview({ open, onOpenChange }) {
  const [reportData, setReportData] = useState([]);
  const [filteredReportData, setFilteredReportData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  //const [dateRange, setDateRange] = useState("all")
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)

  const [loading, setLoading] = useState(false)



  useEffect(() => {
      if (open) {
        setLoading(true) // start loading
        fetch(`${API_BASE_URL}/sales_report.php?preview=true`)
          .then(response => response.json())
          .then(data => {
            setReportData(data);
            setFilteredReportData(data);
            setSelectedRows(data.map(row => row.order_id));
          })
          .catch(error => console.error("Error fetching sales report preview:", error));
      }
    }, [open]);

  useEffect(() => {
    let data = [...reportData]

    // Apply "From" date (if any)
    if (fromDate) {
      data = data.filter(item => new Date(item.order_date) >= fromDate)
    }

    // Apply "To" date (if any)
    if (toDate) {
      data = data.filter(item => new Date(item.order_date) <= toDate)
    }

    // Fuse.js (date only)
    const fuse = new Fuse(data, fuseOptions)
    data = data.filter(item => item.order_date) // optional safety

    setFilteredReportData(data)
    setSelectedRows(data.map(r => r.order_id))
  }, [fromDate, toDate, reportData])


  // Fuse.js configured to match ONLY order_date
  const fuseOptions = {
    includeScore: false,
    threshold: 0.4,
    keys: ["order_date"]
  }

  const handleDownload = () => {
    const from = fromDate ? format(fromDate, "yyyy-MM-dd") : "all"
    const to = toDate ? format(toDate, "yyyy-MM-dd") : "all"

    const orderIdsQuery = selectedRows.map(id => `order_ids[]=${id}`).join("&")

    window.location.href = `${API_BASE_URL}/sales_report.php?from=${from}&to=${to}&${orderIdsQuery}`
  }


  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredReportData.map(row => row.order_id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (orderId) => {
    setSelectedRows(prevSelectedRows =>
      prevSelectedRows.includes(orderId)
        ? prevSelectedRows.filter(id => id !== orderId)
        : [...prevSelectedRows, orderId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-auto">
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
              <Button
                variant="outline"
                className="w-full sm:w-[200px] justify-start text-left"
              >
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
              <Button
                variant="outline"
                className="w-full sm:w-[200px] justify-start text-left"
              >
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

        <div className="overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={selectedRows.length === filteredReportData.length && filteredReportData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Quantity Sold</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Order Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReportData.map((row, index) => (
                <TableRow key={row.order_id} className="p-0">
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
          <Button 
            onClick={handleDownload} 
            disabled={!loading || selectedRows.length === 0}
          >
            {!loading ? <Spinner /> : <Download className="h-4 w-4 mr-2" />}
            Download Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}