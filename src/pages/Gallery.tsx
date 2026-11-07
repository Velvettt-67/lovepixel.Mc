import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, Maximize2, X, ChevronLeft, ChevronRight, UploadCloud } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteData';
import { GALLERY_ITEMS } from '../data/galleryData';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { ShiningText } from '../components/ui/ShiningText';
import { MultiImageCarousel } from '../components/ui/MultiImageCarousel';

export const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ['All', 'Macro Flora', 'Celestial Skies', 'Atmosphere', 'Editorial', 'Photography'];

  const filteredItems =
    selectedCategory === 'All'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
    }
  }, [lightboxIndex, filteredItems.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! + 1) % filteredItems.length);
    }
  }, [lightboxIndex, filteredItems.length]);

  // Full keyboard navigation support for lightbox (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handlePrev, handleNext]);

  return (
    <div className="w-full pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <section className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full liquid-glass-rose text-xs font-semibold uppercase tracking-widest text-[#f472b6] mb-4">
          <span>Curated Visual Archive</span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#fdf2f4] font-normal tracking-normal mb-6">
          <ShiningText variant="rose">Made by members.</ShiningText>
        </h1>

        <p className="font-editorial text-xl sm:text-2xl text-[#d8afbf] leading-relaxed">
          A rolling exhibition of botanical photography, celestial skyscapes, 35mm film stills, and quiet moments curated across LovePixels.
        </p>
      </section>

      {/* Category Filter Pills with Liquid Glass */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              selectedCategory === cat
                ? cat === 'Celestial Skies'
                  ? 'bg-gradient-to-r from-[#0284c7] via-[#0d9488] to-[#818cf8] text-white shadow-md'
                  : cat === 'Atmosphere'
                  ? 'bg-gradient-to-r from-sky-600 via-[#b54a67] to-[#d3738b] text-white shadow-md'
                  : 'bg-gradient-to-r from-[#b54a67] to-[#d3738b] text-white shadow-md'
                : 'bg-[#1a0a19]/80 border border-[#e8a8b8]/20 text-[#d8afbf] hover:text-[#fdf2f4] hover:border-[#f472b6]/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Seasonal Exhibition Auto-Rotating Showcase (1,000 ms Interval) */}
      <section className="mb-14">
        <div className="rounded-[28px] overflow-hidden bg-[#180817] border border-[#e8a8b8]/25 shadow-2xl">
          <MultiImageCarousel
            images={GALLERY_ITEMS.map((item) => ({
              src: item.image,
              alt: item.title,
              title: item.title,
              artist: item.artist,
              category: item.category,
            }))}
            intervalMs={1000}
            aspectRatio="aspect-[16/9] sm:aspect-[2.4/1]"
            className="w-full"
          />
        </div>
      </section>

      {/* Asymmetric Editorial Gallery Grid */}
      <section className="mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8">
          {filteredItems.map((item, idx) => {
            // Create asymmetric layout column spans
            const colSpan =
              idx % 5 === 0
                ? 'lg:col-span-8'
                : idx % 5 === 1
                ? 'lg:col-span-4'
                : idx % 5 === 2
                ? 'lg:col-span-4'
                : idx % 5 === 3
                ? 'lg:col-span-4'
                : 'lg:col-span-4';

            const isCelestial = item.category === 'Celestial Skies';

            return (
              <div
                key={item.id}
                onClick={() => openLightbox(idx)}
                className={`group relative rounded-[28px] overflow-hidden bg-[#1c0b12] border shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer ${
                  isCelestial
                    ? 'border-sky-300/40 hover:border-sky-300/70 shadow-sky-950/30'
                    : 'border-[#e8a8b8]/30 hover:border-[#e8a8b8]/60'
                } ${colSpan} ${
                  idx % 5 === 0 ? 'aspect-[16/10]' : 'aspect-[4/5]'
                }`}
                data-cursor-text="VIEW"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className={`w-full h-full transition-transform duration-700 ease-out group-hover:scale-105 ${
                    isCelestial ? 'object-cover object-top' : 'object-cover'
                  }`}
                  loading="lazy"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                {/* Top-Right Expand Icon */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full liquid-glass-dark text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Bottom Metadata Content */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div
                    className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${
                      isCelestial ? 'text-[#7dd3fc]' : 'text-[#f7cad5]'
                    }`}
                  >
                    {item.category} • by {item.artist}
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="font-editorial text-sm text-[#fcd9e2]/80 mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">
                    {item.curatorNotes}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fullscreen Lightbox Modal with Keyboard Navigation */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-[#16070e]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-12 h-12 rounded-full liquid-glass-dark text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 hover:bg-white/20"
            aria-label="Close lightbox (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full liquid-glass-dark text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 hover:bg-white/20"
            aria-label="Previous artwork (Left arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full liquid-glass-dark text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 hover:bg-white/20"
            aria-label="Next artwork (Right arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Artwork Stage */}
          <div
            className="max-w-5xl w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-6">
              <img
                src={filteredItems[lightboxIndex].image}
                alt={filteredItems[lightboxIndex].title}
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
            </div>

            {/* Lightbox Caption */}
            <div className="text-center text-white max-w-xl">
              <span
                className={`text-xs uppercase tracking-widest font-semibold ${
                  filteredItems[lightboxIndex].category === 'Celestial Skies'
                    ? 'text-[#7dd3fc]'
                    : 'text-[#f7cad5]'
                }`}
              >
                {filteredItems[lightboxIndex].category} • {filteredItems[lightboxIndex].season}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-white mt-1 mb-2">
                {filteredItems[lightboxIndex].title}
              </h2>
              <p className="font-editorial text-base text-[#fcd9e2]/90 leading-relaxed mb-3">
                {filteredItems[lightboxIndex].curatorNotes}
              </p>
              <span className="text-xs text-[#e8a8b8] italic">
                Submitted by {filteredItems[lightboxIndex].artist} via ・🍁┆media
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Section with Spotlight Card & Liquid Glass */}
      <section className="max-w-4xl mx-auto">
        <SpotlightCard
          spotlightColor="rgba(244, 114, 182, 0.14)"
          borderColor="rgba(232, 168, 184, 0.45)"
          className="p-8 sm:p-12 rounded-[32px] bg-[#160718]/80 border border-[#e8a8b8]/20 backdrop-blur-md shadow-xl text-center"
        >
          <div className="w-12 h-12 rounded-full bg-[#2f122c] text-[#f472b6] flex items-center justify-center mx-auto mb-4 border border-[#e8a8b8]/20">
            <UploadCloud className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#f472b6]">
            SEASONAL EXHIBITION OPENINGS
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-[#fdf2f4] mt-2 mb-3">
            Submissions Open Every Season
          </h2>
          <p className="font-editorial text-lg text-[#d8afbf] max-w-xl mx-auto mb-6 leading-relaxed">
            Share your photography, botanical macros, writing excerpts, or game screenshots in <code className="bg-[#2f122c] border border-[#e8a8b8]/20 px-2 py-0.5 rounded text-[#f472b6] font-semibold">・🍁┆media</code> on Discord to be featured in the permanent archive.
          </p>
          <a
            href={SITE_CONFIG.discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] hover:shadow-lg hover:shadow-[#b54a67]/30 transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <span>Share Work in Discord Media</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </SpotlightCard>
      </section>
    </div>
  );
};
