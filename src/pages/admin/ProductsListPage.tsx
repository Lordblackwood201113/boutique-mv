import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button, Badge, ConfirmModal, SkeletonTable } from '@/src/components/ui';

export default function ProductsListPage() {
  const navigate = useNavigate();
  const products = useQuery(api.products.listAdmin);
  const toggleActive = useMutation(api.products.toggleActive);
  const removeProduct = useMutation(api.products.remove);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: Id<'products'>;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = async (id: Id<'products'>, name: string) => {
    try {
      const result = await toggleActive({ id });
      showToast(
        result.isActive
          ? `${name} activé`
          : `${name} désactivé`
      );
    } catch {
      showToast('Erreur lors du changement de statut', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeProduct({ id: deleteTarget.id });
      showToast(`${deleteTarget.name} supprimé`);
      setDeleteTarget(null);
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (products === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-serif text-2xl font-bold text-mv-black">Produits</h2>
            <p className="font-sans text-sm text-gray-500 mt-1">Chargement...</p>
          </div>
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-mv-black">Produits</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">
            {products.length} produit{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() => navigate('/admin/produits/nouveau')}
        >
          Nouveau produit
        </Button>
      </div>

      {/* Table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="font-sans text-gray-400 mb-4">Aucun produit pour le moment.</p>
          <Button
            icon={<Plus size={16} />}
            onClick={() => navigate('/admin/produits/nouveau')}
          >
            Créer le premier produit
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left font-sans text-xs font-bold tracking-wide text-gray-500 uppercase px-4 py-3">
                    Produit
                  </th>
                  <th className="text-left font-sans text-xs font-bold tracking-wide text-gray-500 uppercase px-4 py-3 hidden md:table-cell">
                    Catégorie
                  </th>
                  <th className="text-right font-sans text-xs font-bold tracking-wide text-gray-500 uppercase px-4 py-3">
                    Prix
                  </th>
                  <th className="text-center font-sans text-xs font-bold tracking-wide text-gray-500 uppercase px-4 py-3 hidden sm:table-cell">
                    Statut
                  </th>
                  <th className="text-right font-sans text-xs font-bold tracking-wide text-gray-500 uppercase px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Produit (image + nom) */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <span className="font-sans text-sm font-medium text-mv-black truncate max-w-[200px]">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    {/* Catégorie */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-sans text-sm text-gray-500">
                        {product.categoryName}
                      </span>
                    </td>

                    {/* Prix */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-sans text-sm font-medium">
                        {product.price.toLocaleString('fr-FR')} FCFA
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <Badge variant={product.isActive ? 'success' : 'default'}>
                        {product.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(product._id, product.name)}
                          className="p-2 text-gray-400 hover:text-mv-black rounded-lg hover:bg-gray-100 transition-colors"
                          title={product.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {product.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/produits/${product._id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({ id: product._id, name: product.name })
                          }
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleting}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div
            className={`px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-mv-black text-white' : 'bg-red-600 text-white'
            }`}
          >
            <span className="font-sans text-xs font-bold tracking-widest uppercase">
              {toast.text}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
