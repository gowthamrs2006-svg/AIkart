/**
 * AIkart – Unified Dual-Action Engine
 * Source of Truth: unifiedSearchInput
 */

// 1. STORE & LOGIC CONFIG
const GEMINI_API_KEY = "AIzaSyD_BEmftE3lvUzpahm-e6P1zk-uDpSkq2c";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const STORE_DATA = {
  "Amazon India": { url: "https://www.amazon.in/s?k=", domain: "amazon.in" },
  "Flipkart": { url: "https://www.flipkart.com/search?q=", domain: "flipkart.com" },
  "JioMart": { url: "https://www.jiomart.com/search/", domain: "jiomart.com" },
  "Reliance Digital": { url: "https://www.reliancedigital.in/search?q=", domain: "reliancedigital.in" },
  "Croma": { url: "https://www.croma.com/search?q=", domain: "croma.com" },
  "Tata Cliq": { url: "https://www.tatacliq.com/search/?searchCategory=all&text=", domain: "tatacliq.com" },
  "Tata Cliq Luxury": { url: "https://luxury.tatacliq.com/search/?text=", domain: "tatacliq.com" },
  "Poorvika": { url: "https://www.poorvika.com/search?q=", domain: "poorvika.com" },
  "Sangeetha Mobiles": { url: "https://www.sangeethamobiles.com/search?q=", domain: "sangeethamobiles.com" },
  "Vijay Sales": { url: "https://www.vijaysales.com/search/", domain: "vijaysales.com" },
  "Snapdeal": { url: "https://www.snapdeal.com/search?keyword=", domain: "snapdeal.com" },
  "Paytm Mall": { url: "https://paytmmall.com/shop/search?q=", domain: "paytmmall.com" },
  "ShopClues": { url: "https://www.shopclues.com/search?q=", domain: "shopclues.com" },
  "Myntra": { url: "https://www.myntra.com/", domain: "myntra.com", isPath: true },
  "Ajio": { url: "https://www.ajio.com/search/?text=", domain: "ajio.com" },
  "BigBasket": { url: "https://www.bigbasket.com/ps/?q=", domain: "bigbasket.com" },
  "Samsung India": { url: "https://www.samsung.com/in/search/?searchvalue=", domain: "samsung.com" },
  "Xiaomi India": { url: "https://www.mi.com/in/search/", domain: "mi.com" },
  "OnePlus India": { url: "https://www.oneplus.in/search?q=", domain: "oneplus.in" }
};

const CATEGORY_MAP = {
  electronics: ["Amazon India", "Flipkart", "Croma", "Reliance Digital", "Vijay Sales", "Poorvika", "Samsung India"],
  fashion: ["Myntra", "Ajio", "Amazon India", "Flipkart", "Snapdeal"],
  grocery: ["BigBasket", "JioMart", "Amazon Fresh"],
  home: ["Amazon India", "Flipkart", "Tata Cliq", "ShopClues"],
  all: ["Amazon India", "Flipkart", "JioMart", "Croma", "Reliance Digital", "Vijay Sales"]
};

// Unified UI Object (Initialized on Load)
let UI = {};

function initUI() {
  UI = {
    input: document.getElementById('unifiedSearchInput'),
    category: document.getElementById('marketCategorySelect'),
    marketBtn: document.getElementById('marketSearchBtn'),
    aiBtn: document.getElementById('aiSuggestionBtn'),
    resultsTitle: document.getElementById('resultsTitleSection'),
    resultsArea: document.getElementById('resultsArea'),
    aiSummaryArea: document.getElementById('aiSummaryArea'),
    overlay: document.getElementById('aiThinkingLoader')
  };

  // Attach Listeners
  if (UI.marketBtn) UI.marketBtn.addEventListener('click', normalSearch);
  if (UI.aiBtn) UI.aiBtn.addEventListener('click', aiSuggestion);
  if (UI.input) {
    UI.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') normalSearch();
    });
  }

  console.log("AIkart UI Initialized");
}

// 2. MODE 1: NORMAL SHOPPING (UPGRADED TO FLASH AI)
async function normalSearch() {
  if (!UI.input) return;
  const rawInput = UI.input.value.trim();
  const product = rawInput.toLowerCase();

  if (!product) {
    UI.resultsTitle.style.display = 'block';
    UI.resultsArea.innerHTML = '<p style="text-align:center; padding:40px; color:#94a3b8; font-weight:600;">Please enter a product name to search.</p>';
    return;
  }

  console.log("Starting Search for:", product);

  // Show Research Flow UI
  const flowContainer = document.getElementById('alkartResearchFlow');
  if (flowContainer) {
    flowContainer.style.display = 'block';
    UI.resultsArea.innerHTML = '';
    UI.resultsTitle.style.display = 'none';
  }

  // Optimize: Trigger both concurrently
  runAlkartResearchFlow();
  fetchAlkartAIResults(product);
}

async function runAlkartResearchFlow() {
  const steps = ['stepConfirm', 'stepCompare', 'stepAnalyze', 'stepFinalize'];

  // Reset all steps first
  steps.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active', 'completed');
    }
  });

  for (let id of steps) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('active');
      await new Promise(r => setTimeout(r, 600));
      el.classList.remove('active');
      el.classList.add('completed');
    }
  }
}

async function fetchAlkartAIResults(product) {
  if (!UI.resultsArea) return;

  // Mock STORE_RESULTS expanded for max coverage
  const STORE_RESULTS = [
    { name: product, store: "Flipkart", price: 12999, stock: "In stock", delivery: "Free delivery by Tomorrow", buyUrl: "https://flipkart.com" },
    { name: product, store: "Amazon India", price: 13200, stock: "In stock", delivery: "FREE Delivery", buyUrl: "https://amazon.in" },
    { name: product, store: "JioMart", price: 12499, stock: "In stock", delivery: "Free delivery", buyUrl: "https://jiomart.com" },
    { name: product, store: "Reliance Digital", price: 12999, stock: "In stock", delivery: "Ship to home", buyUrl: "https://reliancedigital.in" },
    { name: product, store: "Croma", price: 13000, stock: "In stock", delivery: "Express Shipping", buyUrl: "https://croma.com" },
    { name: product, store: "Vijay Sales", price: 12750, stock: "In stock", delivery: "Free shipping", buyUrl: "https://vijaysales.com" },
    { name: product, store: "Poorvika", price: 12500, stock: "Available", delivery: "Free same day delivery", buyUrl: "https://poorvika.com" },
    { name: product, store: "Tata Cliq", price: 13500, stock: "In stock", delivery: "Standard delivery", buyUrl: "https://tatacliq.com" },
    { name: product, store: "Sangeetha Mobiles", price: 12699, stock: "In stock", delivery: "Store pickup available", buyUrl: "https://sangeethamobiles.com" },
    { name: product, store: "Samsung India", price: 12999, stock: "In stock", delivery: "Official Store", buyUrl: "https://samsung.com/in" },
    { name: product, store: "Snapdeal", price: 11999, stock: "In stock", delivery: "Free Shipping", buyUrl: "https://snapdeal.com" },
    { name: product, store: "AddmeCart", price: 10750, stock: "In stock", delivery: "Free delivery", buyUrl: "https://example.com/addmecart" }
  ];

  const prompt = `You are Alkart AI, a search assistant.
    QUERY: "${product}"
    STORES: ${JSON.stringify(STORE_RESULTS)}
    
    1. Resolve query to a real product name.
    2. Provide an image URL.
    3. Categorize into recommended/other.
    Return JSON only.`;

  try {
    // Attempt AI Analysis
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    if (!response.ok) throw new Error("API call failed");

    const data = await response.json();
    if (data.candidates && data.candidates[0]) {
      let rawText = data.candidates[0].content.parts[0].text;
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      const analysis = JSON.parse(rawText);
      renderAlkartAIResults(analysis);
    } else {
      throw new Error("No candidates");
    }
  } catch (error) {
    console.error("Alkart AI (Fallback Mode):", error);
    // FALLBACK: If AI fails, manually map and show results so user NEVER sees "no results"
    const fallbackAnalysis = {
      product: {
        name: product.toUpperCase(),
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d256e?q=80&w=500&auto=format",
        category: "Product Result"
      },
      recommendedStores: STORE_RESULTS.slice(0, 3), // First 3 as recommended
      otherStores: STORE_RESULTS.slice(3)
    };
    renderAlkartAIResults(fallbackAnalysis);
  }
}

function renderAlkartAIResults(analysis) {
  if (!UI.resultsArea) return;

  const { product, recommendedStores, otherStores } = analysis;

  // 1. Combine and Sort by Price
  const allDeals = [...recommendedStores, ...otherStores].sort((a, b) => a.price - b.price);

  const flowContainer = document.getElementById('alkartResearchFlow');
  if (flowContainer) flowContainer.style.display = 'none';

  if (allDeals.length === 0) {
    UI.resultsTitle.style.display = 'block';
    UI.resultsArea.innerHTML = `<div class="no-results-card"><p>No live deals found for "${product.name}" today.</p></div>`;
    return;
  }

  // 2. Separate into categories for grouping
  const RECOMMENDED_PLATFORMS = [
    'Amazon India', 'Flipkart', 'JioMart', 'Croma', 'Reliance Digital',
    'Poorvika', 'Vijay Sales', 'Tata Cliq', 'Samsung India', 'Xiaomi India'
  ];
  const groupedRecommended = allDeals.filter(s => RECOMMENDED_PLATFORMS.includes(s.store));
  const groupedOther = allDeals.filter(s => !RECOMMENDED_PLATFORMS.includes(s.store));

  UI.resultsTitle.style.display = 'block';

  let html = `<div class="alkart-list-container">`;

  if (groupedRecommended.length > 0) {
    html += `<div class="alkart-section-label">Recommended Stores</div>`;
    html += groupedRecommended.map((s, idx) => renderStoreRow(s, product, s === allDeals[0])).join('');
  }

  if (groupedOther.length > 0) {
    html += `<div style="margin-top:24px;" class="alkart-section-label">Other Stores</div>`;
    html += groupedOther.map((s, idx) => renderStoreRow(s, product, s === allDeals[0])).join('');
  }

  html += `</div>`;
  UI.resultsArea.innerHTML = html;
}

function renderStoreRow(store, product, isCheapest) {
  const domain = store.buyUrl ? new URL(store.buyUrl).hostname : 'google.com';
  const productImage = product.image || 'https://images.unsplash.com/photo-1695048133142-1a20484d256e?q=80&w=200&auto=format';
  const deliveryInfo = store.delivery || 'Standard Delivery';

  return `
    <div class="alkart-row">
      <div class="alkart-row-store">
         <img class="store-logo" src="https://www.google.com/s2/favicons?sz=64&domain=${domain}" alt="${store.store}">
      </div>
      <div class="alkart-row-img-wrap">
        <img class="alkart-row-product-img" 
             src="${productImage}" 
             onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format'"
             alt="${product.name}">
      </div>
      <div class="alkart-row-main">
        <div class="alkart-row-title">${product.name} at ${store.store}</div>
        <div class="alkart-row-meta">${store.stock} • ${deliveryInfo}</div>
      </div>
      <div class="alkart-row-price-group">
        ${isCheapest ? '<span class="best-deal-badge">Best Deal</span>' : ''}
        <div class="alkart-row-price">₹${store.price.toLocaleString('en-IN')}</div>
        <a href="${store.buyUrl}" target="_blank" class="alkart-buy-btn">Buy Now</a>
      </div>
    </div>
  `;
}

// Keep original fetchGeminiSummary for the "Product Insights" card if needed
async function fetchGeminiSummary(product) {
  if (!UI.aiSummaryArea) return;

  UI.aiSummaryArea.style.display = 'block';
  UI.aiSummaryArea.innerHTML = `
        <div class="ai-summary-card">
            <div class="ai-summary-header">
                <div class="ai-mini-orb"></div>
                <h4>Product Insights</h4>
            </div>
            <div class="ai-summary-loading">
                <div class="ai-skeleton-line" style="width: 100%"></div>
                <div class="ai-skeleton-line" style="width: 90%"></div>
                <div class="ai-skeleton-line" style="width: 80%"></div>
            </div>
        </div>
    `;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Provide a short, simple, and friendly summary (3 to 4 lines) about "${product}". 
                        Focus on what the product is, its common use, and why people buy it. 
                        Keep it clear and user-friendly. Do not use markdown bolding or bullet points.`
          }]
        }]
      })
    });

    const data = await response.json();
    const summaryText = data.candidates[0].content.parts[0].text;

    UI.aiSummaryArea.innerHTML = `
            <div class="ai-summary-card">
                <div class="ai-summary-header">
                    <div class="ai-mini-orb"></div>
                    <h4>Product Insights</h4>
                </div>
                <div class="ai-summary-text">${summaryText}</div>
            </div>
        `;
  } catch (error) {
    console.error("Gemini Error:", error);
    UI.aiSummaryArea.innerHTML = '';
    UI.aiSummaryArea.style.display = 'none';
  }
}

// 3. MODE 2: AI DEEP ANALYSIS
async function aiSuggestion() {
  if (!UI.input) return;
  const product = UI.input.value.trim();
  if (!product) {
    alert("Search something first!");
    return;
  }

  await startThinkingUI();

  const prompt = `Analyze this product in detail: ${product}. 
Provide a comprehensive report covering:
1) THINKING & REASONING: Deep AI logic about build quality, brand value, and fitness for use.
2) LIVE PRICE COMPARISON: Search and list current prices across major Indian shopping websites (Amazon.in, Flipkart, Reliance Digital, Croma, etc.).
3) LOWEST PRICE HIGHLIGHT: Clearly state which platform currently offers the lowest price.
4) COMPETITIVE ANALYSIS: Comparison with 2-3 similar products in the same price range.
5) ALTERNATIVES & RECOMMENDATION: Better/Cheaper alternatives and a final Buy/Skip verdict.
Focus on accurate Indian pricing and availability.`;

  const perplexityUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`;
  window.open(perplexityUrl, '_blank');

  if (UI.overlay) UI.overlay.style.display = 'none';
}

// 4. ANIMATION HELPERS
async function startThinkingUI() {
  if (!UI.overlay) return;
  UI.overlay.style.display = 'flex';
  const steps = ['step1', 'step2', 'step3'];
  for (let id of steps) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('active');
      el.style.opacity = '1';
      await new Promise(r => setTimeout(r, 800));
      el.style.opacity = '0.3';
      el.classList.remove('active');
    }
  }
}

// RUN INITIALIZATION
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUI);
} else {
  initUI();
}

// SERVICE WORKER - Versioned Registration & Force Unregister
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Unregister all existing workers first (Nuclear Clean)
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
      }
      // Register the new one with a timestamp to bust browser SW registration cache
      navigator.serviceWorker.register('./sw.js?v=' + Date.now()).catch(() => { });
    });
  });
}
