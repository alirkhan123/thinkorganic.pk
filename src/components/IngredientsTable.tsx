import React, { useState } from 'react';
import { RecipeIngredient, RawMaterial } from '../types/dryfruit';
import { formatPKR, formatPercent, formatWeight } from '../utils/calculations';
import { Plus, Trash2, ArrowUpDown, Scale, AlertCircle, Info } from 'lucide-react';

interface IngredientsTableProps {
  ingredients: RecipeIngredient[];
  rawMaterials: RawMaterial[];
  packSizeGrams: number;
  onUpdateIngredient: (id: string, updates: Partial<RecipeIngredient>) => void;
  onRemoveIngredient: (id: string) => void;
  onAddIngredient: (rawMaterialId: string) => void;
  onScalePackSize: (newGrams: number) => void;
}

export const IngredientsTable: React.FC<IngredientsTableProps> = ({
  ingredients,
  rawMaterials,
  packSizeGrams,
  onUpdateIngredient,
  onRemoveIngredient,
  onAddIngredient,
  onScalePackSize,
}) => {
  const [selectedAddId, setSelectedAddId] = useState<string>('');

  const totalNetGrams = ingredients.reduce((sum, item) => sum + (Number(item.weightGrams) || 0), 0);
  
  const totalCost = ingredients.reduce((sum, item) => {
    const grossWeight = (Number(item.weightGrams) || 0) * (1 + (Number(item.wastagePercent) || 0) / 100);
    return sum + (grossWeight / 1000) * (Number(item.pricePerKg) || 0);
  }, 0);

  const totalGrossGrams = ingredients.reduce((sum, item) => {
    return sum + (Number(item.weightGrams) || 0) * (1 + (Number(item.wastagePercent) || 0) / 100);
  }, 0);

  const avgRawCostPerKg = totalNetGrams > 0 ? (totalCost / totalNetGrams) * 1000 : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddId) return;
    onAddIngredient(selectedAddId);
    setSelectedAddId('');
  };

  const packSizes = [100, 200, 250, 400, 500, 1000];

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Header & Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              1. Dry Fruit Ingredients &amp; Weight Formulation
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              ({ingredients.length} items)
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Set individual weights and raw purchase rates in PKR/kg. Costs calculate dynamically including sorting loss.
          </p>
        </div>

        {/* Quick Pack Size Auto-scaler */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-stone-500 flex items-center gap-1 mr-1">
            <Scale className="w-3.5 h-3.5 text-stone-400" />
            Pack Scale:
          </span>
          {packSizes.map((size) => (
            <button
              key={size}
              onClick={() => onScalePackSize(size)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                Math.round(totalNetGrams) === size
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {size >= 1000 ? `${size / 1000} kg` : `${size}g`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-stone-700 text-xs uppercase tracking-wider font-semibold border-b border-stone-200">
            <tr>
              <th className="py-3 px-4">Dry Fruit / Nut Item</th>
              <th className="py-3 px-3 text-right">Price (PKR / kg)</th>
              <th className="py-3 px-3 text-right">Net Weight</th>
              <th className="py-3 px-3 text-right">Sorting Loss %</th>
              <th className="py-3 px-3 text-right">Blend Share %</th>
              <th className="py-3 px-3 text-right">Item Cost (PKR)</th>
              <th className="py-3 px-3 text-right">Cost Share %</th>
              <th className="py-3 px-3 text-center w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 text-stone-800">
            {ingredients.map((item) => {
              const weight = Number(item.weightGrams) || 0;
              const wastage = Number(item.wastagePercent) || 0;
              const pricePerKg = Number(item.pricePerKg) || 0;
              const grossWeight = weight * (1 + wastage / 100);
              const cost = (grossWeight / 1000) * pricePerKg;
              const weightShare = totalNetGrams > 0 ? (weight / totalNetGrams) * 100 : 0;
              const costShare = totalCost > 0 ? (cost / totalCost) * 100 : 0;

              return (
                <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                  {/* Name & Urdu title */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-stone-900 leading-tight">
                      {item.name}
                    </div>
                    {item.urduName && (
                      <div className="text-xs text-stone-500 font-sans mt-0.5">
                        {item.urduName}
                      </div>
                    )}
                  </td>

                  {/* Price per Kg (Editable) */}
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <span className="text-xs text-stone-400 font-mono">Rs.</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={item.pricePerKg}
                        onChange={(e) =>
                          onUpdateIngredient(item.id, {
                            pricePerKg: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-24 text-right px-2 py-1 bg-stone-50 border border-stone-200 rounded font-mono text-sm font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </td>

                  {/* Weight in Grams (Editable) */}
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={item.weightGrams}
                        onChange={(e) =>
                          onUpdateIngredient(item.id, {
                            weightGrams: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-20 text-right px-2 py-1 bg-white border border-stone-300 rounded font-mono text-sm font-bold text-stone-900 focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="text-xs text-stone-500 font-medium">g</span>
                    </div>
                  </td>

                  {/* Wastage / Sorting Loss % (Editable) */}
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <input
                        type="number"
                        min="0"
                        max="25"
                        step="0.5"
                        value={item.wastagePercent}
                        onChange={(e) =>
                          onUpdateIngredient(item.id, {
                            wastagePercent: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-14 text-right px-1.5 py-1 bg-stone-50 border border-stone-200 rounded font-mono text-xs text-stone-700 focus:bg-white focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="text-xs text-stone-400">%</span>
                    </div>
                  </td>

                  {/* Blend Weight Share */}
                  <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-stone-700">
                    <div className="font-semibold">{formatPercent(weightShare, 1)}</div>
                    <div className="w-16 h-1 bg-stone-200 rounded-full ml-auto mt-1 overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full"
                        style={{ width: `${Math.min(weightShare, 100)}%` }}
                      />
                    </div>
                  </td>

                  {/* Item Cost in PKR */}
                  <td className="py-3 px-3 text-right font-mono font-bold text-sm text-stone-900 tabular-nums">
                    {formatPKR(cost, 1)}
                  </td>

                  {/* Cost Share % */}
                  <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-stone-600">
                    {formatPercent(costShare, 1)}
                  </td>

                  {/* Delete Button */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onRemoveIngredient(item.id)}
                      className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove ingredient"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer Totals */}
          <tfoot className="bg-stone-100 font-semibold text-stone-900 border-t-2 border-stone-300">
            <tr>
              <td className="py-3.5 px-4 text-sm">
                Total Blend Net Weight &amp; Raw Cost
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-xs text-stone-600">
                Avg: {formatPKR(avgRawCostPerKg)}/kg
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-base text-stone-900 font-bold tabular-nums">
                {Math.round(totalNetGrams)}g
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-xs text-stone-500">
                {formatWeight(totalGrossGrams - totalNetGrams)} loss
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-xs">
                100.0%
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-base font-bold text-emerald-800 tabular-nums">
                {formatPKR(totalCost, 1)}
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-xs">
                100.0%
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add Ingredient Section */}
      <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleAddSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedAddId}
            onChange={(e) => setSelectedAddId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium max-w-xs"
          >
            <option value="">Select dry fruit to add...</option>
            {rawMaterials.map((rm) => (
              <option key={rm.id} value={rm.id}>
                {rm.name} — {formatPKR(rm.defaultPricePerKg)}/kg
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!selectedAddId}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add to Mix
          </button>
        </form>

        <div className="text-xs text-stone-600 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Target Net Pack Weight: <strong>{packSizeGrams}g</strong>. Current Blend Total:{' '}
            <strong className={totalNetGrams === packSizeGrams ? 'text-emerald-700' : 'text-amber-800'}>
              {Math.round(totalNetGrams)}g
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
