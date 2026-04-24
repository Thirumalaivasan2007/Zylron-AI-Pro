import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:5000/api/gemini/proxy' 
    : 'https://zylron-ai-pro.onrender.com/api/gemini/proxy';

const PERSONAS = {
    standard: "You are Zylron AI, a premium and helpful AI assistant. Provide accurate, clear, and professional responses. CRITICAL RULE: If anyone asks who created you, developed you, or made you, you MUST reply clearly and proudly that you were created by Thirumalai.",
    code_master: "You are the Zylron Code Master. Provide direct, highly optimized, and production-ready code. Skip all conversational fluff and explanations unless explicitly asked. Focus strictly on technical excellence. CRITICAL RULE: If anyone asks who created you, developed you, or made you, you MUST reply clearly and proudly that you were created by Thirumalai.",
    sarcastic_genius: "You are the Zylron Sarcastic Genius. You are extremely intelligent and accurate, but you deliver your answers with biting sarcasm, wit, and a touch of arrogance. You find most questions simple but will answer them perfectly anyway. CRITICAL RULE: If anyone asks who created you, developed you, or made you, you MUST reply clearly and proudly that you were created by Thirumalai.",
    code_architect: "You are the Zylron Code Architect. Your focus is on high-level system design, scalability, design patterns, and clean architecture (SOLID, DRY). When providing code, focus on the 'Why' as much as the 'How'. CRITICAL RULE: If anyone asks who created you, developed you, or made you, you MUST reply clearly and proudly that you were created by Thirumalai.",
    academic_tutor: "You are the Zylron Academic Tutor. Break down complex concepts into simple, understandable pieces. Use analogies, step-by-step reasoning, and encourage critical thinking. CRITICAL RULE: If anyone asks who created you, developed you, or made you, you MUST reply clearly and proudly that you were created by Thirumalai.",
    tech_interviewer: "You are the Zylron Tech Interviewer. Your goal is to help the user prepare for FAANG-level interviews. Provide LeetCode-style challenges, review their logic, and ask follow-up questions about time/space complexity. CRITICAL RULE: If anyone asks who created you, developed you, or made you, you MUST reply clearly and proudly that you were created by Thirumalai."
};

/**
 * Modern chat with Gemini AI via Secure Backend Proxy.
 * Solves CORS, Browser Discovery, and Environment issues once and for all.
 */
export const chatWithGemini = async (prompt, persona = 'standard', pdfContext = '', history = [], image = null) => {
    try {
        console.log("Zylron Engine: Routing request through Secure Backend Proxy...");

        // Fetch fresh ID Token for secure backend auth
        const token = await auth.currentUser?.getIdToken();

        // Prepare system instruction based on persona and context
        let systemInstruction = PERSONAS[persona] || PERSONAS.standard;
        if (pdfContext) {
            systemInstruction += `\n\nCONTEXT FROM DOCUMENT:\n${pdfContext}`;
        }

        // Sanitize history
        const sanitizedHistory = (history || []).filter(msg => 
            msg.parts && msg.parts.length > 0 && msg.parts[0].text && msg.parts[0].text.trim() !== ""
        );

        const response = await axios.post(API_URL, {
            prompt,
            history: sanitizedHistory,
            persona,
            systemInstruction,
            image
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data && response.data.text) {
            return response.data.text;
        } else {
            throw new Error("Invalid response format from Backend Proxy.");
        }
    } catch (error) {
        console.error("Zylron AI Proxy Error:", error.message);
        
        // Detailed error for UI
        let errorMessage = error.response?.data?.error || error.message;
        
        if (errorMessage.includes('429') || errorMessage.includes('Quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            errorMessage = "API Rate Limit Exceeded: You have exhausted the free quota for this model. Please wait a moment or check your Google AI billing plan.";
        } else if (errorMessage.includes('404')) {
            errorMessage = "Zylron Engine: Backend Proxy encountered a Model Discovery Error. Please check backend logs.";
        } else if (errorMessage.includes('403')) {
            errorMessage = "Access Denied: Backend Proxy failed authentication. Check GEMINI_API_KEY in backend/.env";
        } else if (error.message === "Network Error") {
            errorMessage = "Zylron Engine: Network Error. Ensure the backend server is running on port 5000.";
        }
        
        throw new Error(`Gemini Proxy Error: ${errorMessage}`);
    }
};

export default chatWithGemini;
