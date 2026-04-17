import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onClose: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onAddToCart, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-12 max-w-7xl mx-auto animate-fade-in">
      {/* Close button */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onClose} className="text-xs font-sans font-bold tracking-widest uppercase hover:text-mv-red transition-colors flex items-center gap-2">
          ← Retour
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Gallery Section */}
        <div className="flex flex-col gap-4">
          {/* Main Image */}
          <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden rounded-sm">
            <img 
              src={product.images[currentImageIndex]} 
              alt={product.name} 
              className="w-full h-full object-cover object-center transition-all duration-500"
            />
          </div>
          
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {product.images.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-20 h-24 flex-shrink-0 cursor-pointer overflow-hidden border transition-all duration-300 ${
                    currentImageIndex === idx ? 'border-mv-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col">
          <span className="font-sans text-xs tracking-[0.2em] text-gray-500 uppercase mb-4">
            {product.category}
          </span>
          
          <h1 className="font-serif text-4xl md:text-5xl text-mv-black mb-6">
            {product.name}
          </h1>

          <p className="font-sans text-xl mb-8 font-light">
            {product.price.toLocaleString('fr-FR')} {product.currency}
          </p>

          <div className="border-t border-b border-gray-200 py-8 mb-8">
            <h3 className="font-sans text-xs font-bold tracking-[0.2em] uppercase mb-4">Description</h3>
            <p className="font-sans text-gray-600 leading-relaxed font-light">
              {product.description}
            </p>
            <p className="font-sans text-gray-600 leading-relaxed font-light mt-4">
              Finitions soignées. Matériaux de première qualité. Disponible immédiatement.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-6 mt-auto">
            <div className="flex items-center border border-gray-300 w-32 justify-between px-4 py-3">
              <button onClick={handleDecrement} className="hover:text-mv-red transition-colors">
                <Minus size={16} />
              </button>
              <span className="font-sans font-medium">{quantity}</span>
              <button onClick={handleIncrement} className="hover:text-mv-red transition-colors">
                <Plus size={16} />
              </button>
            </div>

            <button 
              onClick={() => onAddToCart(product, quantity)}
              className="flex-1 bg-mv-black text-white py-3 px-8 font-sans text-xs font-bold tracking-widest uppercase hover:bg-mv-red transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <span>Ajouter au panier — {(product.price * quantity).toLocaleString('fr-FR')} {product.currency}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};