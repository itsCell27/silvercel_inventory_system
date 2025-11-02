import { createBrowserRouter } from "react-router-dom";

import UpdatePassword from "@/pages/UpdatePassword";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import PrivateRoute from "@/context/PrivateRoute";
import ResetPasswordRoute from "@/context/ResetPasswordRoute";
import App from "@/App";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import ChangeEmail from "@/pages/ChangeEmail";
import Products from "@/pages/Products";
import Categories from "@/pages/Categories";
import SalesOrders from "./pages/SalesOrders";

export const router = createBrowserRouter([
    { path: "/", element: <Login /> },
    { path: "/login", element: <Login /> },
    { path: "/forgot_password", element: <ForgotPassword /> },
    { 
        path: "/app", 
        element: (
            <PrivateRoute>
                <App />
            </PrivateRoute>
        ),
        children: [
            {
                index: true, // This makes Dashboard the default route for /app
                element: <Dashboard />
            },
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "settings",
                element: <Settings />
            },
            {
                path: "products",
                element: <Products />
            },
            {
                path: "categories",
                element: <Categories />
            },
            {
                path: "sales_orders",
                element: <SalesOrders />
            },
            // Add more protected routes here
        ]
    },
    { path: "/update_password", 
        element: 
            (<ResetPasswordRoute>
                <UpdatePassword />
            </ResetPasswordRoute>)
    },
    { path: "/change_email", 
        element: 
            (<ResetPasswordRoute>
                <ChangeEmail />
            </ResetPasswordRoute>)
    },
    { path: "/app", 
        element: 
            (   <PrivateRoute>
                    <App />
                </PrivateRoute>
            ) }
])