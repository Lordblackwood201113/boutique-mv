import React from 'react';

export const Philosophy: React.FC = () => {
  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        
        {/* Left Heading */}
        <div className="lg:w-1/3">
           <h2 className="text-5xl md:text-6xl text-mv-black leading-tight">
             <span className="font-serif font-bold block">Moins,</span>
             <span className="font-serif italic text-gray-400 block">mais mieux.</span>
           </h2>
        </div>

        {/* Right Content */}
        <div className="lg:w-2/3 flex flex-col gap-12 border-l border-gray-200 lg:pl-16">
           <div className="max-w-xl">
             <p className="font-sans font-light text-gray-600 text-lg leading-relaxed">
               Chez BMV Boutique, nous croyons que les objets qui nous entourent définissent notre état d'esprit. 
               Notre philosophie est simple : sélectionner des pièces qui apportent du calme, du confort et une esthétique intemporelle à votre vie.
             </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-sans font-bold text-sm uppercase tracking-wider mb-2">Qualité</h4>
                <p className="font-sans text-sm text-gray-500 font-light">Matériaux durables et finitions soignées.</p>
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm uppercase tracking-wider mb-2">Design</h4>
                <p className="font-sans text-sm text-gray-500 font-light">Lignes épurées et style contemporain.</p>
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm uppercase tracking-wider mb-2">Service</h4>
                <p className="font-sans text-sm text-gray-500 font-light">Une expérience d'achat humaine et directe.</p>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};
