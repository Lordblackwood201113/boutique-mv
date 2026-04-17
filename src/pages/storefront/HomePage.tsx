import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Hero } from '@/src/components/storefront/Hero';
import { Philosophy } from '@/src/components/storefront/Philosophy';

export default function HomePage() {
  const navigate = useNavigate();
  const products = useQuery(api.products.listStorefront);

  // Use first product as featured, or a fallback
  const featuredProduct = products?.[0] ?? {
    id: '',
    name: 'Boutique MV',
    price: 0,
    currency: 'FCFA' as const,
    description: '',
    images: [],
    category: '',
  };

  return (
    <div className="animate-fade-in">
      <Hero onViewProduct={() => navigate('/catalogue')} featuredProduct={featuredProduct} />
      <Philosophy />
    </div>
  );
}
