import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const CONTACT_DEFAULTS = {
  phone: '+225 07 67 72 93 96',
  email: 'hello@bmvboutique.ci',
  location: 'Abidjan, Côte d\'Ivoire.',
  tagline: 'Redéfinir l\'essentiel.',
};

const SOCIAL_DEFAULTS = {
  instagram: '',
  facebook: '',
  whatsapp: '2250767729396',
};

export const Footer: React.FC = () => {
  const contactContent = useQuery(api.content.get, { section: 'contact' });
  const socialContent = useQuery(api.content.get, { section: 'social' });

  const contact = { ...CONTACT_DEFAULTS, ...(contactContent ?? {}) };
  const social = { ...SOCIAL_DEFAULTS, ...(socialContent ?? {}) };

  return (
    <footer className="bg-[#181818] text-[#9A9A9A] py-16 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand Section */}
        <div className="flex flex-col gap-6">
          <h2 className="font-script text-4xl text-mv-red">Boutique MV</h2>
          <div className="flex flex-col gap-1">
            <p className="font-serif text-lg text-white">{contact.tagline}</p>
            <p className="font-sans text-sm">{contact.location}</p>
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
            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 hover:text-white transition-colors">
              <Phone size={16} className="text-mv-red" />
              <span>{contact.phone}</span>
            </a>
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-white transition-colors">
              <Mail size={16} className="text-white" />
              <span>{contact.email}</span>
            </a>
          </div>

          <div className="flex gap-4 mt-2">
            <div className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center hover:border-mv-red hover:text-mv-red transition-all cursor-pointer">
              <span className="font-sans font-bold text-xs">IG</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center hover:border-mv-red hover:text-mv-red transition-all cursor-pointer">
              <span className="font-sans font-bold text-xs">FB</span>
            </div>
            <a
              href={`https://wa.me/${social.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center hover:border-mv-red hover:text-mv-red transition-all"
            >
              <span className="font-sans font-bold text-xs">WA</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#333] flex flex-col md:flex-row justify-between items-center text-xs font-sans tracking-wide">
        <p>&copy; {new Date().getFullYear()} BMV BOUTIQUE.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <span className="cursor-pointer hover:text-white">CONFIDENTIALITÉ</span>
          <span className="cursor-pointer hover:text-white">CGV</span>
        </div>
      </div>
    </footer>
  );
};
