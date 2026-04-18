import React, { useState, useRef, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Upload, X, ImageIcon, Loader2, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

function SortableImage({ storageId, onRemove }: { storageId: string; onRemove: () => void }) {
  const url = useQuery(api.products.getImageUrl, { storageId });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: storageId,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0 touch-none"
    >
      {url ? (
        <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 size={16} className="animate-spin text-gray-400" />
        </div>
      )}
      {/* Drag handle covers the image area */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Réordonner cette image"
        className="absolute inset-0 cursor-grab active:cursor-grabbing focus:outline-none"
      />
      {/* Grip indicator */}
      <div className="absolute bottom-1 left-1 p-0.5 bg-black/50 text-white rounded pointer-events-none">
        <GripVertical size={12} />
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Supprimer cette image"
        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors z-10"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const deleteImage = useMutation(api.products.deleteImage);

  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.indexOf(String(active.id));
    const newIndex = images.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(images, oldIndex, newIndex));
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Format non supporté. Utilisez JPG, PNG ou WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Fichier trop volumineux (max 5 Mo).';
    }
    return null;
  };

  const uploadFiles = useCallback(async (files: File[]) => {
    setError('');
    const validFiles: File[] = [];

    for (const file of files) {
      const err = validateFile(file);
      if (err) {
        setError(err);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const newIds: string[] = [];
      for (const file of validFiles) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        const { storageId } = await result.json();
        newIds.push(storageId);
      }
      onChange([...images, ...newIds]);
    } catch {
      setError("Erreur lors de l'upload. Réessayez.");
    } finally {
      setUploading(false);
    }
  }, [generateUploadUrl, images, onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(Array.from(files));
    }
    // Reset input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFiles(Array.from(files));
    }
  };

  const handleRemove = async (index: number) => {
    const storageId = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    try {
      await deleteImage({ storageId });
    } catch {
      // Silently fail - image already removed from product
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="font-sans text-xs font-bold tracking-wide text-gray-700 uppercase">
        Images du produit
      </label>

      {/* Existing images (draggable) */}
      {images.length > 0 && (
        <>
          <p className="font-sans text-xs text-gray-500">
            Glissez-déposez pour réordonner. La première image est mise en avant sur la boutique.
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-3">
                {images.map((storageId, index) => (
                  <SortableImage
                    key={storageId}
                    storageId={storageId}
                    onRemove={() => handleRemove(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragOver
            ? 'border-mv-black bg-gray-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
        }`}
      >
        {uploading ? (
          <>
            <Loader2 size={24} className="animate-spin text-gray-400" />
            <p className="font-sans text-sm text-gray-500">Upload en cours...</p>
          </>
        ) : (
          <>
            <div className="p-3 bg-gray-100 rounded-full">
              {images.length > 0 ? <ImageIcon size={20} className="text-gray-500" /> : <Upload size={20} className="text-gray-500" />}
            </div>
            <div className="text-center">
              <p className="font-sans text-sm text-gray-600">
                <span className="font-medium text-mv-black">Cliquez pour choisir</span> ou glissez-déposez
              </p>
              <p className="font-sans text-xs text-gray-400 mt-1">
                JPG, PNG, WebP — max 5 Mo
              </p>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="font-sans text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
