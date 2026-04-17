import React, { useState } from 'react';
import { X, Trash2, MessageCircle, Truck, ShoppingBag, Check, Loader2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CartItem, UserInfo } from '@/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    phone: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<{ orderNumber: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useMutation(api.orders.create);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const currency = items.length > 0 ? items[0].currency : 'FCFA';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!userInfo.name.trim()) {
      setError('Merci de renseigner votre nom.');
      return false;
    }
    if (!userInfo.phone.trim()) {
      setError('Merci de renseigner votre numéro de téléphone.');
      return false;
    }
    return true;
  };

  const buildOrderArgs = (source: 'form' | 'whatsapp') => ({
    items: items.map(item => ({
      productId: item.id as Id<'products'>,
      quantity: item.quantity,
    })),
    customer: {
      name: userInfo.name.trim(),
      phone: userInfo.phone.trim(),
      address: userInfo.location.trim(),
    },
    source,
  });

  /** STORY-016: Commander via formulaire */
  const handleFormOrder = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await createOrder(buildOrderArgs('form'));
      setOrderConfirmation({ orderNumber: result.orderNumber });
      onClearCart();
      setUserInfo({ name: '', phone: '', location: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la commande.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /** STORY-017: WhatsApp enregistre d'abord dans Convex */
  const handleWhatsAppOrder = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError(null);

    // Try to save order in Convex first
    let orderNumber: string | null = null;
    try {
      const result = await createOrder(buildOrderArgs('whatsapp'));
      orderNumber = result.orderNumber;
    } catch (err: unknown) {
      // If save fails, show error but still open WhatsApp
      console.error('Erreur enregistrement commande:', err);
      setError('Commande non enregistrée, mais WhatsApp va s\'ouvrir.');
    }

    // Build WhatsApp message
    const date = new Date().toLocaleDateString('fr-FR');
    const totalFormatted = subtotal.toLocaleString('fr-FR');
    const itemsList = items.map(item => {
      const itemTotal = (item.price * item.quantity).toLocaleString('fr-FR');
      return `👉 *${item.quantity}x* ${item.name.toUpperCase()}\n     └ ${itemTotal} ${item.currency}`;
    }).join('\n');

    const orderRef = orderNumber ? `\n📋 *Réf :* ${orderNumber}` : '';
    const messageRaw = `👋 *Bonjour BMV Boutique !*
🛒 *Je souhaite passer commande*
──────────────────────

👤 *Client :* ${userInfo.name}
📞 *Téléphone :* ${userInfo.phone}
📍 *Lieu :* ${userInfo.location}
📅 *Date :* ${date}${orderRef}

📦 *MA SÉLECTION :*
${itemsList}

──────────────────────
💰 *TOTAL : ${totalFormatted} ${currency}*
──────────────────────

🚚 *NOTE LIVRAISON :*
👉 Zone : ${userInfo.location}
👉 Frais (1500-3000 FCFA) à confirmer.

👋 *Merci de confirmer ma commande !*`;

    const encodedMessage = encodeURIComponent(messageRaw);
    window.open(`https://wa.me/2250767729396?text=${encodedMessage}`, '_blank');

    if (orderNumber) {
      onClearCart();
      setUserInfo({ name: '', phone: '', location: '' });
      setOrderConfirmation({ orderNumber });
    }
    setLoading(false);
  };

  const handleClose = () => {
    setOrderConfirmation(null);
    setError(null);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-white z-50 shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-100">
          <h2 className="font-serif text-2xl italic font-bold">Votre Sélection</h2>
          <button onClick={handleClose} className="font-sans text-xs text-gray-400 hover:text-mv-black uppercase tracking-widest">
            Fermer
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {/* Order Confirmation */}
          {orderConfirmation ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <div className="bg-green-100 rounded-full p-4">
                <Check size={32} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-mv-black mb-2">Commande confirmée !</h3>
                <p className="font-sans text-sm text-gray-500 mb-1">Votre numéro de commande :</p>
                <p className="font-sans text-lg font-bold text-mv-black">{orderConfirmation.orderNumber}</p>
              </div>
              <p className="font-sans text-sm text-gray-400 max-w-xs">
                Nous vous contacterons bientôt pour confirmer la livraison.
              </p>
              <button
                onClick={handleClose}
                className="mt-4 bg-mv-black text-white py-3 px-8 font-sans text-xs font-bold tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          ) : items.length === 0 ? (
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
                        <span className="font-sans font-bold text-sm">{item.price.toLocaleString('fr-FR')} {item.currency}</span>
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
                  placeholder="Votre Nom *"
                  value={userInfo.name}
                  onChange={handleInputChange}
                  className="bg-gray-50 border-none p-4 font-sans text-sm focus:ring-1 focus:ring-mv-black outline-none placeholder:text-gray-400"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Votre Numéro *"
                  value={userInfo.phone}
                  onChange={handleInputChange}
                  className="bg-gray-50 border-none p-4 font-sans text-sm focus:ring-1 focus:ring-mv-black outline-none placeholder:text-gray-400"
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Adresse de livraison (Ex: Riviera - Attoban...)"
                  value={userInfo.location}
                  onChange={handleInputChange}
                  className="bg-gray-50 border-none p-4 font-sans text-sm focus:ring-1 focus:ring-mv-black outline-none placeholder:text-gray-400"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <p className="font-sans text-xs text-red-700">{error}</p>
                </div>
              )}

              {/* Delivery Info */}
              <div className="bg-[#FFFBF0] border-l-4 border-[#EBC667] p-4 flex items-start gap-3">
                 <Truck className="text-orange-700 flex-shrink-0 mt-1" size={16} />
                 <p className="font-sans text-xs text-orange-900 leading-relaxed">
                   <span className="font-bold">Livraison :</span> Frais entre 1 500 et 3 000 FCFA à prévoir selon votre zone.
                 </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!orderConfirmation && (
          <div className="p-8 border-t border-gray-100 bg-white flex flex-col gap-3">
            {/* Commander via formulaire */}
            <button
              onClick={handleFormOrder}
              disabled={items.length === 0 || loading}
              className="w-full bg-mv-black text-white py-4 font-sans text-xs font-bold tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span>Passer commande</span>
                  <ShoppingBag size={16} />
                </>
              )}
            </button>
            {/* Commander via WhatsApp */}
            <button
              onClick={handleWhatsAppOrder}
              disabled={items.length === 0 || loading}
              className="w-full bg-[#25D366] text-white py-4 font-sans text-xs font-bold tracking-[0.15em] uppercase hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Commander sur WhatsApp</span>
              <MessageCircle size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};
