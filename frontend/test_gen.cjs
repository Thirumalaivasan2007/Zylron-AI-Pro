
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = (match ? match[1] : "").trim();

async function testGenerate() {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        console.log("Trying gemini-1.5-flash...");
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: "say hi"
        });
        console.log("SUCCESS:", response.text);
    } catch (err) {
        console.error("FAIL gemini-1.5-flash:", err.message);
        console.error("Trying models/gemini-1.5-flash...");
        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            const response2 = await ai.models.generateContent({
                model: "models/gemini-1.5-flash",
                contents: "say hi"
            });
            console.log("SUCCESS:", response2.text);
        } catch(err2) {
            console.error("FAIL models/gemini-1.5-flash:", err2.message);
        }
    }
}
testGenerate();
