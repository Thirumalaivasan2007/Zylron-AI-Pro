
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = (match ? match[1] : "").trim();

async function checkModels() {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        let count = 0;
        const validModels = [];
        
        // Use async iterator
        for await (const m of await ai.models.list()) {
            count++;
            if (m.supportedActions && m.supportedActions.includes('generateContent')) {
                validModels.push(m.name);
            } else if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                validModels.push(m.name);
            }
        }
        
        console.log("Total models iterated:", count);
        console.log("Models supporting generateContent:", validModels.length);
        console.log("Top 10 valid models:", validModels.slice(0, 10));
        
        // Try to generate with the first valid one
        if (validModels.length > 0) {
            console.log(`Testing generation with ${validModels[0]}...`);
            try {
                const response = await ai.models.generateContent({
                    model: validModels[0],
                    contents: "hello"
                });
                console.log("SUCCESS!", response.text);
            } catch(e) {
                console.log("FAIL:", e.message);
            }
        }
    } catch(err) {
        console.error("Critical Error:", err);
    }
}
checkModels();
