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
import { ShoppingCart, Package, Search, Pencil, Trash2, Calendar as CalendarIcon, Clock, Download } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar" // shadcn Calendar
import ProductSelectionDialog from "@/components/sales_orders/ProductSelectionDialog"

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

  // Edit Order Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isEditDateTimePopoverOpen, setIsEditDateTimePopoverOpen] = useState(false)
  const [editOrderDate, setEditOrderDate] = useState(null)
  const [editOrderTime, setEditOrderTime] = useState("00:00")

  const [isDateTimePopoverOpen, setIsDateTimePopoverOpen] = useState(false)

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
      product_id: selectedProduct.id, // Changed: use product_id
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
    const d = new Date(order.order_date)
    setEditOrderDate(d)
    setEditOrderTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`)
  }

  const handleUpdate = () => {
    if (!editOrderDate) {
      toast.error("Please select an order date.");
      return;
    }

    const updatedOrderDate = format(editOrderDate, "yyyy-MM-dd HH:mm:ss");

    if (new Date(updatedOrderDate).getFullYear() > new Date().getFullYear()) {
      toast.error("Cannot select a future year.");
      return;
    }

    const originalOrder = orders.find((o) => o.id === selectedOrder.id);
    const product = products.find((p) => p.id === selectedOrder.product_id); // Changed: use product_id

    console.log("Original Order:", originalOrder);

    if (!originalOrder) {
      toast.error("Order not found.");
      return;
    }

    if (!product) {
      toast.warning("Product no longer exists in current inventory, but the order can still be updated.");
    }


    if (selectedOrder.quantity_sold <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }

    const newQuantity = parseInt(selectedOrder.quantity_sold, 10);
    const originalQuantity = parseInt(originalOrder.quantity_sold, 10);
    let availableStock = 0;
    let maxAllowed = Infinity;

    // If the product still exists, calculate actual stock.
    if (product) {
      availableStock = parseInt(product.quantity || 0, 10);
      maxAllowed = availableStock + parseInt(originalOrder.quantity_sold, 10);
    } else {
      // Product deleted or missing, just skip stock validation.
      toast.warning("Product not found in inventory. Skipping stock validation.");
    }

    // Only run validation if product exists
    if (product && newQuantity > maxAllowed) {
      toast.error(`Only ${maxAllowed} items are available in stock.`);
      return;
    }

    const updatedOrder = {
      ...selectedOrder,
      order_date: updatedOrderDate
    };

    fetch('http://localhost/silvercel_inventory_system/backend/api/sales_orders.php', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedOrder),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message.includes("successfully")) {
          setOrders(
            orders.map((order) =>
              order.id === selectedOrder.id ? { ...updatedOrder, quantity_sold: newQuantity } : order
            )
          )
          setIsEditDialogOpen(false)
          toast.success("Order updated successfully")
          fetch('http://localhost/silvercel_inventory_system/backend/api/products.php')
              .then(response => response.json())
              .then(data => setProducts(data))
              .catch(error => console.error("Error fetching products:", error));
        } else {
            toast.error(data.message || "Failed to update order");
        }
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
          <Download className="h-4 w-4 mr-0 sm:mr-1" />
          <span className="hidden sm:block">Download Report</span>
        </Button>
      </div>

      {/* Add New Order Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Order</CardTitle>
          <CardDescription>Create a new sales order by selecting a product and quantity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
              <Popover open={isDateTimePopoverOpen} onOpenChange={setIsDateTimePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <div className="flex items-center gap-2 w-full">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="truncate">
                        {orderDate ? format(orderDate, "dd/MM/yyyy hh:mm a") : "Select date & time"}
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
                        <div className="relative w-full">
                          <Input
                            type="time"
                            value={orderTime}
                            onChange={(e) => {
                              const t = e.target.value
                              setOrderTime(t)
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
                            className="
                              w-fit pr-7 md:pr-10
                              text-foreground
                              dark:text-foreground
                              [&::-webkit-calendar-picker-indicator]:opacity-0
                              [&::-webkit-calendar-picker-indicator]:absolute
                              [&::-webkit-calendar-picker-indicator]:right-0
                              [&::-webkit-calendar-picker-indicator]:w-full
                              [&::-webkit-calendar-picker-indicator]:h-full
                              [&::-webkit-calendar-picker-indicator]:cursor-pointer
                            "
                          />
                          <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
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

                      {/* SAVE / CANCEL actions */}
                      <div className="mt-3 flex justify-end gap-2 col-span-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // just close without saving changes
                            setIsDateTimePopoverOpen(false)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="text-white"
                          onClick={() => {
                            // ensure orderDate contains the selected date combined with orderTime
                            if (!orderDate) {
                              // if nothing selected, default to now
                              const now = new Date()
                              setOrderDate(now)
                              setOrderTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`)
                            } else {
                              // combine current orderDate and orderTime to make sure time is saved
                              const d = new Date(orderDate)
                              const [hh = "00", mm = "00"] = orderTime ? orderTime.split(":") : ["00", "00"]
                              d.setHours(parseInt(hh, 10))
                              d.setMinutes(parseInt(mm, 10))
                              d.setSeconds(0)
                              d.setMilliseconds(0)
                              setOrderDate(d)
                            }
                            setIsDateTimePopoverOpen(false)
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Submit Button */}
            <div className="space-y-2">
              <Label className="invisible">Action</Label>
              <Button onClick={handleSubmit} className="w-full text-white">
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
                    No.
                  </th>
                   <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[100px]">
                    Sales ID
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
                  orders.map((order, index) => {

                      const order_number = index + 1

                      // {orders.length - index}
                    
                      return (
                        <tr
                        key={order.id}
                        className="border-b border-border transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle font-medium">{order_number}</td>
                          <td className="p-4 align-middle font-medium">{order.sales_id}</td>
                          <td className="p-4 align-middle">{order.product_name}</td>
                          <td className="p-4 align-middle">{order.quantity_sold}</td>
                          <td className="p-4 align-middle font-semibold text-primary">
                            ₱{parseFloat(order.total_price).toFixed(2)}
                          </td>
                          <td className="p-4 align-middle text-muted-foreground text-xs sm:text-sm">
                            {new Date(order.order_date).toLocaleString()}
                          </td>
                          <td className="p-4 align-middle flex">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(order)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Edit Order Dialog */}
          {selectedOrder && (() => {
            console.log(selectedOrder)
            console.log(products)
            const originalOrder = orders.find((o) => o.id === selectedOrder.id);
            const product = products.find((p) => p.id === selectedOrder.product_id); // Changed: use product_id
            const maxAllowed = product && originalOrder ? parseInt(product.quantity, 10) + parseInt(originalOrder.quantity_sold, 10) : Infinity;
            console.log(product)
            //console.log(maxAllowed)

            return (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-sm md:text-xl">Edit Sale #{selectedOrder.sales_id}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="product_name" className="sm:text-right text-xs sm:text-sm">
                      Product Name
                    </Label>
                    <Input
                      id="product_name"
                      value={selectedOrder.product_name}
                      readOnly
                      className="col-span-3 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity_sold" className="sm:text-right text-xs sm:text-sm">
                      Quantity
                    </Label>
                    <Input
                      id="quantity_sold"
                      type="number"
                      value={selectedOrder.quantity_sold}
                      onChange={(e) => {
                        // NEW: Auto-calculate total price when quantity changes
                        const newQtyRaw = e.target.value
                        const newQty = newQtyRaw === "" ? "" : parseInt(newQtyRaw, 10)
                        let newTotal = selectedOrder.total_price

                        if (product && newQty !== "" && !isNaN(newQty)) {
                          const price = parseFloat(product.price) || 0
                          newTotal = price * newQty
                        }

                        setSelectedOrder({
                          ...selectedOrder,
                          quantity_sold: newQtyRaw,
                          total_price: newTotal, // updates total price automatically
                        })
                      }}
                      className="col-span-3 text-xs sm:text-sm"
                    />

                  </div>
                    {product && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div className="col-start-2 col-span-3 text-sm text-muted-foreground">
                          Available stock: {maxAllowed}
                        </div>
                      </div>
                    )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="total_price" className="sm:text-right text-xs sm:text-sm">
                      Total Price
                    </Label>
                    <Input
                      id="total_price"
                      type="number"
                      value={selectedOrder.total_price}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, total_price: e.target.value })
                      }
                      className="col-span-3 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="order_date" className="sm:text-right text-xs sm:text-sm">
                      Order Date
                    </Label>
                    {/* --- Date & Time selector (Dialog replacement for Popover) --- */}
                    <Dialog open={isEditDateTimePopoverOpen} onOpenChange={setIsEditDateTimePopoverOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="col-span-3 justify-start text-left text-xs sm:text-sm">
                          <div className="flex items-center gap-2 w-full">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="truncate">
                              {editOrderDate ? format(editOrderDate, "dd/MM/yyyy hh:mm a") : "Select date & time"}
                            </span>
                          </div>
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="p-0 sm:p-0 max-w-none sm:max-w-[20rem] w-auto">
                        <DialogHeader>
                          <DialogTitle></DialogTitle>
                        </DialogHeader>

                        <div className="p-4 w-72 max-h-[80vh] overflow-hidden">
                          <div className="h-full overflow-y-auto overflow-x-hidden">
                            <Calendar
                              mode="single"
                              selected={editOrderDate}
                              onSelect={(date) => {
                                if (!date) {
                                  setEditOrderDate(null)
                                  return
                                }
                                const selected = Array.isArray(date) ? date[0] : date
                                const [hh = "00", mm = "00"] = editOrderTime ? editOrderTime.split(":") : ["00", "00"]
                                const combined = new Date(selected)
                                combined.setHours(parseInt(hh, 10))
                                combined.setMinutes(parseInt(mm, 10))
                                combined.setSeconds(0)
                                combined.setMilliseconds(0)
                                setEditOrderDate(combined)
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
                                <div className="relative w-full">
                                  <Input
                                    type="time"
                                    value={editOrderTime}
                                    onChange={(e) => {
                                      const t = e.target.value
                                      setEditOrderTime(t)
                                      if (editOrderDate) {
                                        const d = new Date(editOrderDate)
                                        const [hh = "00", mm = "00"] = t.split(":")
                                        d.setHours(parseInt(hh, 10))
                                        d.setMinutes(parseInt(mm, 10))
                                        d.setSeconds(0)
                                        d.setMilliseconds(0)
                                        setEditOrderDate(d)
                                      }
                                    }}
                                    className="
                                      w-fit pr-7 md:pr-10
                                      text-foreground
                                      dark:text-foreground
                                      [&::-webkit-calendar-picker-indicator]:opacity-0
                                      [&::-webkit-calendar-picker-indicator]:absolute
                                      [&::-webkit-calendar-picker-indicator]:right-0
                                      [&::-webkit-calendar-picker-indicator]:w-full
                                      [&::-webkit-calendar-picker-indicator]:h-full
                                      [&::-webkit-calendar-picker-indicator]:cursor-pointer
                                    "
                                  />
                                  <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                </div>
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
                                      setEditOrderDate(now)
                                      setEditOrderTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`)
                                    }}
                                    className="flex-1"
                                  >
                                    Now
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditOrderDate(null)
                                      const now = new Date()
                                      setEditOrderTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`)
                                    }}
                                    className="flex-1"
                                  >
                                    Clear
                                  </Button>
                                </div>
                              </div>

                              {/* SAVE / CANCEL actions */}
                              <div className="mt-3 flex justify-end gap-2 col-span-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // just close without saving changes
                                    setIsEditDateTimePopoverOpen(false)
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="text-white"
                                  onClick={() => {
                                    // ensure editOrderDate contains the selected date combined with editOrderTime
                                    if (!editOrderDate) {
                                      const now = new Date()
                                      setEditOrderDate(now)
                                      setEditOrderTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`)
                                    } else {
                                      const d = new Date(editOrderDate)
                                      const [hh = "00", mm = "00"] = editOrderTime ? editOrderTime.split(":") : ["00", "00"]
                                      d.setHours(parseInt(hh, 10))
                                      d.setMinutes(parseInt(mm, 10))
                                      d.setSeconds(0)
                                      d.setMilliseconds(0)
                                      setEditOrderDate(d)
                                    }

                                    // commit chosen datetime to selectedOrder (same behavior as original)
                                    setSelectedOrder({
                                      ...selectedOrder,
                                      order_date: format(editOrderDate || new Date(), "yyyy-MM-dd HH:mm:ss"),
                                    })
                                    setIsEditDateTimePopoverOpen(false)
                                  }}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                  </div>
                </div>
                <Button onClick={handleUpdate} className="text-white">Save Changes</Button>
              </DialogContent>
            </Dialog>
          )})()}

          {/* Summary Section */}
          {orders.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="sm:text-2xl text-lg font-bold">{orders.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="sm:text-2xl text-lg font-bold text-primary">
                  ₱{orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0).toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Items Sold</p>
                <p className="sm:text-2xl text-lg font-bold">
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
