import React, { useState } from 'react';
import { ArrowUpRight, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteData';
import { EVENTS_DATA, PAST_EVENTS_ARCHIVE } from '../data/eventsData';

export const Events: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Music VC', 'Creative Salon', 'Film Club', 'Gaming Night'];

  const filteredEvents =
    selectedCategory === 'All'
      ? EVENTS_DATA
      : EVENTS_DATA.filter((e) => e.category === selectedCategory);

  return (
    <div className="w-full pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Soft Pastel Pink & Pearl White Master Container */}
      <div className="relative rounded-[36px] sm:rounded-[44px] bg-gradient-to-b from-[#fdf6f7] via-[#faeaef] to-[#fcecee] p-6 sm:p-12 lg:p-16 border border-[#f5dbe3] shadow-[0_20px_60px_rgba(224,124,154,0.1)] overflow-hidden">
        {/* Ambient Pastel Glow Orbs */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 bg-[#ffd8e4]/45 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ffeef2]/70 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10">
          {/* Editorial Header — High Contrast Dark Plum Typography */}
          <section className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/95 border border-[#f3d2dc] text-xs font-semibold uppercase tracking-widest text-[#b54a67] shadow-xs mb-4 select-none">
              <span>Calendar & Evenings</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#240f17] font-normal tracking-normal mb-5 leading-tight">
              Evenings worth clearing your night for.
            </h1>

            <p className="font-editorial text-lg sm:text-xl text-[#6b5860] leading-relaxed">
              LovePixels hosts regular listening rooms, salons, gaming nights, and prize events. Capped participant slots ensure intimate community vibes.
            </p>
          </section>

          {/* Category Filter Pills — Soft Pastel Aesthetic */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 select-none ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#b54a67] to-[#d3738b] text-white shadow-md'
                    : 'bg-white/90 border border-[#f5dbe3] text-[#8a5868] hover:text-[#240f17] hover:border-[#d3738b]/60 shadow-xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured Upcoming Events Roster */}
          <section className="mb-20">
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group rounded-3xl overflow-hidden bg-white border border-[#f5dbe3] shadow-[0_10px_35px_rgba(224,124,154,0.07)] hover:shadow-[0_18px_45px_rgba(224,124,154,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    {/* Event Hero Artwork Container — Soft Pastel Backdrop & Pixel Art Icon */}
                    <div className="relative aspect-[16/10] bg-gradient-to-tr from-[#faeaef] via-[#fff5f8] to-[#f5e6ed] p-6 flex items-center justify-center overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="max-h-[160px] sm:max-h-[180px] w-auto max-w-[85%] object-contain pixel-art transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#b54a67] bg-white/95 border border-[#f5dbe3] shadow-xs select-none">
                          {event.category}
                        </span>
                      </div>

                      {/* Attendees */}
                      <div className="absolute bottom-4 left-4 text-xs font-medium text-[#8a727c] bg-white/90 px-3 py-1 rounded-full border border-[#f5dbe3] flex items-center gap-1.5 shadow-xs">
                        <Users className="w-3.5 h-3.5 text-[#b54a67]" />
                        <span>{event.attendees}</span>
                      </div>
                    </div>

                    {/* Event Details Content — High Contrast Plum & Slate Rose */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#b54a67] font-semibold mb-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#b54a67]" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sky-700">
                            <Clock className="w-3.5 h-3.5 text-sky-600" />
                            <span>{event.time}</span>
                          </div>
                        </div>

                        <h3 className="font-display text-2xl sm:text-3xl text-[#240f17] mb-3 font-normal group-hover:text-[#b54a67] transition-colors leading-snug">
                          {event.title}
                        </h3>

                        <p className="font-editorial text-base text-[#6b5860] leading-relaxed mb-6">
                          {event.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#f5dbe3] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-[#8a727c] font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#b54a67]" />
                          <span>{event.location}</span>
                        </div>

                        <a
                          href={SITE_CONFIG.discordInviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] shadow-xs hover:shadow-md transition-all hover:scale-105 active:scale-95"
                          data-cursor-text="RSVP"
                        >
                          <span>RSVP via Discord</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white/90 rounded-3xl border border-[#f5dbe3] max-w-lg mx-auto shadow-sm">
                <Calendar className="w-10 h-10 text-[#d3738b] mx-auto mb-3" />
                <h3 className="font-display text-2xl text-[#240f17] mb-2 font-normal">
                  No events scheduled in this category
                </h3>
                <p className="font-editorial text-base text-[#6b5860]">
                  New salons and listening rooms are posted every Sunday evening in #events on Discord.
                </p>
              </div>
            )}
          </section>

          {/* Past Events & Seasonal Galas Archive */}
          <section>
            <div className="p-6 sm:p-10 rounded-[32px] bg-white/80 border border-[#f5dbe3] shadow-[0_8px_30px_rgba(224,124,154,0.06)]">
              <div className="max-w-xl mb-8">
                <span className="text-xs uppercase font-semibold tracking-wider text-[#b54a67]">
                  PAST SALONS & ARCHIVES
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-[#240f17] mt-1 mb-2 font-normal">
                  Seasonal Retrospective
                </h2>
                <p className="font-editorial text-base text-[#6b5860]">
                  A glimpse back into our recent intimate listening sessions and salon winners.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PAST_EVENTS_ARCHIVE.map((past, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-[#fffbfc] border border-[#f5dbe3] hover:border-[#d3738b]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-[#b54a67] bg-white border border-[#f5dbe3] px-2.5 py-1 rounded-full shadow-xs">
                          {past.date} • {past.category}
                        </span>
                        <span className="text-xs font-bold text-[#b54a67]">
                          {past.payoutDisbursed} Disbursed
                        </span>
                      </div>
                      <h3 className="font-display text-xl text-[#240f17] mb-2 font-normal">{past.title}</h3>
                      <p className="font-editorial text-sm text-[#6b5860] leading-relaxed">
                        {past.recap}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
