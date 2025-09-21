import React from 'react';
import { ArrowLeft, FileText, ShoppingBag, BarChart3 } from 'lucide-react';

interface TemplateDetailData {
  id: string;
  name: string;
  category: string;
  usage: number;
  lastModified: string;
  owner: string;
  description: string;
}

interface MarketplaceDetailData {
  id: string;
  name: string;
  category: string;
  type: string;
  createdAt: string;
  downloads: number;
  rating: number;
  owner: string;
  description: string;
}

type AssetDetailsProps =
  | { type: 'template'; data: TemplateDetailData; onBack: () => void }
  | { type: 'marketplace'; data: MarketplaceDetailData; onBack: () => void };

const AssetDetails: React.FC<AssetDetailsProps> = ({ type, data, onBack }) => {
  const isTemplate = type === 'template';
  const HeaderIcon = isTemplate ? FileText : ShoppingBag;
  const title = isTemplate ? 'Template' : 'Marketplace Asset';
  const primaryMetricLabel = isTemplate ? 'Launches' : 'Downloads';
  const secondaryMetricLabel = isTemplate ? 'Last Updated' : 'Rating';
  const primaryMetricValue = isTemplate
    ? (data as TemplateDetailData).usage.toLocaleString()
    : `${(data as MarketplaceDetailData).downloads.toLocaleString()}`;
  const secondaryMetricValue = isTemplate
    ? new Date((data as TemplateDetailData).lastModified).toLocaleDateString()
    : `${(data as MarketplaceDetailData).rating.toFixed(1)}/5`;

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--accent-purple)] hover:text-[var(--accent-orange)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Systems Hub</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent-orange)] via-[var(--accent-pink)] to-[var(--accent-purple)] flex items-center justify-center text-white shadow-lg">
            <HeaderIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[var(--fg)]">{data.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wide px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)]">
                {title}
              </span>
              <span className="text-xs uppercase tracking-wide px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)]">
                {data.category}
              </span>
              <span className="text-xs uppercase tracking-wide px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)]">
                {isTemplate ? `Maintainer · ${(data as TemplateDetailData).owner}` : `Contributor · ${(data as MarketplaceDetailData).owner}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur space-y-3">
            <h2 className="text-xl font-semibold text-[var(--fg)]">Overview</h2>
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{data.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 p-4">
                <p className="text-xs text-[var(--fg-muted)] uppercase tracking-wide">{primaryMetricLabel}</p>
                <p className="text-[var(--fg)] text-xl font-semibold mt-1">{primaryMetricValue}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 p-4">
                <p className="text-xs text-[var(--fg-muted)] uppercase tracking-wide">{secondaryMetricLabel}</p>
                <p className="text-[var(--fg)] text-xl font-semibold mt-1">{secondaryMetricValue}</p>
              </div>
            </div>
          </div>

          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur space-y-3">
            <h2 className="text-xl font-semibold text-[var(--fg)] flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <span>How teams use it</span>
            </h2>
            {isTemplate ? (
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                Launch this template to spin up a repeatable {data.category.toLowerCase()} workflow. Keep notes on adaptations and
                improvements so delivery stays consistent across clients.
              </p>
            ) : (
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                Share this asset to accelerate activation inside other workspaces. Document integrations, dependencies, and
                attribution when you publish updates to the marketplace.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl p-6 backdrop-blur space-y-3 text-sm">
            <h3 className="text-lg font-semibold text-[var(--fg)]">Key Details</h3>
            {isTemplate ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--fg-muted)]">Maintainer</span>
                  <span className="text-[var(--fg)] font-medium">{(data as TemplateDetailData).owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--fg-muted)]">Last Updated</span>
                  <span className="text-[var(--fg)] font-medium">{new Date((data as TemplateDetailData).lastModified).toLocaleDateString()}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--fg-muted)]">Contributor</span>
                  <span className="text-[var(--fg)] font-medium">{(data as MarketplaceDetailData).owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--fg-muted)]">Published</span>
                  <span className="text-[var(--fg)] font-medium">{new Date((data as MarketplaceDetailData).createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--fg-muted)]">Asset Type</span>
                  <span className="text-[var(--fg)] font-medium">{(data as MarketplaceDetailData).type}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;
