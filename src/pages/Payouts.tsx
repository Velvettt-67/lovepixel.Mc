import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, HelpCircle, Receipt, X } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteData';
import { PAYOUT_METRICS, RECENT_VERIFIED_PAYOUTS, PAYOUT_FAQ, type PayoutProof } from '../data/payoutData';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ShiningText } from '../components/ui/ShiningText';
import { NumberTicker } from '../components/ui/NumberTicker';

export const Payouts: React.FC = () => {
  const [selectedProof, setSelectedProof] = useState<PayoutProof | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProof(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <section className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2a1024]/80 border border-[#e8a8b8]/20 text-xs font-semibold uppercase tracking-widest text-[#f472b6] mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-[#f472b6]" />
          <span>Verifiable Proof of Trust</span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#fdf2f4] font-normal tracking-normal mb-6">
          <ShiningText variant="rose">Rewards Delivered</ShiningText>
        </h1>

        <p className="font-editorial text-xl sm:text-2xl text-[#d8afbf] leading-relaxed">
          LovePixels believes true community recognition means prompt, transparent reward payouts. Explore verified transaction proofs, recent event champions, and recipient reviews.
        </p>
      </section>

      {/* Unified Key Statistics Matrix (100% consistent with siteData) */}
      <section className="mb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-[32px] bg-[#160718]/80 border border-[#e8a8b8]/20 backdrop-blur-md shadow-xl">
          <SpotlightCard
            spotlightColor="rgba(244, 114, 182, 0.12)"
            borderColor="rgba(232, 168, 184, 0.4)"
            className="text-center p-6 rounded-2xl bg-[#220d20]/80 border border-[#e8a8b8]/20 shadow-xs"
          >
            <NumberTicker
              value={PAYOUT_METRICS.totalRewardsNumeric}
              prefix="₹"
              suffix="+"
              formatIndian={true}
              className="font-editorial text-4xl sm:text-5xl font-bold text-[#f472b6]"
            />
            <div className="text-xs uppercase font-semibold tracking-wider text-[#fdf2f4] mt-2">
              Verified Payouts
            </div>
            <div className="text-[11px] text-[#d8afbf] font-semibold mt-0.5">Prompt UPI & direct awards</div>
          </SpotlightCard>

          <SpotlightCard
            spotlightColor="rgba(244, 114, 182, 0.12)"
            borderColor="rgba(232, 168, 184, 0.4)"
            className="text-center p-6 rounded-2xl bg-[#220d20]/80 border border-[#e8a8b8]/20 shadow-xs"
          >
            <NumberTicker
              value={PAYOUT_METRICS.verifiedWinnersNumeric}
              suffix="+"
              className="font-editorial text-4xl sm:text-5xl font-bold text-[#f472b6]"
            />
            <div className="text-xs uppercase font-semibold tracking-wider text-[#fdf2f4] mt-2">
              Champions
            </div>
            <div className="text-[11px] text-[#d8afbf] font-semibold mt-0.5">Across all creative salons</div>
          </SpotlightCard>

          <SpotlightCard
            spotlightColor="rgba(56, 189, 248, 0.12)"
            borderColor="rgba(125, 211, 252, 0.4)"
            className="text-center p-6 rounded-2xl bg-[#0c1824]/80 border border-sky-400/25 shadow-xs"
          >
            <span className="font-editorial text-4xl sm:text-5xl font-bold text-sky-400">
              {PAYOUT_METRICS.successRate}
            </span>
            <div className="text-xs uppercase font-semibold tracking-wider text-[#fdf2f4] mt-2">
              Fulfillment Rate
            </div>
            <div className="text-[11px] text-[#d8afbf] font-semibold mt-0.5">Zero unfulfilled prize claims</div>
          </SpotlightCard>

          <SpotlightCard
            spotlightColor="rgba(244, 114, 182, 0.12)"
            borderColor="rgba(232, 168, 184, 0.4)"
            className="text-center p-6 rounded-2xl bg-[#220d20]/80 border border-[#e8a8b8]/20 shadow-xs"
          >
            <NumberTicker
              value={PAYOUT_METRICS.eventsRewardedNumeric}
              suffix="+"
              className="font-editorial text-4xl sm:text-5xl font-bold text-[#f472b6]"
            />
            <div className="text-xs uppercase font-semibold tracking-wider text-[#fdf2f4] mt-2">
              Event Reports
            </div>
            <div className="text-[11px] text-[#d8afbf] font-semibold mt-0.5">Verified event disbursements</div>
          </SpotlightCard>
        </div>
      </section>

      {/* Admin Statement Card */}
      <section className="mb-20">
        <SpotlightCard
          spotlightColor="rgba(244, 114, 182, 0.14)"
          borderColor="rgba(232, 168, 184, 0.45)"
          className="p-8 sm:p-10 rounded-3xl bg-[#180817]/90 border border-[#e8a8b8]/25 shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#f472b6]">
              STATEMENT FROM SERVER LEADERSHIP
            </span>
            <blockquote className="font-editorial text-xl sm:text-2xl text-[#fdf2f4] italic mt-3 mb-4 leading-relaxed">
              {PAYOUT_METRICS.adminMessage}
            </blockquote>
            <p className="font-sans-clean text-xs font-semibold uppercase tracking-wider text-[#d8afbf]">
              {PAYOUT_METRICS.adminSignoff}
            </p>
          </div>
        </SpotlightCard>
      </section>

      {/* Verified Payout Proofs Ledger with Spotlight Cards */}
      <section className="mb-24">
        <SectionHeader
          eyebrow="Transparency Ledger"
          icon={<Receipt className="w-3.5 h-3.5 text-[#f472b6]" />}
          title="Recent Verified Dispatches"
          subtitle="Every payout is backed by transparent transaction reference IDs and audited in Discord."
          action={{
            label: "View #giveaways receipts",
            href: SITE_CONFIG.discordInviteUrl,
            isExternal: true,
            cursorText: "RECEIPTS",
          }}
        />

        <div className="space-y-4">
          {RECENT_VERIFIED_PAYOUTS.map((proof) => (
            <SpotlightCard
              key={proof.id}
              onClick={() => setSelectedProof(proof)}
              spotlightColor="rgba(244, 114, 182, 0.14)"
              borderColor="rgba(232, 168, 184, 0.45)"
              className="p-6 rounded-2xl bg-[#180817]/90 border border-[#e8a8b8]/20 hover:border-[#f472b6]/45 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              data-cursor-text="INSPECT"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#2f122c] text-[#f472b6] flex items-center justify-center shrink-0 border border-[#e8a8b8]/20">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans-clean font-semibold text-base text-[#fdf2f4]">
                      {proof.eventTitle}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                      {proof.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#d8afbf] mt-1 font-medium">
                    <span>Winner: <strong className="text-[#fdf2f4]">{proof.recipientHandle}</strong></span>
                    <span>•</span>
                    <span>Ref: <code className="bg-[#2f122c] px-1.5 py-0.5 rounded text-[#f472b6] border border-[#e8a8b8]/20">{proof.transactionRef}</code></span>
                    <span>•</span>
                    <span>{proof.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#e8a8b8]/20">
                <div className="text-right">
                  <div className="font-editorial text-2xl font-bold text-[#f472b6]">
                    {proof.amount}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#d8afbf] font-semibold">
                    via {proof.paymentMethod}
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#b54a67] to-[#d3738b] hover:shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  View Proof
                </button>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* Transaction Inspection Modal with Liquid Glass Backdrop */}
      {selectedProof && (
        <div
          className="fixed inset-0 z-50 bg-[#0e050f]/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedProof(null)}
        >
          <div
            className="w-full max-w-md bg-[#160718] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#e8a8b8]/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#e8a8b8]/20 mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#f472b6]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Payout Ledger Record</span>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#d8afbf] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-4 mb-6">
              <span className="text-xs uppercase tracking-wider text-[#d8afbf] font-semibold">Disbursed Amount</span>
              <div className="font-editorial text-4xl font-bold text-[#f472b6] mt-1">
                {selectedProof.amount}
              </div>
              <span className="text-xs text-emerald-300 font-medium flex items-center justify-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct {selectedProof.paymentMethod} Transfer
              </span>
            </div>

            <div className="space-y-3 text-xs bg-[#220d20] p-4 rounded-2xl border border-[#e8a8b8]/20 mb-6">
              <div className="flex justify-between">
                <span className="text-[#d8afbf] font-medium">Event:</span>
                <span className="font-semibold text-[#fdf2f4]">{selectedProof.eventTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#d8afbf] font-medium">Winner Handle:</span>
                <span className="font-semibold text-[#fdf2f4]">{selectedProof.recipientHandle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#d8afbf] font-medium">Transaction Hash:</span>
                <code className="text-[#f472b6]">{selectedProof.transactionRef}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-[#d8afbf] font-medium">Dispatch Date:</span>
                <span className="text-[#fdf2f4]">{selectedProof.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#d8afbf] font-medium">Notes:</span>
                <span className="text-[#fdf2f4] italic">{selectedProof.verificationNote}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedProof(null)}
              className="w-full py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* FAQ Section with Liquid Glass */}
      <section className="max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-[32px] bg-[#160718]/80 border border-[#e8a8b8]/20 backdrop-blur-md shadow-xl">
          <SectionHeader
            align="center"
            eyebrow="Transparency FAQ"
            icon={<HelpCircle className="w-3.5 h-3.5 text-[#f472b6]" />}
            title="Common Questions"
            subtitle="Everything you need to know about our event rewards, gift dispatching, and verifications."
          />

          <div className="space-y-4">
            {PAYOUT_FAQ.map((faq, i) => (
              <SpotlightCard
                key={i}
                spotlightColor="rgba(244, 114, 182, 0.1)"
                borderColor="rgba(232, 168, 184, 0.35)"
                className="p-6 rounded-2xl bg-[#220d20]/80 border border-[#e8a8b8]/20 shadow-xs"
              >
                <h3 className="font-sans-clean font-semibold text-base text-[#fdf2f4] mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#f472b6] shrink-0" />
                  <span>{faq.q}</span>
                </h3>
                <p className="font-editorial text-sm sm:text-base text-[#d8afbf] leading-relaxed pl-6">
                  {faq.a}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
