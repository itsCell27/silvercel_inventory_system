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
import { API_BASE_URL } from "@/config";

export default function SalesReportPreview({ open, onOpenChange }) {
  const [reportData, setReportData] = useState([]);
  const [filteredReportData, setFilteredReportData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    if (open) {
      fetch(`${API_BASE_URL}/sales_report.php?preview=true`)
        .then(response => response.json())
        .then(data => {
          setReportData(data);
          setFilteredReportData(data);
          const years = [...new Set(data.map(item => new Date(item.order_date).getFullYear()))];
          setAvailableYears(years);
          setSelectedYear("all");
          setSelectedRows(data.map(row => row.order_id));
        })
        .catch(error => console.error("Error fetching sales report preview:", error));
    }
  }, [open]);

  useEffect(() => {
    if (selectedYear) {
      const filteredData = reportData.filter(item => new Date(item.order_date).getFullYear() === selectedYear);
      setFilteredReportData(filteredData);
    } else {
      setFilteredReportData(reportData);
    }
  }, [selectedYear, reportData]);

  const handleYearChange = (year) => {
    if (year === "all") {
      setSelectedYear(null);
    } else {
      setSelectedYear(parseInt(year));
    }
  };

  const handleDownload = () => {
    const yearQuery = selectedYear ? `years[]=${selectedYear}` : 'years[]=all';
    const orderIdsQuery = selectedRows.map(id => `order_ids[]=${id}`).join('&');
    window.location.href = `${API_BASE_URL}/sales_report.php?${yearQuery}&${orderIdsQuery}`;
  };

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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Sales Report Preview</DialogTitle>
          <DialogDescription>
            This is a preview of the sales report. You can download the full report in Excel format.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <div className="flex items-center space-x-2">
            <Select onValueChange={(value) => handleYearChange(value)} defaultValue={selectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All of the time</SelectItem>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}