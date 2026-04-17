import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Package, ShoppingCart, TrendingUp, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/src/components/ui';

type Period = 'today' | '7d' | '30d' | 'all';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: 'all', label: 'Tout' },
];

function KPICard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <span className="font-sans text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="font-sans text-3xl font-bold text-mv-black">{value}</p>
      <p className="font-sans text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function formatRevenue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toString();
}

function niceScale(maxValue: number, ticks: number): number[] {
  if (maxValue <= 0) return [0];
  const rough = maxValue / ticks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const nice = rough / mag >= 5 ? 10 * mag : rough / mag >= 2 ? 5 * mag : rough / mag >= 1 ? 2 * mag : mag;
  const steps: number[] = [];
  for (let v = 0; v <= maxValue + nice * 0.01; v += nice) {
    steps.push(Math.round(v));
  }
  return steps;
}

function SalesChart({ data }: { data: { date: string; revenue: number; count: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center">
        <p className="font-sans text-sm text-gray-400">Aucune donnée pour cette période.</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const yTicks = niceScale(maxRevenue, 4);
  const yMax = yTicks[yTicks.length - 1] || maxRevenue;

  // Layout constants
  const marginLeft = 55;
  const marginRight = 16;
  const marginTop = 12;
  const marginBottom = 32;
  const chartHeight = 200;
  const gap = 4;
  const barWidth = Math.max(Math.min(40, (500 - marginLeft - marginRight) / data.length - gap), 12);
  const totalWidth = marginLeft + data.length * (barWidth + gap) + marginRight;

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <div style={{ minWidth: Math.max(totalWidth, 360) }}>
        <svg
          width="100%"
          viewBox={`0 0 ${totalWidth} ${chartHeight + marginTop + marginBottom}`}
          className="block"
          role="img"
          aria-label="Histogramme des ventes"
        >
          {/* Horizontal grid lines + Y axis labels */}
          {yTicks.map((tick) => {
            const y = marginTop + chartHeight - (tick / yMax) * chartHeight;
            return (
              <g key={tick}>
                <line
                  x1={marginLeft}
                  y1={y}
                  x2={totalWidth - marginRight}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text
                  x={marginLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#9ca3af"
                  fontSize="10"
                  fontFamily="system-ui, sans-serif"
                >
                  {formatRevenue(tick)}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={marginLeft}
            y1={marginTop + chartHeight}
            x2={totalWidth - marginRight}
            y2={marginTop + chartHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          {/* Bars */}
          {data.map((d, i) => {
            const barH = yMax > 0 ? (d.revenue / yMax) * chartHeight : 0;
            const x = marginLeft + i * (barWidth + gap);
            const y = marginTop + chartHeight - barH;
            const showLabel = data.length <= 15 || i % Math.ceil(data.length / 12) === 0;
            const dateLabel = new Date(d.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

            return (
              <g key={d.date}>
                {/* Bar with rounded top */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barH, 0)}
                  rx={Math.min(barWidth / 2, 4)}
                  ry={Math.min(barWidth / 2, 4)}
                  fill="#1a1a1a"
                  opacity={0.85}
                  className="hover:opacity-100 transition-opacity cursor-default"
                >
                  <title>{`${dateLabel} : ${d.revenue.toLocaleString('fr-FR')} FCFA (${d.count} cmd)`}</title>
                </rect>
                {/* Square off bottom corners */}
                {barH > 4 && (
                  <rect
                    x={x}
                    y={y + barH - Math.min(barWidth / 2, 4)}
                    width={barWidth}
                    height={Math.min(barWidth / 2, 4)}
                    fill="#1a1a1a"
                    opacity={0.85}
                    className="hover:opacity-100 transition-opacity pointer-events-none"
                  />
                )}
                {/* X axis labels */}
                {showLabel && (
                  <text
                    x={x + barWidth / 2}
                    y={marginTop + chartHeight + 16}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="9"
                    fontFamily="system-ui, sans-serif"
                  >
                    {dateLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('30d');

  const stats = useQuery(api.stats.dashboard, { period });
  const topProducts = useQuery(api.stats.topProducts, { period });
  const salesData = useQuery(api.stats.salesByPeriod, { period });

  const isLoading = stats === undefined;

  return (
    <div className="space-y-8">
      {/* Header + Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-mv-black">Tableau de bord</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">Vue d'ensemble de votre boutique</p>
        </div>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-colors ${
                period === opt.value
                  ? 'bg-mv-black text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            icon={ShoppingCart}
            label="Commandes"
            value={stats.totalOrders.toString()}
            sub={period === 'all' ? 'total' : 'sur la période'}
            color="bg-blue-50 text-blue-600"
          />
          <KPICard
            icon={TrendingUp}
            label="Revenus"
            value={`${stats.totalRevenue.toLocaleString('fr-FR')} FCFA`}
            sub={period === 'all' ? 'total (hors annulées)' : 'sur la période'}
            color="bg-green-50 text-green-600"
          />
          <KPICard
            icon={CalendarDays}
            label="Aujourd'hui"
            value={stats.ordersToday.toString()}
            sub="commandes du jour"
            color="bg-amber-50 text-amber-600"
          />
          <KPICard
            icon={Package}
            label="Produits actifs"
            value={stats.activeProducts.toString()}
            sub="dans le catalogue"
            color="bg-purple-50 text-purple-600"
          />
        </div>
      )}

      {/* Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-sans text-sm font-bold text-mv-black uppercase tracking-wider mb-4">
            Évolution des ventes
          </h3>
          {salesData === undefined ? (
            <div className="h-48 flex items-center justify-center">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <SalesChart data={salesData} />
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-sans text-sm font-bold text-mv-black uppercase tracking-wider mb-4">
            Top produits
          </h3>
          {topProducts === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="font-sans text-sm text-gray-400">Aucune vente sur cette période.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div key={product.productId} className="flex items-center gap-3">
                  <span className="font-sans text-xs font-bold text-gray-300 w-5">#{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-mv-black truncate">{product.name}</p>
                    <p className="font-sans text-xs text-gray-400">{product.quantity} vendu(s)</p>
                  </div>
                  <span className="font-sans text-sm font-bold text-mv-black whitespace-nowrap">
                    {product.revenue.toLocaleString('fr-FR')} F
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
