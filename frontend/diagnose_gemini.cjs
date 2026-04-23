
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = (match ? match[1] : "").trim();

console.log("Diagnostic: Testing Key:", API_KEY.substring(0, 5) + "..." + API_KEY.substring(API_KEY.length - 3));

async function runDiagnostic() {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        console.log("Diagnostic: Attempting to list models...");
        const result = await ai.models.list();
        console.log("Diagnostic: Result Type:", typeof result);
        console.log("Diagnostic: Result Keys:", Object.keys(result));
        if (result.models) {
            console.log("Diagnostic: SUCCESS! Models:", result.models.map(m => m.name));
        } else if (Array.isArray(result)) {
            console.log("Diagnostic: SUCCESS! Result is Array:", result.map(m => m.name));
        } else {
            console.log("Diagnostic: Raw Result:", JSON.stringify(result, null, 2));
        }
    } catch (err) {
        console.error("Diagnostic: FAILED.");
        console.error("Error Message:", err.message);
    }
}

runDiagnostic();
