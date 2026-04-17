import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Catalog } from '@/src/components/storefront/Catalog';

function CatalogSkeleton() {
  return (
    <section className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col mb-12 text-center">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto mb-4" />
        <div className="h-12 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-12" />
        <div className="flex justify-center gap-8 pb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="aspect-[4/5] bg-gray-100 rounded-sm animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CatalogPage() {
  const navigate = useNavigate();
  const products = useQuery(api.products.listStorefront);

  if (products === undefined) {
    return <CatalogSkeleton />;
  }

  if (products.length === 0) {
    return (
      <section className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen text-center">
        <span className="font-sans text-xs tracking-[0.2em] text-gray-400 uppercase mb-4 block">Collection 2025</span>
        <h2 className="font-serif text-4xl md:text-5xl text-mv-black mb-12">Le Catalogue</h2>
        <p className="font-serif text-xl text-gray-400 italic">Aucun produit disponible pour le moment.</p>
      </section>
    );
  }

  return (
    <div className="animate-fade-in">
      <Catalog
        products={products}
        onViewProduct={(product) => navigate(`/produit/${product.id}`)}
      />
    </div>
  );
}
