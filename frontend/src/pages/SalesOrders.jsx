import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, Search } from "lucide-react"
import { toast } from "sonner"

// Mock data for products
const products = [
  { id: 1, name: "Pandora Moments Snake Chain Bracelet", price: 75.0, quantity: 25, category: "Bracelets" },
  { id: 2, name: "Sparkling Heart Halo Ring", price: 65.0, quantity: 40, category: "Rings" },
  { id: 3, name: "Timeless Elegance Earrings", price: 85.0, quantity: 18, category: "Earrings" },
  { id: 4, name: "Pandora Signature Logo Pendant Necklace", price: 99.0, quantity: 12, category: "Necklaces" },
  { id: 5, name: "Rose Gold Charm with Pink Crystal", price: 55.0, quantity: 60, category: "Charms" },
  { id: 6, name: "Pandora ME Link Chain Necklace", price: 120.0, quantity: 10, category: "Necklaces" },
]

// Mock data for sales orders
const initialOrders = [
  {
    id: 1,
    productName: "Pandora Moments Snake Chain Bracelet",
    quantitySold: 3,
    totalPrice: 225.0,
    orderDate: "2025-11-01 14:30:00",
  },
  {
    id: 2,
    productName: "Sparkling Heart Halo Ring",
    quantitySold: 2,
    totalPrice: 130.0,
    orderDate: "2025-11-02 10:15:00",
  },
  {
    id: 3,
    productName: "Timeless Elegance Earrings",
    quantitySold: 1,
    totalPrice: 85.0,
    orderDate: "2025-11-02 16:45:00",
  },
  {
    id: 4,
    productName: "Rose Gold Charm with Pink Crystal",
    quantitySold: 5,
    totalPrice: 275.0,
    orderDate: "2025-11-03 09:20:00",
  },
]

function ProductSelectionDialog({ onSelectProduct, selectedProduct }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (product) => {
    onSelectProduct(product)
    setIsOpen(false)
    setSearchQuery("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          {selectedProduct ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{selectedProduct.name}</span>
              <Badge variant="secondary" className="ml-2 shrink-0">
                Stock: {selectedProduct.quantity}
              </Badge>
            </div>
          ) : (
            <span className="text-muted-foreground">Select a product...</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Product</DialogTitle>
          <DialogDescription>
            Choose a product from your inventory to add to the order
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products found
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="w-full p-4 rounded-lg border border-border hover:bg-accent hover:border-primary transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base truncate">
                        {product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.category}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-lg font-bold text-primary">
                          ₱{product.price.toFixed(2)}
                        </span>
                        <Badge
                          variant={product.quantity > 10 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          <Package className="h-3 w-3 mr-1" />
                          {product.quantity} in stock
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function SalesOrders() {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantitySold, setQuantitySold] = useState("")

  const handleSubmit = () => {
    if (!selectedProduct || !quantitySold) {
      toast.error("Please select a product and enter quantity")
      return
    }

    const quantity = parseInt(quantitySold)
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0")
      return
    }

    if (quantity > selectedProduct.quantity) {
      toast.error("Insufficient stock")
      return
    }

    const totalPrice = selectedProduct.price * quantity
    const newOrder = {
      id: Math.max(...orders.map((o) => o.id), 0) + 1,
      productName: selectedProduct.name,
      quantitySold: quantity,
      totalPrice: totalPrice,
      orderDate: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    }

    setOrders([newOrder, ...orders])
    setSelectedProduct(null)
    setQuantitySold("")
  }

  return (
    <div className="w-full flex flex-col gap-6 mt-2 sm:mt-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* <ShoppingCart className="h-8 w-8 text-primary" /> */}
        <h1 className="text-2xl font-semibold">Sales/Orders</h1>
      </div>

      {/* Add New Order Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Order</CardTitle>
          <CardDescription>Create a new sales order by selecting a product and quantity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Product Selection Dialog */}
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="product">Product</Label>
              <ProductSelectionDialog
                onSelectProduct={setSelectedProduct}
                selectedProduct={selectedProduct}
              />
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <Label htmlFor="quantity_sold">Quantity Sold</Label>
              <Input
                id="quantity_sold"
                type="number"
                min="1"
                value={quantitySold}
                onChange={(e) => setQuantitySold(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            {/* Submit Button */}
            <div className="space-y-2">
              <Label className="invisible">Action</Label>
              <Button onClick={handleSubmit} className="w-full">
                Add Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Orders History</CardTitle>
          <CardDescription>View all completed sales orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Order ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[200px]">
                    Product Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">
                    Quantity Sold
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">
                    Total Price
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-40">
                    Order Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-24 text-center text-muted-foreground">
                      No sales orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle font-medium">{order.id}</td>
                      <td className="p-4 align-middle">{order.productName}</td>
                      <td className="p-4 align-middle">{order.quantitySold}</td>
                      <td className="p-4 align-middle font-semibold text-primary">
                        ₱{order.totalPrice.toFixed(2)}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground text-xs sm:text-sm">
                        {order.orderDate}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          {orders.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-primary">
                  ₱{orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Items Sold</p>
                <p className="text-2xl font-bold">
                  {orders.reduce((sum, order) => sum + order.quantitySold, 0)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}