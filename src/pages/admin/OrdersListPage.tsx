import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Badge, SkeletonTable } from '@/src/components/ui';
import { Eye, MessageCircle, FileText, Download } from 'lucide-react';

type OrderStatus = 'new' | 'processing' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: 'default' | 'success' | 'danger' }> = {
  new: { label: 'Nouvelle', variant: 'default' },
  processing: { label: 'En cours', variant: 'default' },
  delivered: { label: 'Livrée', variant: 'success' },
  cancelled: { label: 'Annulée', variant: 'danger' },
};

const STATUS_FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'new', label: 'Nouvelles' },
  { value: 'processing', label: 'En cours' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'cancelled', label: 'Annulées' },
];

export default function OrdersListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const orders = useQuery(
    api.orders.list,
    statusFilter === 'all' ? {} : { status: statusFilter }
  );
  const newCount = useQuery(api.orders.getNewCount);

  if (orders === undefined) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SkeletonTable rows={6} />
      </div>
    );
  }

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) return;
    const header = ['Date', 'N° Commande', 'Client', 'Téléphone', 'Articles', 'Montant (FCFA)', 'Statut', 'Source'];
    const rows = orders.map((o: any) => {
      const date = new Date(o._creationTime).toLocaleDateString('fr-FR');
      const articles = o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(' | ');
      const status = STATUS_CONFIG[o.status as OrderStatus]?.label ?? o.status;
      return [date, o.orderNumber, o.customer.name, o.customer.phone, articles, o.total, status, o.source];
    });
    const csvContent = [header, ...rows].map((r) => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters + Export */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 rounded-lg font-sans text-xs font-medium tracking-wide transition-colors relative ${
              statusFilter === filter.value
                ? 'bg-mv-black text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filter.label}
            {filter.value === 'new' && newCount != null && newCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-mv-red text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {newCount}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={handleExportCSV}
            disabled={!orders || orders.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-xs font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-sans text-sm text-gray-400">Aucune commande trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 font-sans text-xs font-bold text-gray-500 uppercase tracking-wider">N° Commande</th>
                  <th className="text-left px-6 py-3 font-sans text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 font-sans text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="text-right px-6 py-3 font-sans text-xs font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="text-center px-6 py-3 font-sans text-xs font-bold text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="text-center px-6 py-3 font-sans text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-center px-6 py-3 font-sans text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order: any) => {
                  const config = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.new;
                  const date = new Date(order._creationTime).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/commandes/${order._id}`)}
                    >
                      <td className="px-6 py-4 font-sans text-sm font-medium text-mv-black">{order.orderNumber}</td>
                      <td className="px-6 py-4 font-sans text-sm text-gray-500">{date}</td>
                      <td className="px-6 py-4">
                        <div className="font-sans text-sm font-medium text-mv-black">{order.customer.name}</div>
                        <div className="font-sans text-xs text-gray-400">{order.customer.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-sans text-sm font-bold text-mv-black">
                        {order.total.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-6 py-4 text-center">
                        {order.source === 'whatsapp' ? (
                          <span className="inline-flex items-center gap-1 text-[#25D366]" title="WhatsApp">
                            <MessageCircle size={14} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400" title="Formulaire">
                            <FileText size={14} />
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-gray-400 hover:text-mv-black transition-colors">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
