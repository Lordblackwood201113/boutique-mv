import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Button, Input } from '@/src/components/ui';
import ImageUploader from '@/src/components/admin/ImageUploader';

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  // Queries
  const existingProduct = useQuery(
    api.products.get,
    isEdit ? { id: id as Id<'products'> } : 'skip'
  );
  const categories = useQuery(api.categories.list);

  // Mutations
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Pre-fill form in edit mode
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setDescription(existingProduct.description ?? '');
      setPrice(String(existingProduct.price));
      setCategoryId(existingProduct.categoryId);
      setStock(existingProduct.stock !== undefined ? String(existingProduct.stock) : '');
      setIsActive(existingProduct.isActive);
      setImages(existingProduct.images ?? []);
    }
  }, [existingProduct]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Le nom est obligatoire';
    if (!price.trim()) {
      newErrors.price = 'Le prix est obligatoire';
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = 'Le prix doit être un nombre positif';
    }
    if (!categoryId) newErrors.categoryId = 'La catégorie est obligatoire';
    if (stock.trim() && (isNaN(Number(stock)) || Number(stock) < 0)) {
      newErrors.stock = 'Le stock doit être un nombre positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct({
          id: id as Id<'products'>,
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          categoryId: categoryId as Id<'categories'>,
          images,
          stock: stock.trim() ? Number(stock) : undefined,
          isActive,
        });
        showToast('Produit modifié avec succès');
      } else {
        await createProduct({
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          categoryId: categoryId as Id<'categories'>,
          images,
          stock: stock.trim() ? Number(stock) : undefined,
          isActive,
        });
        showToast('Produit créé avec succès');
      }
      setTimeout(() => navigate('/admin/produits'), 500);
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Loading state for edit mode
  if (isEdit && existingProduct === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Product not found
  if (isEdit && existingProduct === null) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <h2 className="font-serif text-xl font-bold text-mv-black mb-2">Produit introuvable</h2>
        <p className="font-sans text-sm text-gray-400 mb-6">
          Ce produit n'existe pas ou a été supprimé.
        </p>
        <Button variant="secondary" onClick={() => navigate('/admin/produits')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/produits')}
          className="p-2 text-gray-400 hover:text-mv-black rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-serif text-2xl font-bold text-mv-black">
            {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <p className="font-sans text-sm text-gray-500 mt-1">
            {isEdit ? `Modification de "${existingProduct?.name}"` : 'Remplissez les informations du produit'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
        <div className="space-y-6 max-w-2xl">
          {/* Nom */}
          <Input
            label="Nom du produit"
            placeholder="Ex: Robe en wax Ankara"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs font-bold tracking-wide text-gray-700 uppercase">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le produit en détail..."
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 font-sans text-sm rounded-lg outline-none transition-colors placeholder:text-gray-400 focus:ring-1 focus:ring-mv-black focus:border-mv-black resize-vertical"
            />
          </div>

          {/* Prix + Stock (side by side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prix (FCFA)"
              type="number"
              placeholder="15000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={errors.price}
              required
            />
            <Input
              label="Stock"
              type="number"
              placeholder="Optionnel"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              error={errors.stock}
              hint="Laissez vide si non géré"
            />
          </div>

          {/* Catégorie */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs font-bold tracking-wide text-gray-700 uppercase">
              Catégorie *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`w-full bg-gray-50 border px-4 py-3 font-sans text-sm rounded-lg outline-none transition-colors ${
                errors.categoryId
                  ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                  : 'border-gray-200 focus:ring-1 focus:ring-mv-black focus:border-mv-black'
              }`}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="font-sans text-xs text-red-500">{errors.categoryId}</p>
            )}
          </div>

          {/* Images */}
          <ImageUploader images={images} onChange={setImages} />

          {/* Statut */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-mv-black peer-focus:ring-2 peer-focus:ring-mv-black/20 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
            <span className="font-sans text-sm text-gray-700">
              {isActive ? 'Produit actif (visible sur le site)' : 'Produit inactif (masqué)'}
            </span>
          </div>

          {/* Prix preview */}
          {price && !isNaN(Number(price)) && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="font-sans text-xs text-gray-500 uppercase tracking-wide mb-1">Aperçu du prix</p>
              <p className="font-serif text-2xl font-bold text-mv-black">
                {Number(price).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <Button
              type="submit"
              icon={<Save size={16} />}
              loading={saving}
            >
              {isEdit ? 'Enregistrer' : 'Créer le produit'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/produits')}
            >
              Annuler
            </Button>
          </div>
        </div>
      </form>

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
