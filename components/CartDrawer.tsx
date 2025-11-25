import React, { useState } from 'react';
import { X, Trash2, MessageCircle, Truck } from 'lucide-react';
import { CartItem, UserInfo } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemoveItem, 
  onUpdateQuantity 
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    phone: '',
    location: ''
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const currency = items.length > 0 ? items[0].currency : 'FCFA';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppOrder = () => {
    // Basic validation
    if (!userInfo.name || !userInfo.phone) {
      alert("Merci de renseigner votre nom et numéro.");
      return;
    }

    const itemsList = items.map(item => `- ${item.name} (x${item.quantity})`).join('%0a');
    const message = `Bonjour Boutique MV,%0a%0aJe souhaite commander :%0a${itemsList}%0a%0aTotal: ${subtotal} ${currency}%0a%0aMes infos:%0aNom: ${userInfo.name}%0aTel: ${userInfo.phone}%0aLieu: ${userInfo.location}`;
    
    // Updated number to +33 744943191
    window.open(`https://wa.me/33744943191?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-white z-50 shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-100">
          <h2 className="font-serif text-2xl italic font-bold">Votre Sélection</h2>
          <button onClick={onClose} className="font-sans text-xs text-gray-400 hover:text-mv-black uppercase tracking-widest">
            Fermer
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <p className="font-sans">Votre panier est vide.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Items List */}
              <div className="flex flex-col gap-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="w-20 h-24 bg-gray-100 flex-shrink-0">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between h-24 py-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-sans font-medium uppercase tracking-wide text-sm">{item.name}</h3>
                        <span className="font-sans font-bold text-sm">{item.price} {item.currency}</span>
                      </div>
                      <p className="font-sans text-xs text-gray-500">{item.category}</p>
                      
                      <div className="flex justify-between items-end mt-auto">
                        <div className="flex items-center border border-gray-200 rounded-sm">
                           <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-2 py-1 text-gray-500 hover:text-black">-</button>
                           <span className="px-2 text-xs font-sans">{item.quantity}</span>
                           <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-2 py-1 text-gray-500 hover:text-black">+</button>
                        </div>
                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          className="text-[10px] uppercase font-bold text-gray-400 hover:text-mv-red tracking-wider border-b border-transparent hover:border-mv-red"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="flex justify-between items-baseline pt-6 border-t border-gray-100">
                <h3 className="font-serif text-xl font-bold">Sous-total</h3>
                <span className="font-serif text-xl font-bold">{subtotal.toLocaleString('fr-FR')} {currency}</span>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-4 mt-4">
                <input 
                  type="text" 
                  name="name"
                  placeholder="Votre Nom" 
                  value={userInfo.name}
                  onChange={handleInputChange}
                  className="bg-gray-50 border-none p-4 font-sans text-sm focus:ring-1 focus:ring-mv-black outline-none placeholder:text-gray-400"
                />
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="Votre Numéro" 
                  value={userInfo.phone}
                  onChange={handleInputChange}
                  className="bg-gray-50 border-none p-4 font-sans text-sm focus:ring-1 focus:ring-mv-black outline-none placeholder:text-gray-400"
                />
                <input 
                  type="text" 
                  name="location"
                  placeholder="Lieu (Ex: Riviera - Attoban, Lauriers 3...)" 
                  value={userInfo.location}
                  onChange={handleInputChange}
                  className="bg-gray-50 border-none p-4 font-sans text-sm focus:ring-1 focus:ring-mv-black outline-none placeholder:text-gray-400"
                />
              </div>

              {/* Delivery Info */}
              <div className="bg-[#FFFBF0] border-l-4 border-[#EBC667] p-4 flex items-start gap-3">
                 <Truck className="text-orange-700 flex-shrink-0 mt-1" size={16} />
                 <p className="font-sans text-xs text-orange-900 leading-relaxed">
                   <span className="font-bold">Livraison :</span> Frais entre 1500 et 3000 FCFA à prévoir selon votre zone (...).
                 </p>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-100 bg-white">
           <button 
            onClick={handleWhatsAppOrder}
            disabled={items.length === 0}
            className="w-full bg-[#1A1A1A] text-white py-4 font-sans text-xs font-bold tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <span>Commander sur WhatsApp</span>
             <MessageCircle size={16} />
           </button>
        </div>
      </div>
    </>
  );
};