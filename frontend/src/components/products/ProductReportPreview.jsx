import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

export default function ProductReportPreview({ open, onOpenChange }) {
  const [reportData, setReportData] = useState([]);
  const [filteredReportData, setFilteredReportData] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    if (open) {
      fetch(`${API_BASE_URL}/products.php`)
        .then(response => response.json())
        .then(data => {
          if (Array.isArray(data)) {
            const productsWithNumericPrices = data.map(product => ({
                ...product,
                price: parseFloat(product.price)
            }));
            setReportData(productsWithNumericPrices);
            setFilteredReportData(productsWithNumericPrices);
            const categories = [...new Set(data.map(item => item.category))];
            setAvailableCategories(categories);
            setSelectedRows(data.map(row => row.id));
          } else {
            console.error("Fetched data is not an array:", data);
            setReportData([]);
          }
        })
        .catch(error => console.error("Error fetching products preview:", error));
    }
  }, [open]);

  useEffect(() => {
    let newFilteredData;
    if (selectedCategory === "all") {
      newFilteredData = reportData;
    } else {
      newFilteredData = reportData.filter(item => item.category === selectedCategory);
    }
    setFilteredReportData(newFilteredData);
    setSelectedRows(newFilteredData.map(row => row.id));
  }, [selectedCategory, reportData]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleDownload = () => {
    const productIds = selectedRows.join(',');
    const category = selectedCategory;
    const url = `${API_BASE_URL}/product_report.php?category=${category}&product_ids=${productIds}`;
    window.location.href = url;
  };
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredReportData.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (productId) => {
    setSelectedRows(prevSelectedRows =>
      prevSelectedRows.includes(productId)
        ? prevSelectedRows.filter(id => id !== productId)
        : [...prevSelectedRows, productId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="min-w-[90vw] sm:min-w-[80vw] lg:min-w-[60vw]">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Product Report Preview</DialogTitle>
          <DialogDescription>
            Select products and filter by category before downloading the report.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <div className="flex items-center space-x-2">
            <Select onValueChange={handleCategoryChange} value={selectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {availableCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
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
                <TableHead>ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReportData.map((row, index) => (
                <TableRow key={row.id} className="p-0">
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={() => handleSelectRow(row.id)}
                    />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="whitespace-normal">{row.name}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>₱{row.price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleDownload} disabled={selectedRows.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}