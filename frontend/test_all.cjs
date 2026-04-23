
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = (match ? match[1] : "").trim();

async function findAndTest() {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const result = await ai.models.list();
        const availableModels = result.models || [];
        
        const validModels = availableModels
            .filter(m => m.supportedActions.includes('generateContent'))
            .map(m => m.name);
            
        console.log("Valid Models Found:", validModels.length);
        console.log("Top 5 Valid:", validModels.slice(0, 5));
        
        for (const m of validModels) {
            console.log(`Testing ${m}...`);
            try {
                const response = await ai.models.generateContent({
                    model: m,
                    contents: "say hi"
                });
                console.log(`SUCCESS! Model ${m} generated:`, response.text);
                break; // Stop after first success
            } catch(e) {
                console.log(`FAIL ${m}:`, e.message);
            }
        }
    } catch(err) {
        console.error("Critical Error:", err);
    }
}
findAndTest();
