import React, { useState } from 'react';
import { PackagingItem } from '../types/dryfruit';
import { formatPKR } from '../utils/calculations';
import { Box, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface PackagingCostsProps {
  packaging: PackagingItem[];
  onUpdateItem: (id: string, updates: Partial<PackagingItem>) => void;
  onAddItem: (item: Omit<PackagingItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
}

export const PackagingCosts: React.FC<PackagingCostsProps> = ({
  packaging,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('10');
  const [newItemCategory, setNewItemCategory] = useState<PackagingItem['category']>('container');

  const totalPackagingCost = packaging
    .filter((item) => item.enabled)
    .reduce((sum, item) => sum + (Number(item.costPerUnit) || 0), 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem({
      name: newItemName.trim(),
      costPerUnit: Math.max(0, parseFloat(newItemCost) || 0),
      category: newItemCategory,
      enabled: true,
    });
    setNewItemName('');
    setNewItemCost('10');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              2. Packaging, Sealing &amp; Direct Labor Costs
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              (Per Retail Unit)
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Pouch/container, waterproof labels, oxygen/silica sachets, and labor charges in PKR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-xs text-stone-500 block">Total Packaging/Pack</span>
            <span className="text-base font-bold font-mono text-stone-900 tabular-nums">
              {formatPKR(totalPackagingCost, 1)}
            </span>
          </div>
        </div>
      </div>

      {/* Item List */}
      <div className="divide-y divide-stone-100">
        {packaging.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 sm:px-5 flex items-center justify-between gap-4 transition-colors ${
              item.enabled ? 'bg-white hover:bg-stone-50/50' : 'bg-stone-50/60 opacity-60'
            }`}
          >
            {/* Checkbox toggle & item name */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onUpdateItem(item.id, { enabled: !item.enabled })}
                className="text-stone-700 hover:text-stone-900 transition-colors shrink-0"
              >
                {item.enabled ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                ) : (
                  <Circle className="w-5 h-5 text-stone-400" />
                )}
              </button>

              <div className="min-w-0">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                  className="w-full text-sm font-medium text-stone-900 bg-transparent hover:bg-stone-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 px-1.5 py-0.5 rounded truncate"
                />
                <span className="text-xs text-stone-600 capitalize block px-1.5">
                  Category: {item.category}
                </span>
              </div>
            </div>

            {/* Cost input in PKR */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-xs text-stone-500 font-mono">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={item.costPerUnit}
                  onChange={(e) =>
                    onUpdateItem(item.id, {
                      costPerUnit: Math.max(0, parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-20 text-right px-2 py-1 bg-white border border-stone-300 rounded font-mono text-sm font-semibold text-stone-900 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => onDeleteItem(item.id)}
                className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                title="Remove packaging item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Item */}
      <div className="p-4 border-t border-stone-200 bg-stone-50">
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:underline"
          >
            <Plus className="w-4 h-4 text-stone-500" />
            + Add Custom Packaging or Labor Line Item
          </button>
        ) : (
          <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Gift Ribbon / Vacuum Sealing / Nitrogen Flush"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-1 focus:ring-amber-500"
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
            >
              <option value="container">Container/Pouch</option>
              <option value="label">Label/Sticker</option>
              <option value="preservative">Preservative/Silica</option>
              <option value="labor">Labor</option>
              <option value="shipper">Shipper/Box</option>
              <option value="other">Other</option>
            </select>
            <div className="flex items-center gap-1">
              <span className="text-xs text-stone-400">Rs.</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={newItemCost}
                onChange={(e) => setNewItemCost(e.target.value)}
                className="w-16 px-2 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-right font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1.5 text-stone-500 hover:text-stone-800 text-xs"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
