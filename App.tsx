import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Philosophy } from './components/Philosophy';
import { ProductDetail } from './components/ProductDetail';
import { Catalog } from './components/Catalog';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Product, CartItem, ViewState } from './types';

// Mock Data
const CATALOG_PRODUCTS: Product[] = [
  {
    id: 'gourde-tau-pei-bear',
    name: 'Gourde Tau Pei Bear',
    price: 6000,
    currency: 'FCFA',
    description: 'Gourde 3 en 1',
    images: [
      'https://res.cloudinary.com/dkmjigwg2/image/upload/v1764085877/2_u0co5l.jpg',
      'https://res.cloudinary.com/dkmjigwg2/image/upload/v1764085877/1_qkhvkl.jpg'
    ],
    category: 'Gourdes'
  },
  {
    id: 'cardigan-2500',
    name: 'Cardigan 2500',
    price: 2500,
    currency: 'FCFA',
    description: 'Cardigan 3ème choix',
    images: [
      'https://res.cloudinary.com/dkmjigwg2/image/upload/v1764085560/1_smdd3s.jpg',
      'https://res.cloudinary.com/dkmjigwg2/image/upload/v1764085560/2_zh3hcd.jpg'
    ],
    category: 'Vêtements'
  },
  {
    id: 'cardigan-3500',
    name: 'Cardigan 3500',
    price: 3500,
    currency: 'FCFA',
    description: 'Cardigan 2ème choix',
    images: [
      'https://res.cloudinary.com/dkmjigwg2/image/upload/v1764069266/4_jj0vlq.jpg',
      'https://res.cloudinary.com/dkmjigwg2/image/upload/v1764069266/1_s5dbam.jpg',
      'https://res.cloudinary.com/dkmjigwg2/image/upload/v1764069266/3_qsrgqx.jpg',
      'https://res.cloudinary.com/dkmjigwg2/image/upload/v1764069266/2_xvvqt6.jpg'
    ],
    category: 'Vêtements'
  },
  {
    id: 'stanley-cup',
    name: 'Stanley CUP',
    price: 15000,
    currency: 'FCFA',
    description: 'La gourde Stanley Quencher H2.0 FlowState est votre alliée hydratation quotidienne. Fabriquée en acier inoxydable recyclé, elle garde vos boissons fraîches pendant des heures. Design ergonomique compatible avec les porte-gobelets de voiture.',
    images: [
      'https://res.cloudinary.com/dkmjigwg2/image/upload/v1764087013/3_e30qzy.jpg',
      'https://res.cloudinary.com/dkmjigwg2/image/upload/v1764087012/1_xv0je5.jpg',
      'https://res.cloudinary.com/dkmjigwg2/image/upload/v1764087012/2_jucr8y.jpg'
    ],
    category: 'Gourde Stanley'
  }
];

const FEATURED_PRODUCT = CATALOG_PRODUCTS[3]; // Stanley Cup as featured

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [lastView, setLastView] = useState<ViewState>('home'); // To return correctly from product detail

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    // setCartOpen(true); // Removed automatic opening
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const handleViewProduct = (product: Product) => {
    setLastView(view);
    setActiveProduct(product);
    setView('product_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToCatalog = () => {
    setView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseProductDetail = () => {
    setView(lastView === 'product_detail' ? 'home' : lastView); // Fallback to home if weird state
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
        onOpenCart={() => setCartOpen(true)}
        onGoHome={handleGoHome}
        onGoToCatalog={handleGoToCatalog}
      />

      <main className="flex-grow">
        {view === 'home' && (
          <div className="animate-fade-in">
            <Hero onViewProduct={handleGoToCatalog} featuredProduct={FEATURED_PRODUCT} />
            <Philosophy />
          </div>
        )}

        {view === 'catalog' && (
          <div className="animate-fade-in">
             <Catalog products={CATALOG_PRODUCTS} onViewProduct={handleViewProduct} />
          </div>
        )}

        {view === 'product_detail' && activeProduct && (
          <ProductDetail 
            product={activeProduct}
            onAddToCart={handleAddToCart}
            onClose={handleCloseProductDetail}
          />
        )}
      </main>

      <Footer />

      <CartDrawer 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  );
};

export default App;