
const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const API_KEY = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Secure Gemini Proxy Route
router.post('/proxy', async (req, res) => {
    try {
        const { prompt, history, persona, systemInstruction, image } = req.body;

        // Model fallback logic (Node side)
        const baseModels = [
            "gemini-3.1-flash",
            "gemini-3.1-pro",
            "gemini-2.5-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "gemini-pro"
        ];

        let modelAttempts = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-3.1-flash"
        ];

        // Autonomous Discovery on Backend using Async Iterator
        try {
            const discoveredIds = [];
            for await (const m of await ai.models.list()) {
                if ((m.supportedActions && m.supportedActions.includes('generateContent')) ||
                    (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))) {
                    discoveredIds.push(m.name);
                }
            }
            if (discoveredIds.length > 0) {
                modelAttempts = [...new Set([...discoveredIds, ...modelAttempts])];
            }
        } catch (e) {
            console.warn("Backend Proxy: Autonomous discovery failed", e.message);
        }

        let firstMeaningfulError = null;
        let lastError = null;

        // Construct User Parts
        const userParts = [{ text: prompt }];
        if (image && image.inlineData) {
            userParts.push(image);
        }

        for (const modelId of modelAttempts) {
            try {
                const response = await ai.models.generateContent({
                    model: modelId,
                    contents: [
                        ...history,
                        { role: 'user', parts: userParts }
                    ],
                    config: {
                        systemInstruction: { parts: [{ text: systemInstruction }] }
                    }
                });

                console.log(`Backend Proxy: SUCCESS with model ${modelId}`);
                return res.json({ text: response.text });
            } catch (err) {
                console.warn(`Backend Proxy: Attempt with ${modelId} failed: ${err.message}`);
                lastError = err;
                
                // If it's a rate limit or authentication error, save it as the meaningful error
                if (!firstMeaningfulError && (err.message.includes('429') || err.message.includes('Quota') || err.message.includes('403'))) {
                    firstMeaningfulError = err;
                }
                continue;
            }
        }

        const errorToThrow = firstMeaningfulError || lastError;
        console.error("Backend Proxy: All models failed. Sending 500:", errorToThrow.message);
        return res.status(500).json({ error: errorToThrow.message });
    } catch (error) {
        console.error("Gemini Proxy Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
