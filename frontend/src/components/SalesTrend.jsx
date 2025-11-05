import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SalesTrend() {
    const [salesTrend, setSalesTrend] = useState([]);

    useEffect(() => {
        fetch('http://localhost/silvercel_inventory_system/backend/api/salestrend.php')
            .then(response => response.json())
            .then(data => setSalesTrend(data))
            .catch(error => console.error("Error fetching sales trend:", error));
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total_sales" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}