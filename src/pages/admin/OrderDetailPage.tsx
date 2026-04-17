import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button, Badge } from '@/src/components/ui';
import { ArrowLeft, MessageCircle, FileText, Clock } from 'lucide-react';

type OrderStatus = 'new' | 'processing' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: 'default' | 'success' | 'danger'; color: string }> = {
  new: { label: 'Nouvelle', variant: 'default', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'En cours', variant: 'default', color: 'bg-orange-100 text-orange-800' },
  delivered: { label: 'Livrée', variant: 'success', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', variant: 'danger', color: 'bg-red-100 text-red-800' },
};

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'Nouvelle' },
  { value: 'processing', label: 'En cours' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const order = useQuery(
    api.orders.get,
    id ? { id: id as Id<'orders'> } : 'skip'
  );
  const updateStatus = useMutation(api.orders.updateStatus);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!id || !order || newStatus === order.status) return;
    setUpdating(true);
    try {
      await updateStatus({ id: id as Id<'orders'>, status: newStatus });
      showToast(`Statut mis à jour : ${STATUS_CONFIG[newStatus].label}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour.';
      showToast(msg, 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Loading
  if (order === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (order === null) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="font-sans text-sm text-gray-400 mb-4">Commande introuvable.</p>
        <Button variant="secondary" onClick={() => navigate('/admin/commandes')}>
          ← Retour aux commandes
        </Button>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.new;
  const createdDate = new Date(order._creationTime).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isTerminal = order.status === 'delivered' || order.status === 'cancelled';

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/commandes')}
          className="text-gray-400 hover:text-mv-black transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="font-sans text-lg font-bold text-mv-black">{order.orderNumber}</h2>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + Customer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Articles */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-sans text-sm font-bold text-mv-black uppercase tracking-wider">Articles</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-sans text-sm font-medium text-mv-black">{item.name}</p>
                    <p className="font-sans text-xs text-gray-400">
                      {item.price.toLocaleString('fr-FR')} FCFA × {item.quantity}
                    </p>
                  </div>
                  <p className="font-sans text-sm font-bold text-mv-black">
                    {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <span className="font-sans text-sm font-bold text-mv-black uppercase tracking-wider">Total</span>
              <span className="font-serif text-xl font-bold text-mv-black">
                {order.total.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-sans text-sm font-bold text-mv-black uppercase tracking-wider">Informations client</h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-sans text-xs text-gray-400 uppercase tracking-wider">Nom</span>
                <span className="font-sans text-sm font-medium text-mv-black">{order.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-xs text-gray-400 uppercase tracking-wider">Téléphone</span>
                <a href={`tel:${order.customer.phone}`} className="font-sans text-sm font-medium text-mv-black hover:text-mv-red">
                  {order.customer.phone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-xs text-gray-400 uppercase tracking-wider">Adresse</span>
                <span className="font-sans text-sm font-medium text-mv-black text-right max-w-[60%]">
                  {order.customer.address || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status + Meta + History */}
        <div className="space-y-6">
          {/* Status Changer */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-sans text-sm font-bold text-mv-black uppercase tracking-wider">Statut</h3>
            </div>
            <div className="p-6">
              {isTerminal ? (
                <p className="font-sans text-xs text-gray-400">
                  Le statut d'une commande {order.status === 'delivered' ? 'livrée' : 'annulée'} ne peut pas être modifié.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusChange(opt.value)}
                      disabled={updating || opt.value === order.status}
                      className={`px-3 py-2 rounded-lg font-sans text-xs font-medium transition-colors disabled:opacity-50 ${
                        opt.value === order.status
                          ? 'bg-mv-black text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-sans text-sm font-bold text-mv-black uppercase tracking-wider">Détails</h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-sans text-xs text-gray-400 uppercase tracking-wider">Source</span>
                <span className="inline-flex items-center gap-1 font-sans text-sm">
                  {order.source === 'whatsapp' ? (
                    <><MessageCircle size={14} className="text-[#25D366]" /> WhatsApp</>
                  ) : (
                    <><FileText size={14} className="text-gray-400" /> Formulaire</>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans text-xs text-gray-400 uppercase tracking-wider">Date</span>
                <span className="font-sans text-xs text-mv-black">{createdDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans text-xs text-gray-400 uppercase tracking-wider">Articles</span>
                <span className="font-sans text-sm text-mv-black">
                  {order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)} produit(s)
                </span>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-sans text-sm font-bold text-mv-black uppercase tracking-wider">Historique</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {[...order.statusHistory].reverse().map((entry: any, idx: number) => {
                  const entryConfig = STATUS_CONFIG[entry.status as OrderStatus];
                  const time = new Date(entry.timestamp).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <Clock size={14} className="text-gray-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-sans text-xs font-medium text-mv-black">
                          {entryConfig?.label ?? entry.status}
                        </p>
                        <p className="font-sans text-[11px] text-gray-400">{time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
          <div className={`px-6 py-4 rounded shadow-2xl font-sans text-xs font-bold tracking-widest uppercase ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-mv-black text-white'
          }`}>
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}
