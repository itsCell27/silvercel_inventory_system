import { UserAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import DashboardStats from "@/components/DashboardStats";
import { SalesTrendChart } from "@/components/SalesTrendChart";
import StockByCategory from "../components/StockByCategory";
import LowStockPopover from "@/components/LowStockPopover";
import BestSellingProducts from "../components/BestSellingProducts";
import LowStockProducts from "../components/LowStockProducts";
import { 
    PackageCheck, 
    PhilippinePeso, 
    ChartNoAxesCombined, 
    OctagonAlert,
    Bell, 
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const dashboard_cards = [
    {
        title: "Products in Stock",
        value: "9,872",
        icon: PackageCheck,
        color: "text-chart-1",
    },
    {
        title: "Inventory Value",
        value: "₱10,872",
        icon: PhilippinePeso,
        color: "text-chart-4",
    },
    {
        title: "Sales This Month",
        value: "₱10,872",
        icon: ChartNoAxesCombined,
        color: "text-chart-5",
    },
    {
        title: "Low Stock Items",
        value: "2",
        icon: OctagonAlert,
        color: "text-destructive",
    }
]

const exampleLowStockItems = [
  { name: "Pandora charm", stock: 2 },
  { name: "Ring", stock: 5 },
  { name: "Bracelet", stock: 3 },
];

const dashboard_products = [
    {
        id: 1,
        name: 'Charms',
        quantity: '50 Pcs',
        emoji: '🔮'
    },
    {
        id: 2,
        name: 'Bracelets',
        quantity: '40 Pcs',
        emoji: '📿'
    },
    {
        id: 3,
        name: 'Rings',
        quantity: '30 Pcs',
        emoji: '💍'
    },
    {
        id: 4,
        name: 'Earrings',
        quantity: '20 Pcs',
        emoji: '💎'
    },
    {
        id: 5,
        name: 'Necklaces and Pendants',
        quantity: '60 Pcs',
        emoji: '📿'
    }
];

export default function Dashboard() {
    const { session, logout } = UserAuth();
    //console.log(session);

    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="w-full flex flex-col gap-6 mt-2 sm:mt-0">
            <div className="flex gap-6 justify-between items-center">
                <p className="text-2xl font-semibold">Dashboard</p>
                <LowStockPopover lowStockItems={exampleLowStockItems} />
            </div>
            <DashboardStats />
            <SalesTrendChart />
            <StockByCategory />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BestSellingProducts products={dashboard_products} />
                <LowStockProducts />
            </div>
        </div>
    )
}