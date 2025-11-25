import React from 'react';
import { Phone, Mail, Instagram, Facebook, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#181818] text-[#9A9A9A] py-16 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand Section */}
        <div className="flex flex-col gap-6">
          <h2 className="font-script text-4xl text-mv-red">Boutique MV</h2>
          <div className="flex flex-col gap-1">
            <p className="font-serif text-lg text-white">Redéfinir l'essentiel.</p>
            <p className="font-sans text-sm">Abidjan, Côte d'Ivoire.</p>
          </div>
        </div>

        {/* Menu Section */}
        <div className="flex flex-col gap-6">
          <h3 className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-white">Menu</h3>
          <ul className="flex flex-col gap-3 font-sans text-sm">
            <li className="hover:text-white cursor-pointer transition-colors">Accueil</li>
            <li className="hover:text-white cursor-pointer transition-colors">Philosophie</li>
            <li className="hover:text-white cursor-pointer transition-colors">Collection</li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="flex flex-col gap-6">
          <h3 className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-white">Contact</h3>
          
          <div className="flex flex-col gap-4 font-sans text-sm">
            <div className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
              <Phone size={16} className="text-mv-red" />
              <span>+225 01 71 26 68 40</span>
            </div>
            <div className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
              <Mail size={16} className="text-white" />
              <span>hello@bmvboutique.ci</span>
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            <div className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center hover:border-mv-red hover:text-mv-red transition-all cursor-pointer">
              <span className="font-sans font-bold text-xs">IG</span>
            </div>
             <div className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center hover:border-mv-red hover:text-mv-red transition-all cursor-pointer">
              <span className="font-sans font-bold text-xs">FB</span>
            </div>
             <div className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center hover:border-mv-red hover:text-mv-red transition-all cursor-pointer">
              <span className="font-sans font-bold text-xs">WA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#333] flex flex-col md:flex-row justify-between items-center text-xs font-sans tracking-wide">
        <p>&copy; 2025 BMV BOUTIQUE.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <span className="cursor-pointer hover:text-white">CONFIDENTIALITÉ</span>
          <span className="cursor-pointer hover:text-white">CGV</span>
        </div>
      </div>
    </footer>
  );
};
