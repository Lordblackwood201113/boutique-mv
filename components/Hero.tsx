import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface HeroProps {
  onViewProduct: () => void;
  featuredProduct: Product;
}

export const Hero: React.FC<HeroProps> = ({ onViewProduct, featuredProduct }) => {
  // Image constant extracted for easy modification
  const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2670&auto=format&fit=crop";

  return (
    <section className="min-h-screen pt-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-0">
      
      {/* Left Content */}
      <div className="flex-1 z-10">
        <span className="font-sans text-xs tracking-[0.2em] text-gray-400 uppercase mb-4 block">Collection 2024</span>
        
        {/* Mixed Typography Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 text-mv-black">
          <span className="font-serif font-bold block">Esthétique</span>
          <span className="font-serif italic font-light text-gray-400 ml-4 inline-block">du</span> 
          <span className="font-sans font-bold ml-4">Quotidien.</span>
        </h1>

        <p className="font-sans font-light text-gray-600 max-w-md text-lg mb-10 leading-relaxed">
          Une sélection curatée d'objets pour la maison et le style de vie. La rencontre entre utilité et beauté pure.
        </p>

        <button 
          onClick={onViewProduct}
          className="group flex items-center gap-4 text-xs font-bold font-sans tracking-widest uppercase border-b border-black pb-1 hover:text-mv-red hover:border-mv-red transition-all"
        >
          <span>Explorer le catalogue</span>
          <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>

      {/* Right Image - Increased Size */}
      <div className="flex-1 relative w-full h-[60vh] md:h-[85vh]">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-gray-200 rounded-t-[100px] overflow-hidden">
             <img 
              src={HERO_IMAGE_URL} 
              alt="Esthétique du quotidien" 
              className="w-full h-full object-cover"
             />
        </div>

        {/* Floating Quote Card */}
        <div className="absolute -bottom-6 left-10 md:left-0 bg-white p-6 shadow-xl max-w-xs animate-bounce-slow">
           <p className="font-serif italic text-lg text-mv-black mb-2">"Le détail qui change tout."</p>
        </div>
        
        {/* Decorative Badge */}
        <div className="absolute top-10 right-10 md:right-20">
            <div className="relative">
                <div className="absolute inset-0 bg-mv-red blur-lg opacity-20 rounded-full"></div>
                <div className="relative border border-gray-300 bg-white/50 backdrop-blur-md rounded-full px-4 py-2 font-script text-mv-red transform rotate-12">
                   Boutique MV
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};