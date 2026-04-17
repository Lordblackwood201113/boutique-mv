import React from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ProductDetail } from '@/src/components/storefront/ProductDetail';
import { Product } from '@/types';

function ProductSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        <div className="aspect-[4/5] bg-gray-100 rounded-sm animate-pulse" />
        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mt-2" />
          <div className="border-t border-gray-200 pt-8 mt-4 space-y-3">
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleAddToCart } = useOutletContext<{ handleAddToCart: (product: Product, quantity: number) => void }>();

  const product = useQuery(
    api.products.getStorefront,
    id ? { id: id as Id<'products'> } : 'skip'
  );

  // Loading
  if (product === undefined) {
    return <ProductSkeleton />;
  }

  // Not found or inactive
  if (product === null) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <p className="font-serif text-xl text-gray-400 italic">Produit introuvable.</p>
        <button
          onClick={() => navigate('/catalogue')}
          className="mt-6 font-sans text-xs font-bold tracking-widest uppercase hover:text-mv-red transition-colors"
        >
          ← Retour au catalogue
        </button>
      </div>
    );
  }

  return (
    <ProductDetail
      product={product}
      onAddToCart={(product, quantity) => handleAddToCart(product, quantity)}
      onClose={() => navigate(-1)}
    />
  );
}
