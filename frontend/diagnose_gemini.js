
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: './.env' });

const API_KEY = (process.env.VITE_GEMINI_API_KEY || "").trim();
console.log("Diagnostic: Testing Key:", API_KEY.substring(0, 5) + "..." + API_KEY.substring(API_KEY.length - 3));

async function runDiagnostic() {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        console.log("Diagnostic: Attempting to list models...");
        const models = await ai.models.list();
        console.log("Diagnostic: SUCCESS! Available models:", models.map(m => m.name));
    } catch (err) {
        console.error("Diagnostic: FAILED to list models.");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Status Text:", err.response.statusText);
        }
    }
}

runDiagnostic();
