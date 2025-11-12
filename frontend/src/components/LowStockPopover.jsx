"use client";
import React, { useState, useEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { API_BASE_URL } from '@/config';

const LowStockPopover = () => {
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/lowstock.php`);
        setLowStockItems(response.data);
      } catch (error) {
        console.error('Error fetching low stock items:', error);
      }
    };

    fetchLowStockItems();
  }, []);

  return (
    <Popover>
      {/* Bell icon with notification badge */}
      <PopoverTrigger className="relative mr-2 bg-primary text-white p-3 rounded-4xl hover:bg-primary/80 transition-colors shadow-md hover:shadow-lg">
        <Bell className="h-6 w-6" />
        {lowStockItems.length > 0 && (
          <div className="absolute -top-2 -right-2 w-7 aspect-square text-xs font-bold bg-destructive rounded-full flex justify-center items-center">
            {lowStockItems.length}
          </div>
        )}
      </PopoverTrigger>

      {/* Popover content */}
      <PopoverContent className="w-64 p-4" sideOffset={10} sside="bottom" align="end">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Low Stock Alerts
        </h3>

        {lowStockItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">All stocks are sufficient</p>
        ) : (
          <ul className="space-y-2 max-h-[40vh] sm:max-h-48 overflow-y-auto">
            {lowStockItems.map((item, index) => (
              <li
                key={index}
                className="flex justify-center items-center py-1 gap-3"
              >
                <span className="text-sm font-medium truncate text-wrap">{item.name}</span>
                <span className="text-xs font-semibold text-destructive flex-1 text-nowrap">
                  {item.quantity} left
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* For future development */}
        {/* {lowStockItems.length > 0 && (
          <div className="mt-3 text-right">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => alert("Redirect to inventory page")}
            >
              View All
            </Button>
          </div>
        )} */}
      </PopoverContent>
    </Popover>
  );
};

export default LowStockPopover;