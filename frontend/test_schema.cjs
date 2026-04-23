
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = (match ? match[1] : "").trim();

async function checkModels() {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const result = await ai.models.list();
        const availableModels = result.models || [];
        
        console.log("Total models:", availableModels.length);
        console.log("First model keys:", Object.keys(availableModels[0]));
        console.log("First model supportedActions:", availableModels[0].supportedActions);
        console.log("First model supportedGenerationMethods:", availableModels[0].supportedGenerationMethods);
        
        const genModels = availableModels.filter(m => 
            (m.supportedActions && m.supportedActions.includes('generateContent')) ||
            (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        );
        console.log("Models supporting generateContent:", genModels.length);
    } catch(err) {
        console.error("Critical Error:", err);
    }
}
checkModels();
