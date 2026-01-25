/**
 * AIkart – Unified Dual-Action Engine
 * Source of Truth: unifiedSearchInput
 */

// 1. STORE & LOGIC CONFIG
const STORE_DATA = {
  "Amazon India": { url: "https://www.amazon.in/s?k=", domain: "amazon.in" },
  "Flipkart": { url: "https://www.flipkart.com/search?q=", domain: "flipkart.com" },
  "Myntra": { url: "https://www.myntra.com/", domain: "myntra.com", isPath: true },
  "Ajio": { url: "https://www.ajio.com/search/?text=", domain: "ajio.com" },
  "Croma": { url: "https://www.croma.com/search?q=", domain: "croma.com" },
  "Reliance Digital": { url: "https://www.reliancedigital.in/search?q=", domain: "reliancedigital.in" },
  "BigBasket": { url: "https://www.bigbasket.com/ps/?q=", domain: "bigbasket.com" },
  "JioMart": { url: "https://www.jiomart.com/search/", domain: "jiomart.com" },
  "Amazon Fresh": { url: "https://www.amazon.in/s?k=", domain: "amazon.in" },
  "Tata Cliq": { url: "https://www.tatacliq.com/search/?searchCategory=all&text=", domain: "tatacliq.com" }
};

const CATEGORY_MAP = {
  electronics: ["Amazon India", "Flipkart", "Croma", "Reliance Digital"],
  fashion: ["Myntra", "Ajio", "Amazon India", "Flipkart"],
  grocery: ["BigBasket", "JioMart", "Amazon Fresh"],
  home: ["Amazon India", "Flipkart", "Tata Cliq"],
  all: ["Amazon India", "Flipkart", "Myntra", "Ajio", "Croma", "BigBasket", "JioMart"]
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

// 2. MODE 1: NORMAL SHOPPING
function normalSearch() {
  if (!UI.input) return;
  const product = UI.input.value.trim();
  if (!product) {
    alert("Enter something to search first!");
    return;
  }

  const selectedCategory = UI.category.value;
  const targetStores = CATEGORY_MAP[selectedCategory] || CATEGORY_MAP.all;

  if (UI.resultsTitle) UI.resultsTitle.style.display = 'block';
  if (UI.resultsArea) {
    UI.resultsArea.innerHTML = '';
    targetStores.forEach(name => {
      const config = STORE_DATA[name];
      if (!config) return;

      const card = document.createElement('div');
      card.className = 'store-card';

      let finalUrl = config.url + encodeURIComponent(product);
      if (config.isPath) finalUrl = `${config.url}${encodeURIComponent(product.replace(/\s+/g, '-'))}`;

      card.innerHTML = `
                <img class="store-logo" src="https://www.google.com/s2/favicons?sz=64&domain=${config.domain}" alt="${name}">
                <span>${name}</span>
            `;
      card.onclick = () => window.open(finalUrl, '_blank');
      UI.resultsArea.appendChild(card);
    });
    UI.resultsArea.scrollIntoView({ behavior: 'smooth' });
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

// SERVICE WORKER
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => { });
  });
}
