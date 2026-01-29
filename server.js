const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

app.post('/api/summarize', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is missing' });

    console.log(`[Backend] Researching: ${query}`);

    // Try multiple models in order of preference
    const models = [
        "gemini-1.5-flash",
        "gemini-pro",
        "gemini-1.5-pro"
    ];

    let lastError = null;

    for (const model of models) {
        try {
            console.log(`[Backend] Attempting with model: ${model}`);
            const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

            const prompt = `You are an AI that generates product summaries.
    Rules:
    1. Generate summary ONLY based on the exact product name: "${query}".
    2. Do NOT use generic sentences.
    3. If only a brand name is given (example: "Samsung", "Apple", "Nike"), do NOT summarize. instead ask the user to specify the product or model from that brand.
    4. Summary must be exactly 3–4 lines and highly product-specific.
    5. Do NOT repeat the same sentence for different searches.
    
    Output:
    A short, accurate summary ONLY about the given product. Plain text only.`;

            const payload = {
                contents: [{
                    parts: [{ text: prompt }]
                }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            };

            const response = await axios.post(url, payload);
            const data = response.data;

            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                const summary = data.candidates[0].content.parts[0].text.trim();
                console.log(`[Backend] Success with model: ${model}`);
                return res.json({ summary, success: true, modelUsed: model });
            } else {
                // If a model returns no candidates or empty content, treat it as a soft failure and try next model
                const blockReason = data.promptFeedback?.blockReason || "Empty candidates";
                const finishReason = data.candidates?.[0]?.finishReason || "No finish reason";
                console.warn(`[Backend] Model ${model} returned no valid content. Block reason: ${blockReason}, Finish reason: ${finishReason}`);
                lastError = `Model ${model} returned no valid content. Block reason: ${blockReason}`;
                continue;
            }
        } catch (error) {
            lastError = error.response?.data?.error?.message || error.message;
            console.warn(`[Backend] Model ${model} failed: ${lastError}`);
            // If it's a 404 or other API error, we definitely want to try the next model
            continue;
        }
    }

    // If we reach here, all models failed
    res.status(503).json({
        error: 'All AI models failed',
        details: lastError,
        success: false
    });
});

app.post('/api/alkart-search', async (req, res) => {
    const { product, storeResults } = req.body;
    if (!product || !storeResults) return res.status(400).json({ error: 'Missing product or results' });

    console.log(`[Backend] Alkart AI Search for: ${product}`);

    try {
        const prompt = `You are Alkart AI, a search integration assistant for an Indian price comparison site.
    
    PRODUCT_QUERY: "${product}"
    STORE_RESULTS: ${JSON.stringify(storeResults)}
    
    STRICT RULES:
    1. Identify the EXACT matching product even if the query is mangled.
    2. Recommended Stores: Flipkart, Amazon India, JioMart, Croma, Reliance Digital, Poorvika, Vijay Sales, Tata Cliq, Samsung/Brand Stores.
    3. Normalize all fields.
    4. Return ONLY JSON.
    
    JSON SCHEMA:
    {
      "product": { "name": "", "image": "", "category": "" },
      "recommendedStores": [ { "store": "", "price": 0, "stock": "", "delivery": "", "returns": "", "buyUrl": "" } ],
      "otherStores": [ ... ]
    }`;

        const response = await axios.post(GEMINI_URL, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" }
        });

        const analysisText = response.data.candidates[0].content.parts[0].text;
        const analysis = JSON.parse(analysisText);

        res.json(analysis);
    } catch (error) {
        console.error(`[Backend] Flash Search Error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
