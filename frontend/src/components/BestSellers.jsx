import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_BASE_URL } from '@/config';
import { useNavigate } from "react-router-dom";

export default function BestSellers() {
    const [bestsellers, setBestsellers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_BASE_URL}/bestsellers.php`)
            .then(response => response.json())
            .then(data => setBestsellers(data))
            .catch(error => console.error("Error fetching bestsellers:", error));
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Best-Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Total Quantity Sold</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bestsellers.map((product, index) => (
                            <TableRow key={index}>
                                <TableCell>{product.product_name}</TableCell>
                                <TableCell>{product.total_quantity_sold}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}