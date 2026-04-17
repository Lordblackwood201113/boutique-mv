import React from 'react';
import { useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Menu } from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Tableau de bord',
  '/admin/produits': 'Produits',
  '/admin/categories': 'Catégories',
  '/admin/commandes': 'Commandes',
  '/admin/contenu': 'Contenu',
};

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const location = useLocation();

  // Match the current path to a title, fallback to "Administration"
  const pageTitle =
    PAGE_TITLES[location.pathname] ??
    Object.entries(PAGE_TITLES).find(([path]) =>
      location.pathname.startsWith(path) && path !== '/admin'
    )?.[1] ??
    'Administration';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-gray-500 hover:text-mv-black transition-colors"
        >
          <Menu size={22} />
        </button>
        <h1 className="font-sans text-lg font-bold text-mv-black tracking-tight">
          {pageTitle}
        </h1>
      </div>

      <UserButton
        afterSignOutUrl="/admin/login"
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8',
          },
        }}
      />
    </header>
  );
}
