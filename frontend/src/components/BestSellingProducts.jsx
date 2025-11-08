import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const BestSellingProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchBestSellingProducts = async () => {
      try {
        const response = await fetch('http://localhost/silvercel_inventory_system/backend/api/bestsellers.php');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching best selling products:', error);
      }
    };

    fetchBestSellingProducts();
  }, []);

  const getEmoji = (productName) => {
    if (productName.toLowerCase().includes('charm')) return '🔮';
    if (productName.toLowerCase().includes('bracelet')) return '📿';
    if (productName.toLowerCase().includes('ring')) return '💍';
    if (productName.toLowerCase().includes('earring')) return '💎';
    if (productName.toLowerCase().includes('necklace') || productName.toLowerCase().includes('pendant')) return '📿';
    return '💎'; // Default emoji
  };

  return (
     <div className="bg-background">
      <div className="max-w-4xl mx-auto">
        <Card className="border border-border shadow-sm">
          <CardContent className="pl-3 pr-3 sm:pl-6 sm:pr-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="sm:text-lg text-sm font-semibold text-foreground pl-2 pr-2">
                Best Selling Products
              </h2>
            </div>
            
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 sm:p-3 md:p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors duration-200 gap-2"
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-muted flex items-center justify-center text-lg sm:text-xl md:text-2xl shrink-0">
                      {getEmoji(product.product_name)}
                    </div>
                    <span className="font-medium text-foreground text-xs sm:text-sm md:text-base truncate">
                      {product.product_name}
                    </span>
                  </div>
                  
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap shrink-0">
                    {product.total_quantity_sold} Pcs sold
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BestSellingProducts;