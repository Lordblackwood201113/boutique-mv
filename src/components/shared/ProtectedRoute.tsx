import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const adminStatus = useQuery(api.auth.checkAdmin);
  const ensureAdmin = useMutation(api.auth.ensureAdmin);
  const [ensured, setEnsured] = useState(false);

  useEffect(() => {
    // Si connecté, pas encore admin, et aucun admin n'existe → auto-enregistrer
    if (
      adminStatus &&
      !adminStatus.isAdmin &&
      !adminStatus.hasAnyAdmin &&
      !ensured
    ) {
      ensureAdmin().then(() => setEnsured(true));
    }
  }, [adminStatus, ensured, ensureAdmin]);

  if (!isLoaded || adminStatus === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mv-black" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!adminStatus.isAdmin && adminStatus.hasAnyAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-2xl font-bold text-mv-black mb-4">
            Accès refusé
          </h1>
          <p className="font-sans text-sm text-gray-500 mb-6">
            Votre compte n'a pas les droits d'administration.
            Contactez l'administrateur principal.
          </p>
          <a
            href="/"
            className="font-sans text-xs font-bold tracking-widest uppercase text-mv-black hover:text-mv-red transition-colors"
          >
            ← Retour au site
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
