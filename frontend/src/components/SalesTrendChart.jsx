"use client"
import { useState, useEffect } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import axios from "axios"
import { API_BASE_URL } from "@/config"

// 🧩 Debounce resize to prevent laggy re-renders
function useDebouncedWindowWidth(delay = 200) {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    let timeout
    const handleResize = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => setWidth(window.innerWidth), delay)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [delay])

  return width
}

const chartConfig = {
  sales: {
    label: "Sales",
  },
  total_sales: {
    label: "Total Sales (₱)",
    color: "var(--chart-1)",
  },
  items_sold: {
    label: "Items Sold",
    color: "var(--chart-5)",
  },
}

export function SalesTrendChart() {
  const [timeRange, setTimeRange] = useState("90d")
  const width = useDebouncedWindowWidth()
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/sales_data.php?timeRange=${timeRange}`
        );
       
        setChartData(response.data);
        setLoading(false);
      } catch (error) {
        
        setError(new Error(error.message || "Failed to connect to the server"));
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [timeRange]);

  // Filter data by selected time range
  const filteredData = chartData

  return (
    <Card className="pt-0 bg--card text-card-foreground border border-border">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="sm:text-lg text-sm">Sales Trends Over Time</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Showing total sales and items sold over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="sm:w-40 rounded-lg sm:ml-auto sm:flex text-xs sm:text-sm"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="this_year">All of the Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="flex gap-3 text-sm"><Spinner /> Loading...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[250px]">
            <p>Error: {error.message}</p>
          </div>
        ) : (
          <ChartContainer
            key={width} // ✅ only re-render after resizing stops
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillItems" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-5)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-5)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="order_day"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    if (timeRange === "this_year") {
                      return value;
                    }
                    const date = new Date(value)
                    if (isNaN(date.getTime())) {
                      return "Invalid Date"
                    }
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />

                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        if (timeRange === "this_year") {
                          return value;
                        }
                        const date = new Date(value)
                        if (isNaN(date.getTime())) {
                          return "Invalid Date"
                        }
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }}
                      indicator="dot"
                    />
                  }
                />

                <Area
                  dataKey="items_sold"
                  type="natural"
                  fill="url(#fillItems)"
                  stroke="var(--chart-5)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="total_sales"
                  type="natural"
                  fill="url(#fillSales)"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                />

                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}