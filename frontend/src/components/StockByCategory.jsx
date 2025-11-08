"use client"

import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// 🧩 Custom hook: debounce resize for smoother chart updates
function useDebouncedWindowWidth(delay = 200) {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setWidth(window.innerWidth), delay);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [delay]);
  return width;
}

export default function StockByCategory() {
  const [chartData, setChartData] = useState([]);
  const [chartConfig, setChartConfig] = useState({});
  const width = useDebouncedWindowWidth();

  useEffect(() => {
    const fetchStockByCategory = async () => {
      try {
        const response = await fetch('http://localhost/silvercel_inventory_system/backend/api/stockbycategory.php');
        const data = await response.json();

        const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

        const newChartData = data.map((item, index) => ({
          category: item.category_name,
          stock: parseInt(item.total_quantity, 10),
          fill: COLORS[index % COLORS.length],
        }));

        const newChartConfig = data.reduce((acc, item, index) => {
          acc[item.category_name.toLowerCase()] = {
            label: item.category_name,
            color: COLORS[index % COLORS.length],
          };
          return acc;
        }, { stock: { label: "Stock" } });

        setChartData(newChartData);
        setChartConfig(newChartConfig);
      } catch (error) {
        console.error('Error fetching stock by category:', error);
      }
    };

    fetchStockByCategory();
  }, []);

  return (
    <Card className="flex flex-col bg-(--color-card) text-(--color-card-foreground) border border-(--color-border)">
      <CardHeader>
        <CardTitle className="sm:text-lg text-sm">Stock By Category</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Overview of available inventory</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          key={width} // ✅ Only rerenders after resizing stops
          config={chartConfig}
          className="w-full"
          style={{ height: `${chartData.length * 30 + 40}px` }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 40, right: 16, top: 2, bottom: 2 }}
              barSize={24}
            >
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={40}
                tickFormatter={(value) =>
                  chartConfig[value?.toLowerCase()]?.label || value
                }
              />
              <XAxis dataKey="stock" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="stock" radius={6}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm"> 
        <div className="text-muted-foreground leading-none">
          Showing current stock per category
        </div>
      </CardFooter>
    </Card>
  )
}