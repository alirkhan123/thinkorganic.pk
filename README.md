# Karakoram Dry Fruits — Internal Cost & Margin Engine (PKR)

Internal formulation costing, weight calculation, profit margin analysis, and wholesale channel pricing tool for dry fruit brands in Pakistan.

## Features

- **Formulation & Weight Costing**: Calculate total raw cost based on weight in grams ($g$) and purchase price in **PKR / kg**.
- **Wastage & Sorting Loss**: Configurable cleaning and shell sorting loss percentage per nut.
- **Packaging, Sealing & Direct Labor**: Itemized line items for stand-up pouches, jars, waterproof labels, silica absorbers, and labor charges.
- **Margin Engine**:
  - Target Profit Margin % (on Selling Price)
  - Target Markup % (on Total Cost)
  - Custom Selling Price (PKR) with real-time margin deduction
- **Commercial Batch Production**: Model production runs (e.g., 200 packs / 50 kg run) to calculate total capital outlay, revenue, and net profit.
- **Multi-Channel Distribution**: Tailored pricing for D2C Brand Retail, Wholesale Carton Lots, Supermarkets (Imtiaz, Carrefour with 18% cut), and Online Courier orders.
- **Price Volatility Stress Test**: Interactive simulator for dry fruit inflation and margin protection.
- **Printable Cost Accounting Sheet & Quotation**: One-click print/PDF and clipboard formatted quotation.

---

## Deploying to Vercel

This application is ready for zero-configuration deployment to [Vercel](https://vercel.com).

### Method 1: Deploy with Git (Recommended)

1. Push this repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." > "Project"**.
3. Import this repository.
4. Vercel automatically detects the framework using `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **"Deploy"**. Your live app will be published on a `.vercel.app` domain in seconds.

### Method 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Run deployment from root directory
vercel

# For production deployment:
vercel --prod
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```
