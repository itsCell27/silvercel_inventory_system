import React, { useEffect, useState } from 'react';

const Sales = () => {
    const [sales, setSales] = useState([]);

    useEffect(() => {
        fetch('http://localhost/silvercel_inventory_system/backend/api/sales_orders.php')
            .then(response => response.json())
            .then(data => setSales(data));
    }, []);

    return (
        <div>
            <h1>Sales</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product ID</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map(sale => (
                        <tr key={sale.order_id}>
                            <td>{sale.order_id}</td>
                            <td>{sale.product_id}</td>
                            <td>{sale.quantity}</td>
                            <td>{sale.total_price}</td>
                            <td>{sale.order_date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Sales;