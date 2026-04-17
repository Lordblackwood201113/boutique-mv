import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StorefrontLayout from '@/src/layouts/StorefrontLayout';
import AdminLayout from '@/src/layouts/AdminLayout';
import ProtectedRoute from '@/src/components/shared/ProtectedRoute';
import HomePage from '@/src/pages/storefront/HomePage';
import CatalogPage from '@/src/pages/storefront/CatalogPage';
import ProductPage from '@/src/pages/storefront/ProductPage';
import LoginPage from '@/src/pages/admin/LoginPage';
import DashboardPage from '@/src/pages/admin/DashboardPage';
import ProductsListPage from '@/src/pages/admin/ProductsListPage';
import ProductFormPage from '@/src/pages/admin/ProductFormPage';
import CategoriesPage from '@/src/pages/admin/CategoriesPage';
import OrdersListPage from '@/src/pages/admin/OrdersListPage';
import OrderDetailPage from '@/src/pages/admin/OrderDetailPage';
import ContentEditorPage from '@/src/pages/admin/ContentEditorPage';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Routes publiques storefront */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogue" element={<CatalogPage />} />
        <Route path="/produit/:id" element={<ProductPage />} />
      </Route>

      {/* Login admin (public) — wildcard pour les sous-routes Clerk (factor-two, sso-callback, etc.) */}
      <Route path="/admin/login/*" element={<LoginPage />} />

      {/* Routes admin protégées */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="produits" element={<ProductsListPage />} />
          <Route path="produits/nouveau" element={<ProductFormPage />} />
          <Route path="produits/:id" element={<ProductFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="commandes" element={<OrdersListPage />} />
          <Route path="commandes/:id" element={<OrderDetailPage />} />
          <Route path="contenu" element={<ContentEditorPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
