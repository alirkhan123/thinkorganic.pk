import React from 'react';
import { MixRecipe, CostSummary, MarginMode } from '../types/dryfruit';
import { formatPKR, formatPercent, formatWeight } from '../utils/calculations';
import { DollarSign, Percent, TrendingUp, Layers, HelpCircle } from 'lucide-react';

interface MarginPricingEngineProps {
  recipe: MixRecipe;
  costSummary: CostSummary;
  onUpdateRecipe: (updates: Partial<MixRecipe>) => void;
}

export const MarginPricingEngine: React.FC<MarginPricingEngineProps> = ({
  recipe,
  costSummary,
  onUpdateRecipe,
}) => {
  const marginPresets = [20, 25, 30, 35, 40, 50];
  const markupPresets = [25, 35, 50, 65, 80, 100];

  const rawPercent =
    costSummary.totalCostPerUnit > 0
      ? (costSummary.totalRawIngredientCost / costSummary.totalCostPerUnit) * 100
      : 0;
  const pkgPercent = 100 - rawPercent;

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              3. Margin, Pricing &amp; Commercial Profit Engine
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              (Currency in PKR Rs.)
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Configure profit margin, markup or target retail price. Calculates per-pack profit and batch revenue.
          </p>
        </div>

        {/* Margin Mode Selector */}
        <div className="inline-flex p-1 bg-stone-200/80 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onUpdateRecipe({ marginMode: 'margin' })}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              recipe.marginMode === 'margin'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Margin % on Price
          </button>
          <button
            type="button"
            onClick={() => onUpdateRecipe({ marginMode: 'markup' })}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              recipe.marginMode === 'markup'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Markup % on Cost
          </button>
          <button
            type="button"
            onClick={() => onUpdateRecipe({ marginMode: 'target_price' })}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              recipe.marginMode === 'target_price'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Fixed Price (Rs.)
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Margin Controls Box */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
          {recipe.marginMode === 'margin' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-amber-600" />
                  Target Profit Margin (% of Selling Price)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    step="0.5"
                    value={recipe.targetMarginPercent}
                    onChange={(e) =>
                      onUpdateRecipe({
                        targetMarginPercent: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-20 text-right px-2 py-1 bg-white border border-stone-300 rounded font-mono font-bold text-stone-900 focus:ring-1 focus:ring-amber-500 text-sm"
                  />
                  <span className="text-sm font-bold text-stone-600">%</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="5"
                max="70"
                step="0.5"
                value={recipe.targetMarginPercent}
                onChange={(e) =>
                  onUpdateRecipe({
                    targetMarginPercent: parseFloat(e.target.value),
                  })
                }
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
              />

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs text-stone-500 font-medium">Quick Margin:</span>
                {marginPresets.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => onUpdateRecipe({ targetMarginPercent: pct })}
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded ${
                      recipe.targetMarginPercent === pct
                        ? 'bg-amber-400 text-stone-900'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {recipe.marginMode === 'markup' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  Target Markup (% Over Total Cost)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    step="1"
                    value={recipe.targetMarkupPercent}
                    onChange={(e) =>
                      onUpdateRecipe({
                        targetMarkupPercent: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-20 text-right px-2 py-1 bg-white border border-stone-300 rounded font-mono font-bold text-stone-900 focus:ring-1 focus:ring-amber-500 text-sm"
                  />
                  <span className="text-sm font-bold text-stone-600">%</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="10"
                max="150"
                step="1"
                value={recipe.targetMarkupPercent}
                onChange={(e) =>
                  onUpdateRecipe({
                    targetMarkupPercent: parseFloat(e.target.value),
                  })
                }
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
              />

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs text-stone-500 font-medium">Quick Markup:</span>
                {markupPresets.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => onUpdateRecipe({ targetMarkupPercent: pct })}
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded ${
                      recipe.targetMarkupPercent === pct
                        ? 'bg-amber-400 text-stone-900'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {recipe.marginMode === 'target_price' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  Custom Selling Price (PKR)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-stone-500 font-mono">Rs.</span>
                  <input
                    type="number"
                    min="1"
                    step="25"
                    value={recipe.customSellingPrice}
                    onChange={(e) =>
                      onUpdateRecipe({
                        customSellingPrice: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-28 text-right px-2 py-1 bg-white border border-stone-300 rounded font-mono font-bold text-base text-stone-900 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
              <p className="text-xs text-stone-500">
                Enter your desired retail sticker price. The tool automatically computes your exact profit, margin %, and markup % based on current nut costs.
              </p>
            </div>
          )}
        </div>

        {/* Pricing & Margin Results Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider block">
              Unit Total Cost
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
              {formatPKR(costSummary.totalCostPerUnit, 1)}
            </div>
            <div className="text-xs text-stone-500 mt-1">
              Raw: {formatPKR(costSummary.totalRawIngredientCost, 0)} · Pkg: {formatPKR(costSummary.totalPackagingCost, 0)}
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider block">
              Selling Price (SRP)
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
              {formatPKR(costSummary.sellingPrice, 0)}
            </div>
            <div className="text-xs text-amber-800 mt-1 font-medium">
              Per {recipe.packSizeGrams}g retail pack
            </div>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider block">
              Net Profit / Pack
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">
              +{formatPKR(costSummary.profitPerUnit, 1)}
            </div>
            <div className="text-xs text-emerald-700 mt-1 font-medium">
              {formatPercent(costSummary.grossMarginPercent)} margin
            </div>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider block">
              Markup on Cost
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-stone-800 mt-1 tabular-nums">
              {formatPercent(costSummary.markupPercent)}
            </div>
            <div className="text-xs text-stone-500 mt-1">
              Cost: {formatPKR(costSummary.costPer100g, 0)}/100g
            </div>
          </div>
        </div>

        {/* Cost Structure Breakdown Bar */}
        <div className="p-4 border border-stone-200 rounded-xl bg-white">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
            <span>Per Pack Cost Composition</span>
            <span className="font-mono text-stone-500">
              Raw Nuts: {formatPercent(rawPercent)} · Packaging &amp; Labor: {formatPercent(pkgPercent)}
            </span>
          </div>
          <div className="w-full h-3 bg-stone-100 rounded-full flex overflow-hidden">
            <div
              className="bg-amber-600 transition-all duration-300"
              style={{ width: `${rawPercent}%` }}
              title={`Raw Dry Fruits: ${formatPKR(costSummary.totalRawIngredientCost, 1)}`}
            />
            <div
              className="bg-stone-500 transition-all duration-300"
              style={{ width: `${pkgPercent}%` }}
              title={`Packaging & Labor: ${formatPKR(costSummary.totalPackagingCost, 1)}`}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500 mt-2 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-600 rounded-xs inline-block" />
              Raw Dry Fruits: {formatPKR(costSummary.totalRawIngredientCost, 1)} ({formatPKR(costSummary.rawCostPerKg)}/kg)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-stone-500 rounded-xs inline-block" />
              Packaging &amp; Labor: {formatPKR(costSummary.totalPackagingCost, 1)}
            </span>
          </div>
        </div>

        {/* Commercial Batch Production Simulator */}
        <div className="p-4 sm:p-5 bg-stone-900 text-stone-100 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Commercial Batch Production Run
                </h4>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Scale production run by number of packs to calculate total cash outlay and expected profit.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-medium">Batch Run:</span>
              <input
                type="number"
                min="10"
                step="50"
                value={recipe.batchQuantityPacks}
                onChange={(e) =>
                  onUpdateRecipe({
                    batchQuantityPacks: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-24 text-right px-2.5 py-1 bg-stone-800 border border-stone-700 text-amber-300 font-mono font-bold text-sm rounded focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <span className="text-xs text-stone-300 font-medium">packs</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-3 bg-stone-800/80 border border-stone-700/80 rounded-lg">
              <span className="text-xs text-stone-400 uppercase tracking-wider block">
                Total Batch Weight
              </span>
              <div className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
                {costSummary.totalBatchWeightKg.toFixed(1)} kg
              </div>
              <span className="text-[11px] text-stone-400">
                {costSummary.batchPacks} × {recipe.packSizeGrams}g packs
              </span>
            </div>

            <div className="p-3 bg-stone-800/80 border border-stone-700/80 rounded-lg">
              <span className="text-xs text-stone-400 uppercase tracking-wider block">
                Total Batch Cost
              </span>
              <div className="text-lg font-bold font-mono text-stone-200 mt-1 tabular-nums">
                {formatPKR(costSummary.totalBatchCost, 0)}
              </div>
              <span className="text-[11px] text-stone-400">
                Cash required to produce
              </span>
            </div>

            <div className="p-3 bg-stone-800/80 border border-stone-700/80 rounded-lg">
              <span className="text-xs text-stone-400 uppercase tracking-wider block">
                Gross Batch Revenue
              </span>
              <div className="text-lg font-bold font-mono text-amber-300 mt-1 tabular-nums">
                {formatPKR(costSummary.totalBatchRevenue, 0)}
              </div>
              <span className="text-[11px] text-stone-400">
                At retail sticker price
              </span>
            </div>

            <div className="p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-lg">
              <span className="text-xs text-emerald-400 uppercase tracking-wider block">
                Net Batch Profit
              </span>
              <div className="text-lg font-bold font-mono text-emerald-300 mt-1 tabular-nums">
                +{formatPKR(costSummary.totalBatchProfit, 0)}
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {formatPercent(costSummary.grossMarginPercent)} gross margin
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
