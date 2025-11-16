import React, { useState, useEffect } from 'react';
import StatusCards from './StatusCards';
import { Package, Archive, TrendingUp, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '@/config';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_all_data.php`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const formatToPHP = (value) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
  };

  const cards_content = stats ? [
    {
      title: "Products in Stock",
      value: stats.total_quantity,
      subtitle: "Total items in inventory",
      icon: Package,
      color: "text-chart-1",
    },
    {
      title: "Inventory Value",
      value: formatToPHP(stats.inventory_value),
      subtitle: "Total value of all products",
      icon: Archive,
      color: "text-chart-4",
    },
    {
      title: "Sales This Month",
      value: formatToPHP(stats.sales_this_month),
      subtitle: "Revenue from current month",
      icon: TrendingUp,
      color: "text-chart-3",
    },
    {
      title: "Low Stock Items",
      value: stats.low_stock_count,
      subtitle: "Items with stock < 10",
      icon: AlertTriangle,
      color: "text-destructive",
    },
  ] : [];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatusCards cards={cards_content} />
    </div>
  );
};

export default DashboardStats;