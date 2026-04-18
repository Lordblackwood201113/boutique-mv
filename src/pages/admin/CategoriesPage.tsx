import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Plus, Pencil, Trash2, Check, X, FolderOpen, ArrowUp, ArrowDown } from 'lucide-react';
import { Button, ConfirmModal, SkeletonTable } from '@/src/components/ui';

export default function CategoriesPage() {
  const categories = useQuery(api.categories.listAdmin);
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const removeCategory = useMutation(api.categories.remove);
  const moveCategory = useMutation(api.categories.move);

  // New category
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<Id<'categories'> | null>(null);
  const [editName, setEditName] = useState('');

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: Id<'categories'>;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      await createCategory({ name: trimmed });
      setNewName('');
      showToast('Catégorie créée');
    } catch (err: unknown) {
      let message = 'Erreur lors de la création';
      if (err instanceof Error) {
        // Convex wraps errors: extract the actual message
        message = err.message.includes('Uncaught Error:')
          ? err.message.split('Uncaught Error:').pop()!.trim()
          : err.message;
      }
      console.error('Erreur création catégorie:', err);
      showToast(message, 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleRename = async () => {
    if (!editId || !editName.trim()) return;
    try {
      await updateCategory({ id: editId, name: editName.trim() });
      setEditId(null);
      showToast('Catégorie renommée');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du renommage';
      showToast(message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeCategory({ id: deleteTarget.id });
      showToast(`${deleteTarget.name} supprimée`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      showToast(message, 'error');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const startEdit = (id: Id<'categories'>, name: string) => {
    setEditId(id);
    setEditName(name);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
  };

  const handleMove = async (id: Id<'categories'>, direction: 'up' | 'down') => {
    try {
      await moveCategory({ id, direction });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du déplacement';
      showToast(message, 'error');
    }
  };

  if (categories === undefined) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-mv-black">Catégories</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">Chargement...</p>
        </div>
        <SkeletonTable rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-mv-black">Catégories</h2>
        <p className="font-sans text-sm text-gray-500 mt-1">
          {categories.length} catégorie{categories.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Add category inline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de la nouvelle catégorie..."
            className="flex-1 bg-gray-50 border border-gray-200 px-4 py-2.5 font-sans text-sm rounded-lg outline-none transition-colors placeholder:text-gray-400 focus:ring-1 focus:ring-mv-black focus:border-mv-black"
          />
          <Button
            type="submit"
            size="sm"
            icon={<Plus size={14} />}
            loading={adding}
            disabled={!newName.trim()}
          >
            Ajouter
          </Button>
        </form>
      </div>

      {/* Categories list */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-sans text-gray-400">Aucune catégorie pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left font-sans text-xs font-bold tracking-wide text-gray-500 uppercase px-4 py-3">
                  Nom
                </th>
                <th className="text-center font-sans text-xs font-bold tracking-wide text-gray-500 uppercase px-4 py-3 hidden sm:table-cell">
                  Produits
                </th>
                <th className="text-right font-sans text-xs font-bold tracking-wide text-gray-500 uppercase px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr
                  key={cat._id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Name (or inline edit) */}
                  <td className="px-4 py-3">
                    {editId === cat._id ? (
                      <form
                        onSubmit={(e) => { e.preventDefault(); handleRename(); }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          className="flex-1 bg-gray-50 border border-gray-300 px-3 py-1.5 font-sans text-sm rounded-lg outline-none focus:ring-1 focus:ring-mv-black focus:border-mv-black"
                        />
                        <button
                          type="submit"
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Valider"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Annuler"
                        >
                          <X size={16} />
                        </button>
                      </form>
                    ) : (
                      <span className="font-sans text-sm font-medium text-mv-black">
                        {cat.name}
                      </span>
                    )}
                  </td>

                  {/* Product count */}
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-gray-100 text-gray-600 font-sans text-xs font-medium rounded-full">
                      {cat.productCount}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleMove(cat._id, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-mv-black rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        title="Monter"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMove(cat._id, 'down')}
                        disabled={index === categories.length - 1}
                        className="p-2 text-gray-400 hover:text-mv-black rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        title="Descendre"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => startEdit(cat._id, cat.name)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Renommer"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: cat._id, name: cat.name })}
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
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer la catégorie"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.name}" ? Si des produits y sont associés, la suppression sera bloquée.`}
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
