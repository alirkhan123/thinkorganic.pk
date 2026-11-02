import React, { useState } from 'react';
import { MixRecipe, CostSummary } from '../types/dryfruit';
import { calculateCostSummary, formatPKR, formatPercent } from '../utils/calculations';
import { Activity, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

interface PriceSensitivitySimulatorProps {
  recipe: MixRecipe;
  costSummary: CostSummary;
}

export const PriceSensitivitySimulator: React.FC<PriceSensitivitySimulatorProps> = ({
  recipe,
  costSummary,
}) => {
  const [nutPriceChangePercent, setNutPriceChangePercent] = useState<number>(15);
  const [pkgPriceChangePercent, setPkgPriceChangePercent] = useState<number>(10);

  // Create simulated recipe
  const simulatedRecipe: MixRecipe = {
    ...recipe,
    ingredients: recipe.ingredients.map((ing) => ({
      ...ing,
      pricePerKg: ing.pricePerKg * (1 + nutPriceChangePercent / 100),
    })),
    packaging: recipe.packaging.map((pkg) => ({
      ...pkg,
      costPerUnit: pkg.costPerUnit * (1 + pkgPriceChangePercent / 100),
    })),
  };

  const stressedSummary = calculateCostSummary(simulatedRecipe);

  // If selling price is kept fixed at original:
  const erodedProfitIfFixedPrice = costSummary.sellingPrice - stressedSummary.totalCostPerUnit;
  const erodedMarginIfFixedPrice =
    costSummary.sellingPrice > 0
      ? (erodedProfitIfFixedPrice / costSummary.sellingPrice) * 100
      : 0;

  // New selling price required to maintain target margin:
  const targetMargin = recipe.targetMarginPercent;
  const requiredNewPriceToMaintainMargin =
    targetMargin < 100
      ? stressedSummary.totalCostPerUnit / (1 - targetMargin / 100)
      : stressedSummary.totalCostPerUnit;
  const priceHikeRequired = requiredNewPriceToMaintainMargin - costSummary.sellingPrice;

  // Find top 3 ingredients by cost contribution
  const sortedIngredients = [...recipe.ingredients].sort((a, b) => {
    const costA = (a.weightGrams / 1000) * a.pricePerKg;
    const costB = (b.weightGrams / 1000) * b.pricePerKg;
    return costB - costA;
  });

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/50">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-stone-900 tracking-tight">
            Raw Material Price Volatility &amp; Margin Stress Test
          </h3>
        </div>
        <p className="text-xs text-stone-600 mt-1">
          Simulate market inflation in PKR dry fruit procurement and analyze margin erosion or required retail price adjustments.
        </p>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-stone-50 rounded-xl border border-stone-200">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-800">
                Dry Fruit Raw Material Rate Shift
              </label>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  nutPriceChangePercent > 0
                    ? 'bg-amber-100 text-amber-800'
                    : nutPriceChangePercent < 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {nutPriceChangePercent > 0 ? `+${nutPriceChangePercent}%` : `${nutPriceChangePercent}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="50"
              step="5"
              value={nutPriceChangePercent}
              onChange={(e) => setNutPriceChangePercent(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
            />
            <div className="flex justify-between text-[11px] text-stone-600 mt-1">
              <span>-20% (Bumper harvest)</span>
              <span>0% Baseline</span>
              <span>+50% (Import surge)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-800">
                Packaging &amp; Labor Cost Shift
              </label>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  pkgPriceChangePercent > 0
                    ? 'bg-amber-100 text-amber-800'
                    : pkgPriceChangePercent < 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {pkgPriceChangePercent > 0 ? `+${pkgPriceChangePercent}%` : `${pkgPriceChangePercent}%`}
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="40"
              step="5"
              value={pkgPriceChangePercent}
              onChange={(e) => setPkgPriceChangePercent(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
            />
            <div className="flex justify-between text-[11px] text-stone-600 mt-1">
              <span>-15% (Bulk procurement)</span>
              <span>0% Baseline</span>
              <span>+40% (Polymer/freight hike)</span>
            </div>
          </div>
        </div>

        {/* Comparison Cards: Current vs Stressed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Scenario A: If selling price stays fixed */}
          <div className="p-4 border border-stone-200 rounded-xl bg-white shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-stone-800 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Scenario A: Keep Retail Sticker Price Fixed
            </div>
            <p className="text-xs text-stone-500 mb-4">
              If market forces prevent price hikes and retail price stays at{' '}
              <strong className="text-stone-900">{formatPKR(costSummary.sellingPrice)}</strong>:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-sans">New Unit Production Cost:</span>
                <span className="font-bold text-stone-900 tabular-nums">
                  {formatPKR(stressedSummary.totalCostPerUnit, 1)}{' '}
                  <span className="text-amber-800 text-[11px]">
                    (+{formatPKR(stressedSummary.totalCostPerUnit - costSummary.totalCostPerUnit, 1)})
                  </span>
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-sans">Eroded Net Profit / Pack:</span>
                <span
                  className={`font-bold tabular-nums ${
                    erodedProfitIfFixedPrice > 0 ? 'text-amber-700' : 'text-red-600'
                  }`}
                >
                  {formatPKR(erodedProfitIfFixedPrice, 1)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 font-sans">
                <span className="font-semibold text-stone-700">Resulting Gross Margin:</span>
                <span
                  className={`font-mono font-bold text-sm tabular-nums ${
                    erodedMarginIfFixedPrice >= 25
                      ? 'text-emerald-700'
                      : erodedMarginIfFixedPrice >= 15
                      ? 'text-amber-700'
                      : 'text-red-600'
                  }`}
                >
                  {formatPercent(erodedMarginIfFixedPrice)}{' '}
                  <span className="text-xs text-stone-500 font-normal">
                    (was {formatPercent(costSummary.grossMarginPercent)})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Scenario B: Adjust retail price to defend margin */}
          <div className="p-4 border border-stone-200 rounded-xl bg-amber-50/40 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-stone-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Scenario B: Defend Target {recipe.targetMarginPercent}% Margin
            </div>
            <p className="text-xs text-stone-600 mb-4">
              Adjustment needed on retail sticker price to maintain original profitability:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-amber-200/60">
                <span className="text-stone-600 font-sans">Required New Selling Price:</span>
                <span className="font-bold text-base text-stone-900 tabular-nums">
                  {formatPKR(requiredNewPriceToMaintainMargin, 0)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-amber-200/60">
                <span className="text-stone-600 font-sans">Suggested Price Hike:</span>
                <span className="font-bold text-amber-800 tabular-nums">
                  +{formatPKR(priceHikeRequired, 0)} per pack
                </span>
              </div>

              <div className="flex justify-between py-1.5 font-sans">
                <span className="font-semibold text-stone-800">Protected Profit / Pack:</span>
                <span className="font-mono font-bold text-sm text-emerald-800 tabular-nums">
                  +{formatPKR(requiredNewPriceToMaintainMargin - stressedSummary.totalCostPerUnit, 1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vulnerability Matrix: Top Cost Drivers */}
        <div className="p-4 border border-stone-200 rounded-xl bg-stone-50">
          <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
            Highest Cost Vulnerability Ingredients in this Blend
          </h4>
          <p className="text-xs text-stone-500 mb-3">
            These dry fruits account for the largest share of your raw ingredient expenditure. Small price spikes in these items impact margin most heavily.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sortedIngredients.slice(0, 3).map((item, idx) => {
              const weight = Number(item.weightGrams) || 0;
              const cost = (weight / 1000) * item.pricePerKg;
              const costShare = costSummary.totalRawIngredientCost > 0 ? (cost / costSummary.totalRawIngredientCost) * 100 : 0;

              return (
                <div key={item.id} className="p-3 bg-white border border-stone-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      #{idx + 1} {item.name.split('(')[0]}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      {formatPercent(costShare, 0)} cost
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 font-mono">
                    Weight: {weight}g · Rate: {formatPKR(item.pricePerKg)}/kg
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
