import React, { useState } from 'react';
import { MixRecipe, CostSummary, ChannelPricingConfig } from '../types/dryfruit';
import { calculateChannelPrices, formatPKR, formatPercent, formatWeight } from '../utils/calculations';
import { X, Printer, Copy, Check, Download, FileText } from 'lucide-react';

interface PrintableCostSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: MixRecipe;
  costSummary: CostSummary;
  channels: ChannelPricingConfig[];
}

export const PrintableCostSheetModal: React.FC<PrintableCostSheetModalProps> = ({
  isOpen,
  onClose,
  recipe,
  costSummary,
  channels,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const channelPrices = calculateChannelPrices(costSummary, channels);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyQuote = () => {
    const textQuote = `================================================
KARAKORAM DRY FRUITS — PRODUCT COSTING SHEET & QUOTE
================================================
Product Blend: ${recipe.title}
Net Weight: ${recipe.packSizeGrams}g per pack
Batch Size: ${recipe.batchQuantityPacks} packs (${costSummary.totalBatchWeightKg.toFixed(1)} kg)
Date: ${new Date().toLocaleDateString('en-GB')}

--- INGREDIENT COMPOSITION ---
${recipe.ingredients
  .map(
    (i) =>
      `• ${i.name.padEnd(30)}: ${i.weightGrams}g @ Rs. ${i.pricePerKg}/kg => Rs. ${(
        ((i.weightGrams * (1 + i.wastagePercent / 100)) / 1000) *
        i.pricePerKg
      ).toFixed(1)}`
  )
  .join('\n')}

--- PACKAGING & DIRECT LABOR ---
${recipe.packaging
  .filter((p) => p.enabled)
  .map((p) => `• ${p.name.padEnd(30)}: Rs. ${p.costPerUnit.toFixed(1)}`)
  .join('\n')}

--- UNIT FINANCIAL METRICS (PKR) ---
Total Raw Nut Cost:     ${formatPKR(costSummary.totalRawIngredientCost, 1)}
Total Packaging & Labor: ${formatPKR(costSummary.totalPackagingCost, 1)}
TOTAL UNIT COST:        ${formatPKR(costSummary.totalCostPerUnit, 1)}
Cost per 100g:          ${formatPKR(costSummary.costPer100g, 1)}
Cost per 1 kg:          ${formatPKR(costSummary.costPerKgPack, 1)}

Target Margin:          ${formatPercent(costSummary.grossMarginPercent)}
Target Markup:          ${formatPercent(costSummary.markupPercent)}
RECOMMENDED PRICE (SRP): ${formatPKR(costSummary.sellingPrice, 0)}
NET PROFIT PER PACK:    +${formatPKR(costSummary.profitPerUnit, 1)}

--- TRADE & CHANNEL PRICING ---
${channelPrices
  .map(
    (cp) =>
      `• ${cp.channel.name.padEnd(32)}: Invoiced Rs. ${cp.wholesaleSellingPrice} (Profit +Rs. ${
        cp.profitPerPack
      }, Margin ${cp.marginPercent.toFixed(1)}%)`
  )
  .join('\n')}

--- BATCH PRODUCTION (${recipe.batchQuantityPacks} PACKS) ---
Total Capital Outlay:   ${formatPKR(costSummary.totalBatchCost, 0)}
Total Expected Revenue: ${formatPKR(costSummary.totalBatchRevenue, 0)}
Total Net Batch Profit: ${formatPKR(costSummary.totalBatchProfit, 0)}
================================================`;

    navigator.clipboard.writeText(textQuote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-stone-200">
        {/* Top Action Bar (hidden when printing) */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-stone-700" />
            <span className="text-sm font-bold text-stone-900">
              Commercial Cost Accounting Sheet &amp; Quotation
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyQuote}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Text Quote</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document View */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white font-sans text-stone-900">
          {/* Header block */}
          <div className="border-b-2 border-stone-900 pb-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-stone-900 uppercase">
                  Karakoram Dry Fruits
                </h1>
                <div className="text-xs text-stone-500 font-medium mt-0.5">
                  Internal Formulation Costing Sheet &amp; Commercial Pricing Matrix
                </div>
              </div>
              <div className="text-left sm:text-right font-mono text-xs text-stone-600">
                <div>Document Date: {new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div>Currency: Pakistani Rupee (PKR Rs.)</div>
              </div>
            </div>

            {/* Formulation metadata */}
            <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-stone-500 block">Product Blend:</span>
                <span className="font-bold text-stone-900">{recipe.title}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Net Pack Weight:</span>
                <span className="font-bold font-mono text-stone-900">{recipe.packSizeGrams}g</span>
              </div>
              <div>
                <span className="text-stone-500 block">Batch Scale:</span>
                <span className="font-bold font-mono text-stone-900">{recipe.batchQuantityPacks} Packs ({costSummary.totalBatchWeightKg.toFixed(1)} kg)</span>
              </div>
              <div>
                <span className="text-stone-500 block">Margin Mode:</span>
                <span className="font-bold font-mono text-stone-900 capitalize">{recipe.marginMode.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Table 1: Raw Ingredients */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              1. Raw Dry Fruit &amp; Nut Formulation
            </h2>
            <table className="w-full text-left text-xs border border-stone-300">
              <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-300">
                <tr>
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-2 text-right">Net Wt</th>
                  <th className="py-2 px-2 text-right">Market Rate (PKR/kg)</th>
                  <th className="py-2 px-2 text-right">Loss %</th>
                  <th className="py-2 px-2 text-right">Blend Share</th>
                  <th className="py-2 px-3 text-right">Cost (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {recipe.ingredients.map((item) => {
                  const weight = Number(item.weightGrams) || 0;
                  const grossWeight = weight * (1 + (item.wastagePercent || 0) / 100);
                  const cost = (grossWeight / 1000) * item.pricePerKg;
                  const weightShare = costSummary.netWeightGrams > 0 ? (weight / costSummary.netWeightGrams) * 100 : 0;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50">
                      <td className="py-2 px-3 font-medium text-stone-900">
                        {item.name}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">{weight}g</td>
                      <td className="py-2 px-2 text-right font-mono">{formatPKR(item.pricePerKg)}</td>
                      <td className="py-2 px-2 text-right font-mono">{item.wastagePercent}%</td>
                      <td className="py-2 px-2 text-right font-mono">{formatPercent(weightShare, 1)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">
                        {formatPKR(cost, 1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-stone-100 font-bold border-t border-stone-300">
                <tr>
                  <td className="py-2 px-3">Raw Subtotal</td>
                  <td className="py-2 px-2 text-right font-mono">{costSummary.netWeightGrams}g</td>
                  <td className="py-2 px-2 text-right font-mono text-stone-500">
                    Avg: {formatPKR(costSummary.rawCostPerKg)}/kg
                  </td>
                  <td></td>
                  <td className="py-2 px-2 text-right font-mono">100%</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-800">
                    {formatPKR(costSummary.totalRawIngredientCost, 1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Table 2: Packaging & Overhead */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              2. Packaging, Sealing &amp; Direct Labor
            </h2>
            <table className="w-full text-left text-xs border border-stone-300">
              <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-300">
                <tr>
                  <th className="py-2 px-3">Packaging Component / Labor Specification</th>
                  <th className="py-2 px-2 text-left">Category</th>
                  <th className="py-2 px-3 text-right">Cost / Unit (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {recipe.packaging
                  .filter((p) => p.enabled)
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="py-2 px-3 font-medium text-stone-900">{p.name}</td>
                      <td className="py-2 px-2 capitalize text-stone-500">{p.category}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">
                        {formatPKR(p.costPerUnit, 1)}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot className="bg-stone-100 font-bold border-t border-stone-300">
                <tr>
                  <td className="py-2 px-3" colSpan={2}>
                    Packaging &amp; Labor Subtotal
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-stone-900">
                    {formatPKR(costSummary.totalPackagingCost, 1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Financial Summary KPI Strip */}
          <div className="p-4 border-2 border-stone-900 rounded-xl bg-stone-50 mb-6 print-break-inside-avoid">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-stone-500 font-sans block">Total Unit Cost:</span>
                <span className="text-lg font-bold text-stone-900">
                  {formatPKR(costSummary.totalCostPerUnit, 1)}
                </span>
              </div>
              <div>
                <span className="text-stone-500 font-sans block">Gross Margin %:</span>
                <span className="text-lg font-bold text-emerald-800">
                  {formatPercent(costSummary.grossMarginPercent)}
                </span>
              </div>
              <div>
                <span className="text-stone-500 font-sans block">Suggested Retail (SRP):</span>
                <span className="text-lg font-bold text-stone-900">
                  {formatPKR(costSummary.sellingPrice, 0)}
                </span>
              </div>
              <div>
                <span className="text-stone-500 font-sans block">Net Profit / Pack:</span>
                <span className="text-lg font-bold text-emerald-800">
                  +{formatPKR(costSummary.profitPerUnit, 1)}
                </span>
              </div>
            </div>
          </div>

          {/* Table 3: Trade & Channel Pricing */}
          <div className="mb-6 print-break-inside-avoid">
            <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              3. Channel Pricing &amp; Wholesale Discount Schedule
            </h2>
            <table className="w-full text-left text-xs border border-stone-300">
              <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-300">
                <tr>
                  <th className="py-2 px-3">Sales Channel</th>
                  <th className="py-2 px-2 text-right">Invoiced Trade Rate</th>
                  <th className="py-2 px-2 text-right">Consumer Shelf Price</th>
                  <th className="py-2 px-2 text-right">Brand Net Profit</th>
                  <th className="py-2 px-3 text-right">Realized Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {channelPrices.map((cp) => (
                  <tr key={cp.channel.id} className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-medium text-stone-900">
                      {cp.channel.name}
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-stone-900">
                      {formatPKR(cp.wholesaleSellingPrice)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-stone-700">
                      {formatPKR(cp.consumerShelfPrice)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-emerald-800 font-bold">
                      +{formatPKR(cp.profitPerPack)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {formatPercent(cp.marginPercent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Batch Totals */}
          <div className="p-4 bg-stone-100 rounded-lg text-xs font-mono flex flex-col sm:flex-row justify-between items-center gap-3 print-break-inside-avoid">
            <span>
              Batch Scale: <strong>{recipe.batchQuantityPacks} packs</strong> ({costSummary.totalBatchWeightKg.toFixed(1)} kg)
            </span>
            <div className="flex items-center gap-4">
              <span>Production Outlay: <strong>{formatPKR(costSummary.totalBatchCost, 0)}</strong></span>
              <span>Revenue: <strong>{formatPKR(costSummary.totalBatchRevenue, 0)}</strong></span>
              <span className="text-emerald-800 font-bold">Net Profit: +{formatPKR(costSummary.totalBatchProfit, 0)}</span>
            </div>
          </div>

          {/* Signoff / verification */}
          <div className="mt-8 pt-6 border-t border-stone-300 grid grid-cols-2 gap-8 text-xs text-stone-500 print-break-inside-avoid">
            <div>
              <div className="h-10 border-b border-stone-300 mb-1" />
              <span>Prepared By: Cost Accountant / QA</span>
            </div>
            <div>
              <div className="h-10 border-b border-stone-300 mb-1" />
              <span>Approved By: Commercial Director / Brand Lead</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
