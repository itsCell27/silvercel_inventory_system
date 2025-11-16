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
import { API_BASE_URL } from '@/config';

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
        const response = await fetch(
          `${API_BASE_URL}/stockbycategory.php`
        );
        const data = await response.json();

        // 🎨 Use ShadCN chart color variables
        const themeColors = [
          getComputedStyle(document.documentElement).getPropertyValue("--chart-1").trim(),
          getComputedStyle(document.documentElement).getPropertyValue("--chart-2").trim(),
          getComputedStyle(document.documentElement).getPropertyValue("--chart-3").trim(),
          getComputedStyle(document.documentElement).getPropertyValue("--chart-4").trim(),
          getComputedStyle(document.documentElement).getPropertyValue("--chart-5").trim(),
          getComputedStyle(document.documentElement).getPropertyValue("--chart-6").trim(),
          getComputedStyle(document.documentElement).getPropertyValue("--chart-7").trim(),
          getComputedStyle(document.documentElement).getPropertyValue("--chart-8").trim(),
          getComputedStyle(document.documentElement).getPropertyValue("--chart-9").trim(),
          getComputedStyle(document.documentElement).getPropertyValue("--chart-10").trim(),
        ];

        const newChartData = data.map((item, index) => ({
          category: item.category_name,
          stock: parseInt(item.total_quantity, 10),
          fill: themeColors[index % themeColors.length], // Use ShadCN chart colors
        }));

        const newChartConfig = data.reduce((acc, item, index) => {
          acc[item.category_name.toLowerCase()] = {
            label: item.category_name,
            color: themeColors[index % themeColors.length],
          };
          return acc;
        }, { stock: { label: "Stock" } });

        setChartData(newChartData);
        setChartConfig(newChartConfig);
      } catch (error) {
        console.error("Error fetching stock by category:", error);
      }
    };

    fetchStockByCategory();

    // 💡 Re-fetch theme colors when theme changes
    const observer = new MutationObserver(fetchStockByCategory);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-color-theme"],
    });

    return () => observer.disconnect();
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