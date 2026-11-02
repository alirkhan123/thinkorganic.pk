/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  RawMaterial,
  MixRecipe,
  RecipeIngredient,
  PackagingItem,
  ChannelPricingConfig,
} from './types/dryfruit';
import {
  DEFAULT_RAW_MATERIALS,
  DEFAULT_PACKAGING_ITEMS,
  DEFAULT_CHANNELS,
  PRESET_RECIPES,
} from './data/defaultData';
import {
  calculateCostSummary,
  scaleRecipeToNewWeight,
  formatPKR,
  formatPercent,
  formatWeight,
} from './utils/calculations';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { IngredientsTable } from './components/IngredientsTable';
import { PackagingCosts } from './components/PackagingCosts';
import { MarginPricingEngine } from './components/MarginPricingEngine';
import { ChannelPricingMatrix } from './components/ChannelPricingMatrix';
import { PriceSensitivitySimulator } from './components/PriceSensitivitySimulator';
import { RawMaterialManagerModal } from './components/RawMaterialManagerModal';
import { RecipePresetsModal } from './components/RecipePresetsModal';
import { PrintableCostSheetModal } from './components/PrintableCostSheetModal';
import {
  Edit3,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  Tag,
  Scale,
  DollarSign,
} from 'lucide-react';

export default function App() {
  // Persistence in localStorage
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    try {
      const saved = localStorage.getItem('karakoram_raw_materials');
      return saved ? JSON.parse(saved) : DEFAULT_RAW_MATERIALS;
    } catch {
      return DEFAULT_RAW_MATERIALS;
    }
  });

  const [recipes, setRecipes] = useState<MixRecipe[]>(() => {
    try {
      const saved = localStorage.getItem('karakoram_recipes');
      return saved ? JSON.parse(saved) : PRESET_RECIPES;
    } catch {
      return PRESET_RECIPES;
    }
  });

  const [currentRecipe, setCurrentRecipe] = useState<MixRecipe>(() => {
    return recipes[0] || PRESET_RECIPES[0];
  });

  const [channels, setChannels] = useState<ChannelPricingConfig[]>(() => {
    try {
      const saved = localStorage.getItem('karakoram_channels');
      return saved ? JSON.parse(saved) : DEFAULT_CHANNELS;
    } catch {
      return DEFAULT_CHANNELS;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [isRawMaterialsOpen, setIsRawMaterialsOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isCostSheetOpen, setIsCostSheetOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('karakoram_raw_materials', JSON.stringify(rawMaterials));
    } catch (e) {
      console.error(e);
    }
  }, [rawMaterials]);

  useEffect(() => {
    try {
      localStorage.setItem('karakoram_recipes', JSON.stringify(recipes));
    } catch (e) {
      console.error(e);
    }
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem('karakoram_channels', JSON.stringify(channels));
    } catch (e) {
      console.error(e);
    }
  }, [channels]);

  // Derived Cost Summary
  const costSummary = calculateCostSummary(currentRecipe);

  // Handlers for current recipe
  const updateCurrentRecipe = (updates: Partial<MixRecipe>) => {
    setCurrentRecipe((prev) => {
      const updated = {
        ...prev,
        ...updates,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      // also update in recipes list
      setRecipes((rList) =>
        rList.map((r) => (r.id === updated.id ? updated : r))
      );
      return updated;
    });
  };

  const updateIngredient = (id: string, updates: Partial<RecipeIngredient>) => {
    const updatedIngredients = currentRecipe.ingredients.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateCurrentRecipe({ ingredients: updatedIngredients });
  };

  const removeIngredient = (id: string) => {
    if (currentRecipe.ingredients.length <= 1) {
      alert('Mix must contain at least one dry fruit ingredient.');
      return;
    }
    const filtered = currentRecipe.ingredients.filter((item) => item.id !== id);
    updateCurrentRecipe({ ingredients: filtered });
  };

  const addIngredient = (rawMaterialId: string) => {
    const raw = rawMaterials.find((m) => m.id === rawMaterialId);
    if (!raw) return;

    // Check if already in recipe
    const existing = currentRecipe.ingredients.find((i) => i.rawMaterialId === rawMaterialId);
    if (existing) {
      // increase weight by 25g
      updateIngredient(existing.id, { weightGrams: existing.weightGrams + 25 });
      return;
    }

    const newItem: RecipeIngredient = {
      id: `ing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      rawMaterialId: raw.id,
      name: raw.name,
      urduName: raw.urduName,
      pricePerKg: raw.defaultPricePerKg,
      weightGrams: 30, // default weight
      wastagePercent: 1.5,
    };

    updateCurrentRecipe({
      ingredients: [...currentRecipe.ingredients, newItem],
    });
  };

  const handleScalePackSize = (newGrams: number) => {
    const scaled = scaleRecipeToNewWeight(currentRecipe, newGrams);
    setCurrentRecipe(scaled);
    setRecipes((rList) =>
      rList.map((r) => (r.id === scaled.id ? scaled : r))
    );
  };

  // Packaging handlers
  const updatePackagingItem = (id: string, updates: Partial<PackagingItem>) => {
    const updated = currentRecipe.packaging.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateCurrentRecipe({ packaging: updated });
  };

  const addPackagingItem = (itemData: Omit<PackagingItem, 'id'>) => {
    const newItem: PackagingItem = {
      ...itemData,
      id: `pkg_${Date.now()}`,
    };
    updateCurrentRecipe({
      packaging: [...currentRecipe.packaging, newItem],
    });
  };

  const deletePackagingItem = (id: string) => {
    const filtered = currentRecipe.packaging.filter((i) => i.id !== id);
    updateCurrentRecipe({ packaging: filtered });
  };

  // Raw Materials Master list handlers
  const updateMaterialPrice = (id: string, newPrice: number) => {
    setRawMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, defaultPricePerKg: newPrice } : m))
    );
  };

  const addRawMaterial = (matData: Omit<RawMaterial, 'id'>) => {
    const newMat: RawMaterial = {
      ...matData,
      id: `mat_custom_${Date.now()}`,
    };
    setRawMaterials((prev) => [newMat, ...prev]);
  };

  const syncAllRatesToRecipe = () => {
    const updatedIngredients = currentRecipe.ingredients.map((ing) => {
      const match = rawMaterials.find((rm) => rm.id === ing.rawMaterialId);
      if (match) {
        return { ...ing, pricePerKg: match.defaultPricePerKg };
      }
      return ing;
    });
    updateCurrentRecipe({ ingredients: updatedIngredients });
    alert('Master market rates synced to the current recipe ingredients!');
  };

  // Preset handlers
  const handleSelectRecipe = (selected: MixRecipe) => {
    setCurrentRecipe(selected);
  };

  const handleSaveCurrentAsPreset = (title: string, description: string) => {
    const newRecipe: MixRecipe = {
      ...currentRecipe,
      id: `custom_recipe_${Date.now()}`,
      title,
      description,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setRecipes((prev) => [newRecipe, ...prev]);
    setCurrentRecipe(newRecipe);
    alert(`"${title}" saved to your recipe library!`);
  };

  const handleDeleteCustomRecipe = (id: string) => {
    if (id === currentRecipe.id) {
      alert('Cannot delete the currently active recipe.');
      return;
    }
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  // Channel update handler
  const updateChannel = (id: string, updates: Partial<ChannelPricingConfig>) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, ...updates } : ch))
    );
  };

  const resetToFactoryDefaults = () => {
    if (confirm('Reset all recipes, packaging costs and raw materials to standard Pakistani market rates?')) {
      localStorage.removeItem('karakoram_raw_materials');
      localStorage.removeItem('karakoram_recipes');
      localStorage.removeItem('karakoram_channels');
      setRawMaterials(DEFAULT_RAW_MATERIALS);
      setRecipes(PRESET_RECIPES);
      setCurrentRecipe(PRESET_RECIPES[0]);
      setChannels(DEFAULT_CHANNELS);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900 font-sans selection:bg-amber-400 selection:text-stone-900">
      {/* Top Bar Contract (3 zones) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRawMaterials={() => setIsRawMaterialsOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenCostSheet={() => setIsCostSheetOpen(true)}
        recipeTitle={currentRecipe.title}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Brand Hero & Active Formulation Showcase Banner */}
        <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Visual Photography Asset */}
            <div className="lg:col-span-4 relative min-h-[180px] lg:min-h-full bg-stone-900 overflow-hidden">
              <img
                src="/src/assets/images/dryfruits_blend_banner_1793630773345.jpg"
                alt="Assorted premium Pakistani dry fruits and nuts flat lay"
                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-semibold tracking-wider uppercase">
                  Batch Lot #{currentRecipe.id.slice(-6)} · Grade A Nuts
                </span>
              </div>
            </div>

            {/* Formulation Title & Metadata */}
            <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Current Blend Formulation
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="text-xs text-amber-700 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      PKR Rs.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPresetsOpen(true)}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium underline flex items-center gap-1"
                    >
                      Switch Preset
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={resetToFactoryDefaults}
                      className="text-xs text-stone-400 hover:text-stone-600 p-1"
                      title="Reset defaults"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Editable Title */}
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={currentRecipe.title}
                      onChange={(e) => updateCurrentRecipe({ title: e.target.value })}
                      onBlur={() => setIsEditingTitle(false)}
                      autoFocus
                      className="text-xl sm:text-2xl font-extrabold text-stone-900 bg-amber-50 border border-amber-300 rounded px-2 py-0.5 w-full focus:outline-none"
                    />
                    <button
                      onClick={() => setIsEditingTitle(false)}
                      className="px-3 py-1 bg-stone-900 text-white rounded text-xs font-semibold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group mt-1">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                      {currentRecipe.title}
                    </h1>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                      title="Rename recipe"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-2xl leading-relaxed">
                  {currentRecipe.description}
                </p>
              </div>

              {/* Fast stats ribbon */}
              <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-stone-700">
                  <Scale className="w-4 h-4 text-stone-400" />
                  Pack Size: <strong className="text-stone-900 font-bold">{currentRecipe.packSizeGrams}g</strong>
                </span>
                <span className="text-stone-300">|</span>
                <span className="text-stone-700">
                  Total Items: <strong className="text-stone-900">{currentRecipe.ingredients.length} Dry Fruits</strong>
                </span>
                <span className="text-stone-300">|</span>
                <span className="text-stone-700">
                  Batch Run: <strong className="text-stone-900">{currentRecipe.batchQuantityPacks} Packs ({costSummary.totalBatchWeightKg.toFixed(1)} kg)</strong>
                </span>
                <span className="text-stone-300">|</span>
                <span className="text-emerald-700 font-bold">
                  Target Margin: {formatPercent(costSummary.grossMarginPercent)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* High-Level Financial Metric Strip (Tabular Figures) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total Cost / Unit"
            value={formatPKR(costSummary.totalCostPerUnit, 1)}
            subValue={`Raw: ${formatPKR(costSummary.totalRawIngredientCost, 0)} · Pkg: ${formatPKR(costSummary.totalPackagingCost, 0)}`}
            badge="Net Cost"
            badgeType="neutral"
          />
          <MetricCard
            label="Selling Price (SRP)"
            value={formatPKR(costSummary.sellingPrice, 0)}
            subValue={`Per ${currentRecipe.packSizeGrams}g retail pouch`}
            badge="Retail SRP"
            badgeType="accent"
          />
          <MetricCard
            label="Net Profit / Pack"
            value={`+${formatPKR(costSummary.profitPerUnit, 1)}`}
            subValue={`${formatPercent(costSummary.grossMarginPercent)} Margin · ${formatPercent(costSummary.markupPercent)} Markup`}
            badge="Brand Profit"
            badgeType="success"
          />
          <MetricCard
            label="Batch Net Profit"
            value={`+${formatPKR(costSummary.totalBatchProfit, 0)}`}
            subValue={`Revenue: ${formatPKR(costSummary.totalBatchRevenue, 0)} · Outlay: ${formatPKR(costSummary.totalBatchCost, 0)}`}
            badge={`${currentRecipe.batchQuantityPacks} Packs`}
            badgeType="success"
          />
        </section>

        {/* Tab View Switching */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            {/* 1. Dry Fruit Ingredients Table */}
            <IngredientsTable
              ingredients={currentRecipe.ingredients}
              rawMaterials={rawMaterials}
              packSizeGrams={currentRecipe.packSizeGrams}
              onUpdateIngredient={updateIngredient}
              onRemoveIngredient={removeIngredient}
              onAddIngredient={addIngredient}
              onScalePackSize={handleScalePackSize}
            />

            {/* 2. Packaging & Direct Labor Overhead Costs */}
            <PackagingCosts
              packaging={currentRecipe.packaging}
              onUpdateItem={updatePackagingItem}
              onAddItem={addPackagingItem}
              onDeleteItem={deletePackagingItem}
            />

            {/* 3. Margin & Pricing Controller */}
            <MarginPricingEngine
              recipe={currentRecipe}
              costSummary={costSummary}
              onUpdateRecipe={updateCurrentRecipe}
            />
          </div>
        )}

        {activeTab === 'channels' && (
          <ChannelPricingMatrix
            channels={channels}
            costSummary={costSummary}
            onUpdateChannel={updateChannel}
          />
        )}

        {activeTab === 'sensitivity' && (
          <PriceSensitivitySimulator
            recipe={currentRecipe}
            costSummary={costSummary}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-stone-200 bg-white py-6 text-xs text-stone-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Karakoram Dry Fruits Internal Costing Engine · All values in Pakistani Rupees (PKR Rs.)
          </div>
          <div className="flex items-center gap-4 text-stone-600">
            <button onClick={() => setIsRawMaterialsOpen(true)} className="hover:text-stone-900 underline">
              Market Rate Catalog
            </button>
            <button onClick={() => setIsPresetsOpen(true)} className="hover:text-stone-900 underline">
              Formulation Library
            </button>
            <button onClick={() => setIsCostSheetOpen(true)} className="hover:text-stone-900 underline font-semibold">
              Print Commercial Quote
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RawMaterialManagerModal
        isOpen={isRawMaterialsOpen}
        onClose={() => setIsRawMaterialsOpen(false)}
        rawMaterials={rawMaterials}
        onUpdateMaterialPrice={updateMaterialPrice}
        onAddMaterial={addRawMaterial}
        onSyncAllRatesToRecipe={syncAllRatesToRecipe}
      />

      <RecipePresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        recipes={recipes}
        currentRecipeId={currentRecipe.id}
        onSelectRecipe={handleSelectRecipe}
        onSaveCurrentAsPreset={handleSaveCurrentAsPreset}
        onDeleteCustomRecipe={handleDeleteCustomRecipe}
        currentRecipe={currentRecipe}
      />

      <PrintableCostSheetModal
        isOpen={isCostSheetOpen}
        onClose={() => setIsCostSheetOpen(false)}
        recipe={currentRecipe}
        costSummary={costSummary}
        channels={channels}
      />
    </div>
  );
}
