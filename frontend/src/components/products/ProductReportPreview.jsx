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

export default function ProductReportPreview({ open, onOpenChange }) {
  const [reportData, setReportData] = useState([]);
  const [filteredReportData, setFilteredReportData] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    if (open) {
      fetch('http://localhost/silvercel_inventory_system/backend/api/products.php')
        .then(response => response.json())
        .then(data => {
          setReportData(data);
          setFilteredReportData(data);
          const categories = [...new Set(data.map(item => item.category))];
          setAvailableCategories(categories);
          setSelectedCategory("all");
          setSelectedRows(data.map(row => row.id));
        })
        .catch(error => console.error("Error fetching products preview:", error));
    }
  }, [open]);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== "all") {
      const filteredData = reportData.filter(item => item.category === selectedCategory);
      setFilteredReportData(filteredData);
    } else {
      setFilteredReportData(reportData);
    }
  }, [selectedCategory, reportData]);

  useEffect(() => {
      fetch('http://localhost/silvercel_inventory_system/backend/api/categories.php')
          .then(response => response.json())
          .then(data => setCategories(data));
  
      const categoryString = selectedCategories.length > 0 ? selectedCategories.join(',') : 'all';
      fetch(`http://localhost/silvercel_inventory_system/backend/api/products.php?category=${categoryString}`)
          .then(response => response.json())
          .then(data => setProducts(data));
  }, [selectedCategories]);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
        prev.includes(category) 
            ? prev.filter(c => c !== category) 
            : [...prev, category]
    );
  };

  const handleDownload = () => {
        const categoryString = selectedCategories.join(',');
        const url = `http://localhost/silvercel_inventory_system/backend/api/download_products.php?categories=${categoryString}`;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Product Report Preview</DialogTitle>
          <DialogDescription>
            This is a preview of the product report. You can download the full report in Excel format.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <div className="flex items-center space-x-2">
            <Select onValueChange={(value) => handleCategoryChange(value)} defaultValue={selectedCategory}>
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
                  <TableCell>{row.price}</TableCell>
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