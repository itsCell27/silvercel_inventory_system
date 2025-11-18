import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { API_BASE_URL } from '@/config';
import { useNavigate } from "react-router-dom";

const BestSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBestSellingProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/bestsellers.php`);
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
                  className="flex gap-4 items-center justify-between p-2 sm:p-3 md:p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors duration-200"
                  onClick={() => navigate(`/app/products?productName=${product.product_name}`)}
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-muted flex items-center justify-center text-lg sm:text-xl md:text-2xl shrink-0">
                      <img
                        src={product.image_path || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform hover:scale-105 rounded-lg border"
                      />
                    </div>
                    <span className="font-medium text-foreground text-xs sm:text-sm md:text-base truncate text-wrap">
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