import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Header } from '@/src/components/storefront/Header';
import { Footer } from '@/src/components/storefront/Footer';
import { CartDrawer } from '@/src/components/storefront/CartDrawer';
import { CartItem, Product } from '@/types';

export default function StorefrontLayout() {
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });

    setToastMessage(`${product.name} ajouté au panier`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setCartOpen(true)}
        onGoHome={() => navigate('/')}
        onGoToCatalog={() => navigate('/catalogue')}
      />

      <main className="flex-grow">
        <Outlet context={{ handleAddToCart }} />
      </main>

      <Footer />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={() => setCartItems([])}
      />

      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-mv-black text-white px-6 py-4 rounded shadow-2xl flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1">
              <Check size={12} className="text-white" />
            </div>
            <span className="font-sans text-xs font-bold tracking-widest uppercase">
              {toastMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
