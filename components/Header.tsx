import React, { useState } from 'react';
import { ShoppingBag, Menu as MenuIcon, X } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onGoHome: () => void;
  onGoToCatalog: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onGoHome, onGoToCatalog }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleMobileNav = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-mv-cream/90 backdrop-blur-sm py-6 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        
        {/* Mobile Menu Button - Left on mobile */}
        <button className="md:hidden text-mv-black" onClick={toggleMobileMenu}>
          <MenuIcon size={24} />
        </button>

        {/* Logo - Centered on mobile, Left on desktop */}
        <div 
          onClick={onGoHome} 
          className="font-script text-3xl text-mv-red cursor-pointer select-none hover:scale-105 transition-transform absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:left-auto"
        >
          Boutique MV
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex gap-8 font-sans text-xs font-bold tracking-[0.2em] uppercase text-mv-black">
            <li className="hover:text-mv-red cursor-pointer transition-colors" onClick={onGoHome}>Accueil</li>
            <li className="hover:text-mv-red cursor-pointer transition-colors" onClick={onGoToCatalog}>Catalogue</li>
          </ul>

          <div className="relative cursor-pointer group" onClick={onOpenCart}>
            <div className="flex items-center gap-2 font-sans text-xs font-bold tracking-[0.2em] uppercase hover:text-mv-red transition-colors">
              <span>Panier</span>
              {/* Black Circle Badge */}
              <div className="bg-mv-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Cart Icon - Right on mobile */}
        <div className="md:hidden relative cursor-pointer" onClick={onOpenCart}>
           <div className="relative">
               <ShoppingBag size={24} className="text-mv-black" />
               {cartCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-mv-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                   {cartCount}
                 </span>
               )}
            </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 bg-mv-cream transition-transform duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden flex flex-col`}>
         <div className="flex justify-between items-center p-6">
            <span className="font-script text-3xl text-mv-red">Boutique MV</span>
            <button onClick={toggleMobileMenu}>
              <X size={24} />
            </button>
         </div>
         <div className="flex flex-col items-center justify-center flex-1 gap-8">
            <button onClick={() => handleMobileNav(onGoHome)} className="font-serif text-3xl text-mv-black">Accueil</button>
            <button onClick={() => handleMobileNav(onGoToCatalog)} className="font-serif text-3xl text-mv-black">Catalogue</button>
            <button onClick={() => handleMobileNav(onOpenCart)} className="font-serif text-3xl text-mv-black">Panier ({cartCount})</button>
         </div>
      </div>
    </>
  );
};