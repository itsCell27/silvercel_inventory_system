import { useState, useEffect } from "react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, Search, Pencil, Trash2, Calendar as CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar" // shadcn Calendar

function ProductSelectionDialog({ onSelectProduct, selectedProduct, products }) {
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
                          ₱{parseFloat(product.price).toFixed(2)}
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
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantitySold, setQuantitySold] = useState("")
  const [orderDate, setOrderDate] = useState(null) // Date object
  const [orderTime, setOrderTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });


  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetch('http://localhost/silvercel_inventory_system/backend/api/sales_orders.php')
        .then(response => response.json())
        .then(data => setOrders(data))
        .catch(error => console.error("Error fetching sales orders:", error));

    fetch('http://localhost/silvercel_inventory_system/backend/api/products.php')
        .then(response => response.json())
        .then(data => setProducts(data))
        .catch(error => console.error("Error fetching products:", error));
  }, []);

  const handleSubmit = () => {
    if (!selectedProduct || !quantitySold || !orderDate) {
      toast.error("Please fill all fields")
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

    const totalPrice = parseFloat(selectedProduct.price) * quantity
    const newOrder = {
      product_name: selectedProduct.name,
      quantity_sold: quantity,
      total_price: totalPrice,
      order_date: orderDate ? format(orderDate, "yyyy-MM-dd HH:mm:ss") : new Date().toISOString().slice(0, 19).replace('T', ' '),
    }

    fetch('http://localhost/silvercel_inventory_system/backend/api/sales_orders.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            setOrders([data, ...orders]);
            toast.success("Order added successfully");
            // Refresh products list to get updated quantity
            fetch('http://localhost/silvercel_inventory_system/backend/api/products.php')
                .then(response => response.json())
                .then(data => setProducts(data))
                .catch(error => console.error("Error fetching products:", error));
        } else {
            toast.error(data.message || "An unknown error occurred.");
        }
    });

    setSelectedProduct(null)
    setQuantitySold("")
    setOrderDate(null)
  }

  const handleEditClick = (order) => {
    setSelectedOrder(order)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    fetch('http://localhost/silvercel_inventory_system/backend/api/sales_orders.php', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedOrder),
    })
      .then((response) => response.json())
      .then(() => {
        setOrders(
          orders.map((order) =>
            order.id === selectedOrder.id ? selectedOrder : order
          )
        )
        setIsEditDialogOpen(false)
        toast.success("Order updated successfully")
      })
      .catch((error) => {
        console.error("Error updating order:", error)
        toast.error("Failed to update order")
      })
  }

  const handleDelete = (id) => {
    fetch(`http://localhost/silvercel_inventory_system/backend/api/sales_orders.php?id=${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then(() => {
        setOrders(orders.filter((order) => order.id !== id));
        toast.success("Order deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order");
      });
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-2 sm:mt-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Sales/Orders</h1>
        <Button 
          variant="outline"
          onClick={() => window.location.href='http://localhost/silvercel_inventory_system/backend/api/sales_report.php'}>
          Download Report
        </Button>
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
                products={products}
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

            {/* Order Date selector (new) */}
            <div className="space-y-2">
              <Label htmlFor="order_date">Order Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <div className="flex items-center gap-2 w-full">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="truncate">
                        {orderDate ? format(orderDate, "PPP p") : "Select date & time"}
                      </span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 w-72">
                    <Calendar
                      mode="single"
                      selected={orderDate}
                      onSelect={(date) => {
                        if (!date) {
                          setOrderDate(null)
                          return
                        }
                        const selected = Array.isArray(date) ? date[0] : date
                        // combine with current orderTime (HH:mm) to produce a Date with time
                        const [hh = "00", mm = "00"] = orderTime ? orderTime.split(":") : ["00", "00"]
                        const combined = new Date(selected)
                        combined.setHours(parseInt(hh, 10))
                        combined.setMinutes(parseInt(mm, 10))
                        combined.setSeconds(0)
                        combined.setMilliseconds(0)
                        setOrderDate(combined)
                      }}

                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      disabled={(date) => date > new Date()}
                    />

                    {/* Time input */}
                    <div className="mt-3 grid grid-cols-2 gap-2 items-center">
                      <div className="flex flex-col">
                        <Label className="text-sm">Time</Label>
                        <Input
                          type="time"
                          value={orderTime}
                          onChange={(e) => {
                            const t = e.target.value
                            setOrderTime(t)
                            // if a date is already selected, update its time immediately
                            if (orderDate) {
                              const d = new Date(orderDate)
                              const [hh = "00", mm = "00"] = t.split(":")
                              d.setHours(parseInt(hh, 10))
                              d.setMinutes(parseInt(mm, 10))
                              d.setSeconds(0)
                              d.setMilliseconds(0)
                              setOrderDate(d)
                            }
                          }}
                          className="w-full"
                        />
                      </div>

                      {/* Quick buttons */}
                      <div className="flex flex-col">
                        <Label className="text-sm invisible">Actions</Label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const now = new Date()
                              setOrderDate(now)
                              setOrderTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`)
                            }}
                            className="flex-1"
                          >
                            Now
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setOrderDate(null)
                              const now = new Date()
                              setOrderTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`)
                            }}
                            className="flex-1"
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-24 text-center text-muted-foreground">
                      No sales orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr
                      key={order.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle font-medium">{orders.length - index}</td>
                      <td className="p-4 align-middle">{order.product_name}</td>
                      <td className="p-4 align-middle">{order.quantity_sold}</td>
                      <td className="p-4 align-middle font-semibold text-primary">
                        ₱{parseFloat(order.total_price).toFixed(2)}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground text-xs sm:text-sm">
                        {new Date(order.order_date).toLocaleString()}
                      </td>
                      <td className="p-4 align-middle">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(order)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Edit Order Dialog */}
          {selectedOrder && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Order #{selectedOrder.id}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="product_name" className="text-right">
                      Product Name
                    </Label>
                    <Input
                      id="product_name"
                      value={selectedOrder.product_name}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, product_name: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity_sold" className="text-right">
                      Quantity
                    </Label>
                    <Input
                      id="quantity_sold"
                      type="number"
                      value={selectedOrder.quantity_sold}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, quantity_sold: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="total_price" className="text-right">
                      Total Price
                    </Label>
                    <Input
                      id="total_price"
                      type="number"
                      value={selectedOrder.total_price}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, total_price: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="order_date" className="text-right">
                      Order Date
                    </Label>
                    <Input
                      id="order_date"
                      type="datetime-local"
                      value={selectedOrder.order_date ? new Date(selectedOrder.order_date).toISOString().slice(0, 16) : ''}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, order_date: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <Button onClick={handleUpdate}>Save Changes</Button>
              </DialogContent>
            </Dialog>
          )}

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
                  ₱{orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0).toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Items Sold</p>
                <p className="text-2xl font-bold">
                  {orders.reduce((sum, order) => sum + parseInt(order.quantity_sold), 0)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
