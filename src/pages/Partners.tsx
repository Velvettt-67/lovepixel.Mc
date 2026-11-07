import React, { useState } from 'react';
import { Handshake, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';
import { PARTNER_PHILOSOPHY, PARTNER_COMMUNITIES } from '../data/partnerData';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ShiningText } from '../components/ui/ShiningText';

export const Partners: React.FC = () => {
  const [partnerServer, setPartnerServer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerServer.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="w-full pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <section className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full liquid-glass-rose text-xs font-semibold uppercase tracking-widest text-[#f472b6] mb-4">
          <span>Alliances & Kinship</span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#fdf2f4] font-normal tracking-normal mb-6">
          <ShiningText variant="rose">{PARTNER_PHILOSOPHY.headline}</ShiningText>
        </h1>

        <p className="font-editorial text-xl sm:text-2xl text-[#d8afbf] leading-relaxed">
          {PARTNER_PHILOSOPHY.subheadline}
        </p>
      </section>

      {/* Featured Partner Communities with Spotlight Interaction */}
      <section className="mb-24">
        <SectionHeader
          align="center"
          eyebrow="Cross-Salon Co-Hosts"
          icon={<Handshake className="w-3.5 h-3.5 text-[#f472b6]" />}
          title="Shared Rooms & Salons"
          subtitle="Creative circles that join our late-night listening rooms and seasonal exhibitions."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PARTNER_COMMUNITIES.map((partner) => (
            <SpotlightCard
              key={partner.id}
              spotlightColor="rgba(244, 114, 182, 0.16)"
              borderColor="rgba(232, 168, 184, 0.45)"
              className="group p-8 rounded-3xl bg-[#180817]/90 border border-[#e8a8b8]/25 shadow-lg hover:border-[#f472b6]/45 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#f472b6] bg-[#2f122c] border border-[#e8a8b8]/20 px-2.5 py-1 rounded-full">
                    {partner.focus}
                  </span>
                  <span className="text-xs text-[#fcd9e2]/80 font-medium">{partner.members}</span>
                </div>

                <h3 className="font-display text-2xl text-[#fdf2f4] mb-3 group-hover:text-[#f472b6] transition-colors">
                  {partner.name}
                </h3>

                <p className="font-editorial text-base text-[#d8afbf] leading-relaxed mb-6">
                  {partner.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#e8a8b8]/20 flex items-center justify-between text-xs text-[#d8afbf]">
                <span className="italic">{partner.inviteNote}</span>
                <Handshake className="w-4 h-4 text-[#f472b6]" />
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* Partnership Standards with Liquid Glass */}
      <section className="mb-24">
        <div className="p-8 sm:p-12 rounded-[32px] bg-[#160718]/80 border border-[#e8a8b8]/20 backdrop-blur-md shadow-xl max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#f472b6]">
              COLLABORATION ETHOS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#fdf2f4] mt-1 mb-2">
              Our Partnership Standards
            </h2>
            <p className="font-editorial text-base text-[#d8afbf]">
              We evaluate potential partner servers on atmosphere, temperature, and genuine care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PARTNER_PHILOSOPHY.standards.map((std, i) => (
              <SpotlightCard
                key={i}
                spotlightColor="rgba(244, 114, 182, 0.12)"
                borderColor="rgba(232, 168, 184, 0.4)"
                className="p-4 rounded-2xl bg-[#220d20]/80 border border-[#e8a8b8]/20 flex items-start gap-3"
              >
                <ShieldCheck className="w-5 h-5 text-[#f472b6] shrink-0 mt-0.5" />
                <span className="font-editorial text-sm sm:text-base text-[#d8afbf] leading-snug">
                  {std}
                </span>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Proposal Form with Liquid Glass */}
      <section className="max-w-3xl mx-auto">
        <SpotlightCard
          spotlightColor="rgba(244, 114, 182, 0.12)"
          borderColor="rgba(232, 168, 184, 0.4)"
          className="p-8 sm:p-12 rounded-[32px] bg-[#160718]/80 border border-[#e8a8b8]/20 backdrop-blur-md shadow-xl"
        >
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#f472b6]">
              COLLABORATE
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#fdf2f4] mt-2 mb-3">
              Partner with LovePixels
            </h2>
            <p className="font-editorial text-base sm:text-lg text-[#d8afbf] leading-relaxed">
              {PARTNER_PHILOSOPHY.collaborationDetails}
            </p>
          </div>

          {submitted ? (
            <div className="text-center p-6 rounded-2xl bg-[#1c0a1a]/90 border border-[#d3738b]/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-display text-xl text-[#fdf2f4] mb-1">
                Proposal Received
              </h4>
              <p className="font-editorial text-sm text-[#d8afbf]">
                Thank you. Our partnership caretakers will visit <span className="font-semibold text-[#f472b6]">{partnerServer}</span> and connect with you on Discord to schedule a joint evening salon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder="Your Discord Server Invite or Name (e.g. discord.gg/...)"
                value={partnerServer}
                onChange={(e) => setPartnerServer(e.target.value)}
                className="flex-1 px-5 py-3 rounded-full bg-[#120412]/90 border border-[#e8a8b8]/30 text-sm text-[#fdf2f4] placeholder-[#9a7884] focus:outline-none focus:ring-2 focus:ring-[#f472b6]/50 shadow-inner"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] hover:shadow-lg hover:shadow-[#b54a67]/30 transition-all shadow-md hover:scale-105 active:scale-95 shrink-0"
                data-cursor-text="PROPOSE"
              >
                <span>Propose Partnership</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </SpotlightCard>
      </section>
    </div>
  );
};
