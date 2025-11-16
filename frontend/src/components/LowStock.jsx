import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_BASE_URL } from '@/config';

export default function LowStock() {
    const [lowstock, setLowstock] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/lowstock.php`)
            .then(response => response.json())
            .then(data => setLowstock(data))
            .catch(error => console.error("Error fetching low-stock products:", error));
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Low-Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lowstock.map((product, index) => (
                            <TableRow key={index}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.quantity}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}