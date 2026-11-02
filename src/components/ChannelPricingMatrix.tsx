import React from 'react';
import { ChannelPricingConfig, CostSummary } from '../types/dryfruit';
import { calculateChannelPrices, formatPKR, formatPercent } from '../utils/calculations';
import { Store, ShoppingBag, Truck, Building2, Sliders, Info } from 'lucide-react';

interface ChannelPricingMatrixProps {
  channels: ChannelPricingConfig[];
  costSummary: CostSummary;
  onUpdateChannel: (id: string, updates: Partial<ChannelPricingConfig>) => void;
}

export const ChannelPricingMatrix: React.FC<ChannelPricingMatrixProps> = ({
  channels,
  costSummary,
  onUpdateChannel,
}) => {
  const channelPrices = calculateChannelPrices(costSummary, channels);

  const getChannelIcon = (id: string) => {
    switch (id) {
      case 'd2c_retail':
        return <ShoppingBag className="w-5 h-5 text-amber-700" />;
      case 'wholesale_b2b':
        return <Building2 className="w-5 h-5 text-blue-700" />;
      case 'modern_trade':
        return <Store className="w-5 h-5 text-emerald-700" />;
      case 'online_courier':
        return <Truck className="w-5 h-5 text-purple-700" />;
      default:
        return <Store className="w-5 h-5 text-stone-700" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-600" />
              Multi-Channel Distribution &amp; Wholesale Pricing Matrix
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Base unit production cost: <strong className="font-mono text-stone-900">{formatPKR(costSummary.totalCostPerUnit, 1)}</strong>. 
              Configure custom channel margins to set competitive trade terms for wholesale, supermarkets, and online.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 px-3 py-2 rounded-lg border border-stone-200">
            <Info className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Retailer cut reflects supermarket vendor margin (e.g. 18% for Imtiaz/Carrefour).</span>
          </div>
        </div>
      </div>

      {/* Grid of channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {channelPrices.map(({ channel, totalCostWithLogistics, wholesaleSellingPrice, consumerShelfPrice, profitPerPack, marginPercent, markupPercent }) => (
          <div
            key={channel.id}
            className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-stone-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-stone-100 rounded-lg">
                    {getChannelIcon(channel.id)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{channel.name}</h4>
                    <p className="text-xs text-stone-500 leading-snug">{channel.notes}</p>
                  </div>
                </div>
              </div>

              {/* Channel Controls (Margin % & Extra buffer) */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 mb-4">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Target Margin %
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="75"
                      step="1"
                      value={channel.targetMarginPercent}
                      onChange={(e) =>
                        onUpdateChannel(channel.id, {
                          targetMarginPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 py-1 bg-white border border-stone-300 rounded text-xs font-mono font-bold text-stone-900"
                    />
                    <span className="text-xs font-bold text-stone-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    {channel.retailerCutPercent ? 'Retailer Cut %' : 'Transit Surcharge'}
                  </label>
                  {channel.retailerCutPercent ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="1"
                        value={channel.retailerCutPercent}
                        onChange={(e) =>
                          onUpdateChannel(channel.id, {
                            retailerCutPercent: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2 py-1 bg-white border border-stone-300 rounded text-xs font-mono font-bold text-stone-900"
                      />
                      <span className="text-xs font-bold text-stone-500">%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-stone-400 font-mono">Rs.</span>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={channel.additionalCostPerUnit}
                        onChange={(e) =>
                          onUpdateChannel(channel.id, {
                            additionalCostPerUnit: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2 py-1 bg-white border border-stone-300 rounded text-xs font-mono font-bold text-stone-900"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Price Output Breakdown */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500 font-sans">Effective Unit Cost:</span>
                  <span className="text-stone-800 font-bold tabular-nums">
                    {formatPKR(totalCostWithLogistics, 1)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-700 font-sans font-semibold">
                    Brand Invoiced Price:
                  </span>
                  <span className="text-stone-900 font-bold text-sm tabular-nums">
                    {formatPKR(wholesaleSellingPrice)}
                  </span>
                </div>

                {channel.retailerCutPercent && channel.retailerCutPercent > 0 && (
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-amber-800 font-sans font-medium">
                      Consumer Shelf Sticker Price:
                    </span>
                    <span className="text-amber-900 font-bold text-sm tabular-nums">
                      {formatPKR(consumerShelfPrice)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-1.5 text-emerald-800 font-sans">
                  <span className="font-semibold">Brand Net Profit / Unit:</span>
                  <span className="font-mono font-bold text-sm tabular-nums">
                    +{formatPKR(profitPerPack)} ({formatPercent(marginPercent)} margin)
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom recommendation tag */}
            <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
              <span>Markup: {formatPercent(markupPercent)}</span>
              <span className="text-stone-700 font-medium">
                {channel.id === 'wholesale_b2b' ? 'Min MOQ: 24 Packs (1 Carton)' : 'Standard Pack'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
