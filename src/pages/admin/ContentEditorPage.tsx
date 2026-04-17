import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button, Input } from '@/src/components/ui';
import { ChevronDown, ChevronRight, Save } from 'lucide-react';

type SectionKey = 'hero' | 'philosophy' | 'contact' | 'social';

interface SectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, isOpen, onToggle, children }: SectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-sans text-sm font-bold text-mv-black uppercase tracking-wider">{title}</h3>
        {isOpen ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>
      {isOpen && <div className="px-6 pb-6 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}

export default function ContentEditorPage() {
  const contentMap = useQuery(api.content.getAll);
  const upsertContent = useMutation(api.content.upsert);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hero: true,
    philosophy: false,
    contact: false,
    social: false,
  });

  // Hero state
  const [hero, setHero] = useState({
    subtitle: 'Collection 2025',
    title_line1: 'Esthétique',
    title_line2: 'du',
    title_line3: 'Quotidien.',
    description: '',
    cta: 'Explorer le catalogue',
    image: '',
    quote: '"Le détail qui change tout."',
  });

  // Philosophy state
  const [philosophy, setPhilosophy] = useState({
    title_line1: 'Moins,',
    title_line2: 'mais mieux.',
    description: '',
    pillar1_title: 'Qualité',
    pillar1_text: '',
    pillar2_title: 'Design',
    pillar2_text: '',
    pillar3_title: 'Service',
    pillar3_text: '',
  });

  // Contact state
  const [contact, setContact] = useState({
    phone: '+225 07 67 72 93 96',
    email: 'hello@bmvboutique.ci',
    location: 'Abidjan, Côte d\'Ivoire.',
    tagline: 'Redéfinir l\'essentiel.',
  });

  // Social state
  const [social, setSocial] = useState({
    instagram: '',
    facebook: '',
    whatsapp: '2250767729396',
  });

  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load existing content
  useEffect(() => {
    if (!contentMap) return;
    if (contentMap.hero) setHero((prev) => ({ ...prev, ...contentMap.hero }));
    if (contentMap.philosophy) {
      const p = contentMap.philosophy;
      setPhilosophy((prev) => ({
        ...prev,
        ...p,
        pillar1_title: p.pillars?.[0]?.title ?? prev.pillar1_title,
        pillar1_text: p.pillars?.[0]?.text ?? prev.pillar1_text,
        pillar2_title: p.pillars?.[1]?.title ?? prev.pillar2_title,
        pillar2_text: p.pillars?.[1]?.text ?? prev.pillar2_text,
        pillar3_title: p.pillars?.[2]?.title ?? prev.pillar3_title,
        pillar3_text: p.pillars?.[2]?.text ?? prev.pillar3_text,
      }));
    }
    if (contentMap.contact) setContact((prev) => ({ ...prev, ...contentMap.contact }));
    if (contentMap.social) setSocial((prev) => ({ ...prev, ...contentMap.social }));
  }, [contentMap]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSection = async (section: SectionKey) => {
    setSaving(section);
    try {
      let data: any;
      switch (section) {
        case 'hero':
          data = { ...hero };
          break;
        case 'philosophy':
          data = {
            title_line1: philosophy.title_line1,
            title_line2: philosophy.title_line2,
            description: philosophy.description,
            pillars: [
              { title: philosophy.pillar1_title, text: philosophy.pillar1_text },
              { title: philosophy.pillar2_title, text: philosophy.pillar2_text },
              { title: philosophy.pillar3_title, text: philosophy.pillar3_text },
            ],
          };
          break;
        case 'contact':
          data = { ...contact };
          break;
        case 'social':
          data = { ...social };
          break;
      }
      await upsertContent({ section, data });
      showToast(`Section "${section}" sauvegardée !`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      showToast(msg, 'error');
    } finally {
      setSaving(null);
    }
  };

  // Hero image upload handler
  const handleHeroImageUpload = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      const url = await generateUploadUrl();
      const result = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': files[0].type },
        body: files[0],
      });
      const { storageId } = await result.json();
      // Resolve the URL immediately for display
      setHero((prev) => ({ ...prev, image: storageId }));
    } catch {
      showToast("Erreur lors de l'upload de l'image.", 'error');
    }
  };

  if (contentMap === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <Section title="Hero (Page d'accueil)" isOpen={openSections.hero} onToggle={() => toggleSection('hero')}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Sous-titre" value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
            <Input label="Bouton CTA" value={hero.cta} onChange={(e) => setHero({ ...hero, cta: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Titre ligne 1" value={hero.title_line1} onChange={(e) => setHero({ ...hero, title_line1: e.target.value })} />
            <Input label="Titre ligne 2" value={hero.title_line2} onChange={(e) => setHero({ ...hero, title_line2: e.target.value })} />
            <Input label="Titre ligne 3" value={hero.title_line3} onChange={(e) => setHero({ ...hero, title_line3: e.target.value })} />
          </div>
          <div>
            <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={hero.description}
              onChange={(e) => setHero({ ...hero, description: e.target.value })}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 font-sans text-sm focus:ring-1 focus:ring-mv-black outline-none"
            />
          </div>
          <Input label="Citation" value={hero.quote} onChange={(e) => setHero({ ...hero, quote: e.target.value })} />
          <div>
            <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Image de fond</label>
            {hero.image && hero.image.startsWith('http') && (
              <div className="mb-3 relative w-full max-w-md h-40 bg-gray-100 rounded-lg overflow-hidden">
                <img src={hero.image} alt="Hero" className="w-full h-full object-cover" />
              </div>
            )}
            {hero.image && !hero.image.startsWith('http') && (
              <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-sans text-xs text-green-700">Image uploadée. Cliquez "Sauvegarder Hero" pour appliquer.</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input value={hero.image} onChange={(e) => setHero({ ...hero, image: e.target.value })} placeholder="URL de l'image (https://...)" />
              </div>
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-lg font-sans text-xs font-medium transition-colors">
                Upload
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await handleHeroImageUpload([file]);
                  }}
                />
              </label>
            </div>
          </div>
          <div className="pt-2">
            <Button onClick={() => saveSection('hero')} loading={saving === 'hero'} icon={<Save size={14} />}>
              Sauvegarder Hero
            </Button>
          </div>
        </div>
      </Section>

      {/* Philosophy Section */}
      <Section title="Philosophie" isOpen={openSections.philosophy} onToggle={() => toggleSection('philosophy')}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Titre ligne 1" value={philosophy.title_line1} onChange={(e) => setPhilosophy({ ...philosophy, title_line1: e.target.value })} />
            <Input label="Titre ligne 2" value={philosophy.title_line2} onChange={(e) => setPhilosophy({ ...philosophy, title_line2: e.target.value })} />
          </div>
          <div>
            <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={philosophy.description}
              onChange={(e) => setPhilosophy({ ...philosophy, description: e.target.value })}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 font-sans text-sm focus:ring-1 focus:ring-mv-black outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Input label="Pilier 1 — Titre" value={philosophy.pillar1_title} onChange={(e) => setPhilosophy({ ...philosophy, pillar1_title: e.target.value })} />
              <Input label="Pilier 1 — Texte" value={philosophy.pillar1_text} onChange={(e) => setPhilosophy({ ...philosophy, pillar1_text: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Input label="Pilier 2 — Titre" value={philosophy.pillar2_title} onChange={(e) => setPhilosophy({ ...philosophy, pillar2_title: e.target.value })} />
              <Input label="Pilier 2 — Texte" value={philosophy.pillar2_text} onChange={(e) => setPhilosophy({ ...philosophy, pillar2_text: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Input label="Pilier 3 — Titre" value={philosophy.pillar3_title} onChange={(e) => setPhilosophy({ ...philosophy, pillar3_title: e.target.value })} />
              <Input label="Pilier 3 — Texte" value={philosophy.pillar3_text} onChange={(e) => setPhilosophy({ ...philosophy, pillar3_text: e.target.value })} />
            </div>
          </div>
          <div className="pt-2">
            <Button onClick={() => saveSection('philosophy')} loading={saving === 'philosophy'} icon={<Save size={14} />}>
              Sauvegarder Philosophie
            </Button>
          </div>
        </div>
      </Section>

      {/* Contact Section */}
      <Section title="Contact" isOpen={openSections.contact} onToggle={() => toggleSection('contact')}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Téléphone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
            <Input label="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Adresse / Ville" value={contact.location} onChange={(e) => setContact({ ...contact, location: e.target.value })} />
            <Input label="Slogan" value={contact.tagline} onChange={(e) => setContact({ ...contact, tagline: e.target.value })} />
          </div>
          <div className="pt-2">
            <Button onClick={() => saveSection('contact')} loading={saving === 'contact'} icon={<Save size={14} />}>
              Sauvegarder Contact
            </Button>
          </div>
        </div>
      </Section>

      {/* Social Section */}
      <Section title="Réseaux sociaux" isOpen={openSections.social} onToggle={() => toggleSection('social')}>
        <div className="space-y-4">
          <Input label="Instagram (URL)" value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} placeholder="https://instagram.com/..." />
          <Input label="Facebook (URL)" value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} placeholder="https://facebook.com/..." />
          <Input label="WhatsApp (numéro international)" value={social.whatsapp} onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })} placeholder="2250767729396" />
          <div className="pt-2">
            <Button onClick={() => saveSection('social')} loading={saving === 'social'} icon={<Save size={14} />}>
              Sauvegarder Réseaux sociaux
            </Button>
          </div>
        </div>
      </Section>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
          <div className={`px-6 py-4 rounded shadow-2xl font-sans text-xs font-bold tracking-widest uppercase ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-mv-black text-white'
          }`}>
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}
