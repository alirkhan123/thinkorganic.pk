export interface RawMaterial {
  id: string;
  name: string;
  urduName?: string;
  category: 'nut' | 'dried_fruit' | 'seed' | 'premium';
  defaultPricePerKg: number; // PKR
  origin?: string;
  grade?: string;
  notes?: string;
}

export interface RecipeIngredient {
  id: string; // unique item id in recipe
  rawMaterialId: string;
  name: string;
  urduName?: string;
  pricePerKg: number; // PKR per kg
  weightGrams: number; // Grams in this mix
  wastagePercent: number; // e.g. 2% for sorting/cleaning loss
}

export interface PackagingItem {
  id: string;
  name: string;
  costPerUnit: number; // PKR
  category: 'container' | 'label' | 'preservative' | 'labor' | 'shipper' | 'other';
  enabled: boolean;
}

export type MarginMode = 'margin' | 'markup' | 'target_price';

export interface ChannelPricingConfig {
  id: string;
  name: string;
  targetMarginPercent: number;
  additionalCostPerUnit: number; // e.g., delivery or distributor cut
  retailerCutPercent?: number; // e.g., 15% for supermarkets
  notes: string;
}

export interface MixRecipe {
  id: string;
  title: string;
  description: string;
  packSizeGrams: number; // e.g. 250g
  batchQuantityPacks: number; // e.g. 200 packs
  ingredients: RecipeIngredient[];
  packaging: PackagingItem[];
  marginMode: MarginMode;
  targetMarginPercent: number; // e.g. 35%
  targetMarkupPercent: number; // e.g. 54%
  customSellingPrice: number; // PKR
  notes?: string;
  lastUpdated: string;
}

export interface CostSummary {
  netWeightGrams: number;
  totalGrossWeightGrams: number; // including wastage
  totalRawIngredientCost: number; // PKR
  rawCostPerKg: number; // PKR
  totalPackagingCost: number; // PKR
  totalCostPerUnit: number; // PKR (raw + packaging + labor)
  costPerGram: number; // PKR
  costPer100g: number; // PKR
  costPerKgPack: number; // PKR
  
  // Selling & Margin
  sellingPrice: number; // PKR
  profitPerUnit: number; // PKR
  grossMarginPercent: number; // %
  markupPercent: number; // %

  // Batch Metrics
  batchPacks: number;
  totalBatchWeightKg: number;
  totalBatchRawCost: number;
  totalBatchPackagingCost: number;
  totalBatchCost: number;
  totalBatchRevenue: number;
  totalBatchProfit: number;
}
