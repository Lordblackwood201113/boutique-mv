import React from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, FileText, X } from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Tableau de bord', end: true, badge: false },
  { to: '/admin/produits', icon: Package, label: 'Produits', end: false, badge: false },
  { to: '/admin/categories', icon: FolderOpen, label: 'Catégories', end: false, badge: false },
  { to: '/admin/commandes', icon: ShoppingCart, label: 'Commandes', end: false, badge: true },
  { to: '/admin/contenu', icon: FileText, label: 'Contenu', end: false, badge: false },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const newOrderCount = useQuery(api.orders.getNewCount);

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-mv-black text-white z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <span className="font-serif text-lg italic font-bold tracking-wide">
            BMV Admin
          </span>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4 mt-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-sans font-medium tracking-wide transition-colors relative ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge && newOrderCount != null && newOrderCount > 0 && (
                <span className="absolute right-3 bg-mv-red text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {newOrderCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <NavLink
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-xs text-white/40 hover:text-white/70 font-sans tracking-wide transition-colors"
          >
            ← Retour au site
          </NavLink>
        </div>
      </aside>
    </>
  );
}
