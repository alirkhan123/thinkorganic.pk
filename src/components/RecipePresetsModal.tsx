import React, { useState } from 'react';
import { MixRecipe } from '../types/dryfruit';
import { formatPKR, formatWeight } from '../utils/calculations';
import { X, BookOpen, Check, BookmarkPlus, Download, Upload, Trash2 } from 'lucide-react';

interface RecipePresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: MixRecipe[];
  currentRecipeId: string;
  onSelectRecipe: (recipe: MixRecipe) => void;
  onSaveCurrentAsPreset: (title: string, description: string) => void;
  onDeleteCustomRecipe: (id: string) => void;
  currentRecipe: MixRecipe;
}

export const RecipePresetsModal: React.FC<RecipePresetsModalProps> = ({
  isOpen,
  onClose,
  recipes,
  currentRecipeId,
  onSelectRecipe,
  onSaveCurrentAsPreset,
  onDeleteCustomRecipe,
  currentRecipe,
}) => {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveDesc, setSaveDesc] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;
    onSaveCurrentAsPreset(saveTitle.trim(), saveDesc.trim());
    setSaveTitle('');
    setSaveDesc('');
    setShowSaveForm(false);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(recipes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `karakoram_dryfruit_recipes_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-900 text-amber-400 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Dry Fruit Mix Formulation Presets
              </h3>
              <p className="text-xs text-stone-500">
                Curated Pakistani dry fruit blend formulations and custom company recipes.
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

        {/* Action bar */}
        <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-stone-700">
            {recipes.length} Mix Presets in Library
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-900 rounded-lg text-xs font-semibold transition-colors"
            >
              <BookmarkPlus className="w-4 h-4 text-stone-900" />
              Save Current Mix as Preset
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors"
              title="Export all recipes to backup JSON file"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Save Dialog */}
        {showSaveForm && (
          <form onSubmit={handleSave} className="p-4 bg-amber-50/70 border-b border-amber-200 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Save Formulation to Company Catalog
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Recipe Name (e.g. Royal Eid Gift Mix 500g)"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Description / Intended Market Channel"
                value={saveDesc}
                onChange={(e) => setSaveDesc(e.target.value)}
                className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveForm(false)}
                className="px-3 py-1 text-xs text-stone-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-stone-900 text-white font-semibold rounded text-xs hover:bg-stone-800"
              >
                Confirm &amp; Save
              </button>
            </div>
          </form>
        )}

        {/* Recipes Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {recipes.map((rec) => {
            const isCurrent = rec.id === currentRecipeId;
            const netWeight = rec.ingredients.reduce((acc, i) => acc + (Number(i.weightGrams) || 0), 0);
            const isDefault = rec.id.startsWith('recipe_');

            return (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-50/30 ring-1 ring-amber-400'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900">{rec.title}</h4>
                      {isCurrent && (
                        <span className="text-[10px] bg-amber-400 text-stone-900 font-bold px-2 py-0.5 rounded">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{rec.description}</p>

                    {/* Ingredient tags */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className="text-[11px] font-mono font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                        {rec.packSizeGrams}g pack
                      </span>
                      <span className="text-[11px] text-stone-400">·</span>
                      <span className="text-[11px] text-stone-600">
                        {rec.ingredients.length} items: {rec.ingredients.map((i) => i.name.split('(')[0].trim()).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isCurrent && (
                      <button
                        onClick={() => {
                          onSelectRecipe(rec);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Load Recipe
                      </button>
                    )}
                    {!isDefault && (
                      <button
                        onClick={() => onDeleteCustomRecipe(rec.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded"
                        title="Delete custom preset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
