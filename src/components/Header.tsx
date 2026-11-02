import React from 'react';
import { Calculator, BookOpen, Printer, Sparkles, Database } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenRawMaterials: () => void;
  onOpenPresets: () => void;
  onOpenCostSheet: () => void;
  recipeTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenRawMaterials,
  onOpenPresets,
  onOpenCostSheet,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Universal Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-xs">
            <Calculator className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap block leading-tight">
              Karakoram DryFruits
            </span>
            <span className="text-xs text-stone-700 block font-medium">
              Internal Cost &amp; Margin Engine (PKR)
            </span>
          </div>
        </div>

        {/* Zone 2: 4-5 concise single-line nav tabs */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'calculator'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Blend Calculator
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'channels'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Wholesale &amp; Channels
          </button>
          <button
            onClick={() => setActiveTab('sensitivity')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'sensitivity'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Price Stress Test
          </button>
          <button
            onClick={onOpenRawMaterials}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm"
          >
            <Database className="w-3.5 h-3.5 text-stone-500" />
            Market Rates (PKR/kg)
          </button>
          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
            Blend Presets
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCostSheet}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4 text-stone-900" />
            <span>Cost Sheet / Quote</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-between overflow-x-auto px-4 py-2 border-t border-stone-200 bg-stone-50 gap-2 text-xs">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'calculator' ? 'bg-stone-900 text-white font-medium' : 'text-stone-600'
          }`}
        >
          Calculator
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'channels' ? 'bg-stone-900 text-white font-medium' : 'text-stone-600'
          }`}
        >
          Channels
        </button>
        <button
          onClick={() => setActiveTab('sensitivity')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'sensitivity' ? 'bg-stone-900 text-white font-medium' : 'text-stone-600'
          }`}
        >
          Stress Test
        </button>
        <button
          onClick={onOpenRawMaterials}
          className="px-2.5 py-1 text-stone-600 whitespace-nowrap"
        >
          Rates (PKR)
        </button>
        <button
          onClick={onOpenPresets}
          className="px-2.5 py-1 text-stone-600 whitespace-nowrap"
        >
          Presets
        </button>
      </div>
    </header>
  );
};
