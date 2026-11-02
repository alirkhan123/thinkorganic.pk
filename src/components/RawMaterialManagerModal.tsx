import React, { useState } from 'react';
import { RawMaterial } from '../types/dryfruit';
import { formatPKR } from '../utils/calculations';
import { X, Plus, Search, Check, RefreshCw, Database } from 'lucide-react';

interface RawMaterialManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawMaterials: RawMaterial[];
  onUpdateMaterialPrice: (id: string, newPrice: number) => void;
  onAddMaterial: (material: Omit<RawMaterial, 'id'>) => void;
  onSyncAllRatesToRecipe: () => void;
}

export const RawMaterialManagerModal: React.FC<RawMaterialManagerModalProps> = ({
  isOpen,
  onClose,
  rawMaterials,
  onUpdateMaterialPrice,
  onAddMaterial,
  onSyncAllRatesToRecipe,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New material form
  const [name, setName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [category, setCategory] = useState<RawMaterial['category']>('nut');
  const [pricePerKg, setPricePerKg] = useState('2500');
  const [origin, setOrigin] = useState('Pakistan / Imported');
  const [grade, setGrade] = useState('Grade A');

  if (!isOpen) return null;

  const filteredMaterials = rawMaterials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.urduName && m.urduName.includes(search)) ||
      (m.origin && m.origin.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMaterial({
      name: name.trim(),
      urduName: urduName.trim() || undefined,
      category,
      defaultPricePerKg: Math.max(0, parseFloat(pricePerKg) || 0),
      origin: origin.trim() || undefined,
      grade: grade.trim() || undefined,
    });

    setName('');
    setUrduName('');
    setPricePerKg('2500');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-900 text-amber-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Raw Material Master Price Book (PKR / kg)
              </h3>
              <p className="text-xs text-stone-500">
                Official market rates for nuts, dry fruits, and seeds across Pakistan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Filter & Sync */}
        <div className="p-4 border-b border-stone-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search nuts, raisins, origin..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
            >
              <option value="all">All Categories</option>
              <option value="nut">Nuts</option>
              <option value="dried_fruit">Dried Fruits</option>
              <option value="seed">Seeds</option>
              <option value="premium">Premium (Chilgoza)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onSyncAllRatesToRecipe}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors"
              title="Apply these master rates to currently loaded recipe ingredients"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
              Apply Rates to Current Mix
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Material
            </button>
          </div>
        </div>

        {/* Add New Material Inline Panel */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="p-4 bg-amber-50/60 border-b border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Name (English)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Macadamia Nuts"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1 bg-white border border-stone-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Urdu Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. مکاڈیمیا نٹ"
                value={urduName}
                onChange={(e) => setUrduName(e.target.value)}
                className="w-full px-2.5 py-1 bg-white border border-stone-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Rate (PKR / kg)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-stone-500">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  className="w-full px-2.5 py-1 bg-white border border-stone-300 rounded text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-2.5 py-1 bg-white border border-stone-300 rounded text-xs"
              >
                <option value="nut">Nut</option>
                <option value="dried_fruit">Dried Fruit</option>
                <option value="seed">Seed</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Origin / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Skardu / Quetta / Turkey"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-2.5 py-1 bg-white border border-stone-300 rounded text-xs"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-stone-900 text-white font-semibold rounded text-xs hover:bg-stone-800"
              >
                Save Item
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-stone-600 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Material List Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="p-3 sm:px-4 bg-white hover:bg-stone-50 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900 truncate">
                      {mat.name}
                    </span>
                    {mat.urduName && (
                      <span className="text-xs text-stone-400 hidden sm:inline">
                        · {mat.urduName}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-600 flex items-center gap-2 mt-0.5">
                    <span className="capitalize">{mat.category.replace('_', ' ')}</span>
                    {mat.origin && <span>· Origin: {mat.origin}</span>}
                    {mat.grade && <span>· Grade: {mat.grade}</span>}
                  </div>
                </div>

                {/* Price editable input */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-mono text-stone-400">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={mat.defaultPricePerKg}
                    onChange={(e) =>
                      onUpdateMaterialPrice(mat.id, Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="w-24 text-right px-2 py-1 bg-stone-50 border border-stone-300 rounded font-mono font-bold text-sm text-stone-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-xs font-mono text-stone-500">/kg</span>
                </div>
              </div>
            ))}

            {filteredMaterials.length === 0 && (
              <div className="p-8 text-center text-sm text-stone-500">
                No dry fruits match your search query.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            {filteredMaterials.length} materials registered
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
