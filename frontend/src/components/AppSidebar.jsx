import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavigation } from "@/context/NavigationContext";
import { UserAuth } from "@/context/AuthContext";
import {
  CircleGauge,
  Settings,
  Package,
  CircleUserRound,
  Menu,
  X,
  ChevronLeft,
  Tags,
  ShoppingCart,
} from "lucide-react";

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedMenu } = useNavigation();
  const { session } = UserAuth();

  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { title: "Dashboard", icon: CircleGauge, path: "/app/dashboard" },
    { title: "Products", icon: Package, path: "/app/products" },
    { title: "Categories", icon: Tags, path: "/app/categories" },
    { title: "Sales/Orders", icon: ShoppingCart, path: "/app/sales_orders" },
    { title: "Settings", icon: Settings, path: "/app/settings" },

  ];

  const handleNavigate = (item) => {
    navigate(item.path);
    setSelectedMenu(item.title);
    setIsOpen(false);
  };

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Toggle - hide at lg when sidebar is always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-white shadow-md
          ${isOpen && "hidden"}
          `}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay (for mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 h-screen w-64
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">SilverCel</h1>
              <p className="text-xs text-muted-foreground">Inventory System</p>
            </div>
          </div>
          <div className="mr-2 lg:hidden p-1 hover:bg-foreground" onClick={() => setIsOpen(false)}>
            <ChevronLeft className="w-6 h-6" />
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            // Check if current path matches the item path OR if it's the root /app and item is Dashboard
            const active = 
              location.pathname === item.path || 
              (location.pathname === "/app" && item.path === "/app/dashboard");
            return (
              <button
                key={item.title}
                onClick={() => handleNavigate(item)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md transition
                  ${
                    active
                      ? "bg-primary text-card dark:text-white"
                      : "hover:bg-muted text-foreground"
                  }`}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer / User Info */}
        <div className="absolute bottom-0 w-full p-4">
          <div className="flex items-center gap-3">
            <CircleUserRound className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm font-semibold">
                Welcome,{" "}
                {session?.user?.user_metadata?.username ||
                  session?.user?.email?.split("@")[0] ||
                  "User"}
              </p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </aside>
      
    </>
  );
}
