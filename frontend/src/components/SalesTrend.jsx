import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '@/config';

export default function SalesTrend() {
    const [salesTrend, setSalesTrend] = useState([]);

    const fetchSalesTrend = () => {
        fetch(`${API_BASE_URL}/salestrend.php`)
            .then(response => response.json())
            .then(data => setSalesTrend(data))
            .catch(error => console.error("Error fetching sales trend:", error));
    };

    useEffect(() => {
        fetchSalesTrend();
        const interval = setInterval(fetchSalesTrend, 10000); // Fetch data every 10 seconds

        return () => clearInterval(interval); // Cleanup interval on component unmount
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
                        <Line type="monotone" dataKey="items_sold" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}