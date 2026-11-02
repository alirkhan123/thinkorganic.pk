import { MixRecipe, CostSummary, ChannelPricingConfig } from '../types/dryfruit';

export function calculateCostSummary(recipe: MixRecipe): CostSummary {
  const netWeightGrams = recipe.ingredients.reduce((acc, item) => acc + (Number(item.weightGrams) || 0), 0);

  let totalRawIngredientCost = 0;
  let totalGrossWeightGrams = 0;

  for (const item of recipe.ingredients) {
    const weight = Number(item.weightGrams) || 0;
    const wastage = Number(item.wastagePercent) || 0;
    const pricePerKg = Number(item.pricePerKg) || 0;

    const grossWeight = weight * (1 + wastage / 100);
    const itemCost = (grossWeight / 1000) * pricePerKg;

    totalGrossWeightGrams += grossWeight;
    totalRawIngredientCost += itemCost;
  }

  const rawCostPerKg = netWeightGrams > 0 ? (totalRawIngredientCost / netWeightGrams) * 1000 : 0;

  const totalPackagingCost = recipe.packaging
    .filter((item) => item.enabled)
    .reduce((acc, item) => acc + (Number(item.costPerUnit) || 0), 0);

  const totalCostPerUnit = totalRawIngredientCost + totalPackagingCost;

  const costPerGram = netWeightGrams > 0 ? totalCostPerUnit / netWeightGrams : 0;
  const costPer100g = costPerGram * 100;
  const costPerKgPack = costPerGram * 1000;

  let sellingPrice = 0;
  let profitPerUnit = 0;
  let grossMarginPercent = 0;
  let markupPercent = 0;

  if (recipe.marginMode === 'margin') {
    const margin = Math.min(Math.max(Number(recipe.targetMarginPercent) || 0, 0), 99.9);
    sellingPrice = margin < 100 ? totalCostPerUnit / (1 - margin / 100) : totalCostPerUnit;
    profitPerUnit = sellingPrice - totalCostPerUnit;
    grossMarginPercent = margin;
    markupPercent = totalCostPerUnit > 0 ? (profitPerUnit / totalCostPerUnit) * 100 : 0;
  } else if (recipe.marginMode === 'markup') {
    const markup = Math.max(Number(recipe.targetMarkupPercent) || 0, 0);
    sellingPrice = totalCostPerUnit * (1 + markup / 100);
    profitPerUnit = sellingPrice - totalCostPerUnit;
    grossMarginPercent = sellingPrice > 0 ? (profitPerUnit / sellingPrice) * 100 : 0;
    markupPercent = markup;
  } else {
    // Custom target price
    sellingPrice = Math.max(Number(recipe.customSellingPrice) || 0, 0);
    profitPerUnit = sellingPrice - totalCostPerUnit;
    grossMarginPercent = sellingPrice > 0 ? (profitPerUnit / sellingPrice) * 100 : 0;
    markupPercent = totalCostPerUnit > 0 ? (profitPerUnit / totalCostPerUnit) * 100 : 0;
  }

  const batchPacks = Math.max(Number(recipe.batchQuantityPacks) || 1, 1);
  const totalBatchWeightKg = (netWeightGrams * batchPacks) / 1000;
  const totalBatchRawCost = totalRawIngredientCost * batchPacks;
  const totalBatchPackagingCost = totalPackagingCost * batchPacks;
  const totalBatchCost = totalCostPerUnit * batchPacks;
  const totalBatchRevenue = sellingPrice * batchPacks;
  const totalBatchProfit = profitPerUnit * batchPacks;

  return {
    netWeightGrams,
    totalGrossWeightGrams,
    totalRawIngredientCost,
    rawCostPerKg,
    totalPackagingCost,
    totalCostPerUnit,
    costPerGram,
    costPer100g,
    costPerKgPack,
    sellingPrice,
    profitPerUnit,
    grossMarginPercent,
    markupPercent,
    batchPacks,
    totalBatchWeightKg,
    totalBatchRawCost,
    totalBatchPackagingCost,
    totalBatchCost,
    totalBatchRevenue,
    totalBatchProfit,
  };
}

export function formatPKR(val: number, decimals: number = 0): string {
  if (isNaN(val) || !isFinite(val)) return 'Rs. 0';
  const rounded = Number(val.toFixed(decimals));
  return `Rs. ${rounded.toLocaleString('en-PK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatPercent(val: number, decimals: number = 1): string {
  if (isNaN(val) || !isFinite(val)) return '0.0%';
  return `${val.toFixed(decimals)}%`;
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${Number(kg.toFixed(2))} kg`;
  }
  return `${Math.round(grams)} g`;
}

export function scaleRecipeToNewWeight(recipe: MixRecipe, targetTotalGrams: number): MixRecipe {
  const currentTotal = recipe.ingredients.reduce((acc, i) => acc + (Number(i.weightGrams) || 0), 0);
  if (currentTotal <= 0) return recipe;

  const ratio = targetTotalGrams / currentTotal;
  const scaledIngredients = recipe.ingredients.map((item) => ({
    ...item,
    weightGrams: Math.round(item.weightGrams * ratio * 10) / 10,
  }));

  return {
    ...recipe,
    packSizeGrams: targetTotalGrams,
    ingredients: scaledIngredients,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

export interface CalculatedChannelPrice {
  channel: ChannelPricingConfig;
  baseCost: number;
  totalCostWithLogistics: number;
  wholesaleSellingPrice: number;
  consumerShelfPrice: number;
  profitPerPack: number;
  marginPercent: number;
  markupPercent: number;
}

export function calculateChannelPrices(
  costSummary: CostSummary,
  channels: ChannelPricingConfig[]
): CalculatedChannelPrice[] {
  const baseCost = costSummary.totalCostPerUnit;

  return channels.map((ch) => {
    const logistics = ch.additionalCostPerUnit || 0;
    const effectiveCost = baseCost + logistics;
    const targetMargin = ch.targetMarginPercent;

    // Direct brand price needed for this margin
    const brandPrice = targetMargin < 100 ? effectiveCost / (1 - targetMargin / 100) : effectiveCost;

    let consumerShelfPrice = brandPrice;
    if (ch.retailerCutPercent && ch.retailerCutPercent > 0) {
      // If retailer takes cut from consumer shelf price:
      // consumerShelfPrice * (1 - retailerCut / 100) = brandPrice
      consumerShelfPrice = brandPrice / (1 - ch.retailerCutPercent / 100);
    }

    const profitPerPack = brandPrice - effectiveCost;
    const actualMargin = brandPrice > 0 ? (profitPerPack / brandPrice) * 100 : 0;
    const actualMarkup = effectiveCost > 0 ? (profitPerPack / effectiveCost) * 100 : 0;

    return {
      channel: ch,
      baseCost,
      totalCostWithLogistics: effectiveCost,
      wholesaleSellingPrice: Math.round(brandPrice),
      consumerShelfPrice: Math.round(consumerShelfPrice),
      profitPerPack: Math.round(profitPerPack),
      marginPercent: actualMargin,
      markupPercent: actualMarkup,
    };
  });
}
