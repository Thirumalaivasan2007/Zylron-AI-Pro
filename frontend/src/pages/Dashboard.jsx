import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatWithGemini } from '../services/gemini';
import Sidebar from '../components/Sidebar';
import UserProfileModal from '../components/UserProfileModal';
import SettingsModal from '../components/SettingsModal';
import { useNavigate } from 'react-router-dom';
import { 
    Send, 
    User, 
    Menu, 
    Smile, 
    Mic, 
    Sun, 
    Moon, 
    Settings, 
    Shield, 
    LogOut,
    FileText,
    UploadCloud,
    X,
    ChevronDown,
    Zap,
    Code,
    Sparkles,
    Loader2,
    Download,
    Eye,
    Camera,
    Volume2,
    VolumeX,
    Headphones,
    Copy,
    Check,
    ThumbsUp,
    ThumbsDown,
    FileDown,
    Share2,
    HelpCircle,
    GraduationCap,
    Briefcase,
    ShieldCheck,
    Box,
    Terminal,
    Play
} from 'lucide-react';
import { Joyride } from 'react-joyride';
import CodePreviewModal from '../components/CodePreviewModal';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const QUICK_PROMPTS = [
    { label: 'Summarize', text: 'Please summarize the key points of our discussion.' },
    { label: 'Fix Bug', text: 'I have a bug in my code. Can you help me debug and provide the fix?' },
    { label: 'Explain (ELI5)', text: "Explain this concept like I'm five years old." },
    { label: 'Optimize', text: 'Review this code/text and make it more professional and optimized.' }
];
import { useDropzone } from 'react-dropzone';
import * as pdfjs from 'pdfjs-dist';
import ReactMarkdown from 'react-markdown';
import ZylronLogo from '../logo.png';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import EmojiPicker from 'emoji-picker-react';
import { saveChatToCloud, fetchCloudChats, deleteCloudChat, saveFeedbackToCloud, createPublicShare } from '../services/firestore';
import ZylronSense from '../components/ZylronSense';

// Configure PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const TypewriterMarkdown = ({ text, animate }) => {
    const [displayedText, setDisplayedText] = useState(animate ? '' : text);

    useEffect(() => {
        if (!animate) {
            setDisplayedText(text);
            return;
        }

        setDisplayedText('');
        let i = 0;
        
        // Dynamic Speed Engine: Ensure large responses complete in ~2-3 seconds max
        const framesToComplete = 200; 
        const chunk = Math.max(1, Math.ceil(text.length / framesToComplete));

        const interval = setInterval(() => {
            i += chunk;
            setDisplayedText(text.slice(0, i));
            if (i >= text.length) clearInterval(interval);
        }, 15);

        return () => clearInterval(interval);
    }, [text, animate]);

    return (
        <ReactMarkdown
            components={{
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                        <div className="relative group/code my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{match[1]}</span>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                                    className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-cyan-400 hover:opacity-70 transition-opacity"
                                >
                                    Copy
                                </button>
                            </div>
                            <SyntaxHighlighter
                                {...props}
                                children={String(children).replace(/\n$/, '')}
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.85rem', lineHeight: '1.6' }}
                            />
                        </div>
                    ) : (
                        <code {...props} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-emerald-600 dark:text-cyan-300 font-mono text-xs border border-gray-200 dark:border-gray-700">
                            {children}
                        </code>
                    )
                }
            }}
        >
            {displayedText}
        </ReactMarkdown>
    );
};

const TOUR_STEPS = [
    {
        target: '.sidebar-trigger',
        content: 'Access your full chat history and manage cloud sessions here.',
        skipBeacon: true,
    },
    {
        target: '.upload-area',
        content: 'Drop PDFs or Images here for multimodal analysis. Zylron reads images and documents instantly.',
    },
    {
        target: '.sense-toggle',
        content: 'Activate Zylron Sense for touchless gesture control using your webcam.',
    },
    {
        target: '.persona-selector',
        content: 'Switch between specialized experts like Code Architect, Academic Tutor, or Tech Interviewer.',
    },
    {
        target: '.credits-tracker',
        content: 'Monitor your daily AI usage and SaaS credit balance in real-time.',
    }
];

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState(localStorage.theme || 'dark');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Phase 2.6: Ultimate Persona System
    const [persona, setPersona] = useState('standard'); 
    const personaColors = {
        standard: { primary: 'emerald', secondary: 'cyan', glow: 'rgba(0, 255, 255, 0.4)' },
        code_master: { primary: 'blue', secondary: 'indigo', glow: 'rgba(59, 130, 246, 0.5)' },
        sarcastic_genius: { primary: 'amber', secondary: 'orange', glow: 'rgba(245, 158, 11, 0.5)' },
        code_architect: { primary: 'purple', secondary: 'violet', glow: 'rgba(168, 85, 247, 0.5)' },
        academic_tutor: { primary: 'rose', secondary: 'pink', glow: 'rgba(244, 63, 94, 0.5)' },
        tech_interviewer: { primary: 'slate', secondary: 'gray', glow: 'rgba(100, 116, 139, 0.5)' }
    };

    const [isTourActive, setIsTourActive] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [previewCode, setPreviewCode] = useState('');
    const [credits, setCredits] = useState(() => {
        return parseInt(localStorage.getItem('zylron_credits')) || 0;
    });

    useEffect(() => {
        localStorage.setItem('zylron_credits', credits);
    }, [credits]);

    const handlePersonaChange = (newPersona) => {
        if (newPersona === persona) return;
        
        setPersona(newPersona);
        setPersonaDropdownOpen(false);
        
        // Visual feedback in chat
        const shiftMessage = { 
            type: 'ai', 
            content: `*Zylron has shifted protocols to **${newPersona.replace('_', ' ').toUpperCase()}** mode.*`, 
            animate: true,
            isSystem: true 
        };
        setMessages(prev => [...prev, shiftMessage]);
    };

    const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
    const [activePdf, setActivePdf] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [pdfContext, setPdfContext] = useState('');
    const [isProcessingDoc, setIsProcessingDoc] = useState(false);
    const [isSenseActive, setIsSenseActive] = useState(false);
    const [isAutoSpeak, setIsAutoSpeak] = useState(false);
    const [isSpeakingIndex, setIsSpeakingIndex] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [feedbackToast, setFeedbackToast] = useState(null);
    const [isMemoryEnabled, setIsMemoryEnabled] = useState(localStorage.memory === 'true');

    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const dropdownRef = useRef(null);
    const personaRef = useRef(null);

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleFeedback = async (messageIdx, type) => {
        if (!user || !currentSessionId) return;
        
        try {
            const updatedMessages = [...messages];
            updatedMessages[messageIdx].feedback = type;
            setMessages(updatedMessages);
            await saveFeedbackToCloud(currentSessionId, updatedMessages);
            
            // Show toast
            setFeedbackToast(type === 'up' ? "Positive feedback recorded! Zylron is pleased. ✨" : "Feedback noted. Zylron will analyze and improve. 🛠️");
            setTimeout(() => setFeedbackToast(null), 3000);
        } catch (error) {
            console.error("Feedback Error:", error);
        }
    };

    const exportToPDF = async () => {
        if (messages.length === 0) return;
        
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text("Zylron AI Intelligence Report", 20, 30);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate 400
        doc.text(`Date: ${new Date().toLocaleString()}`, 20, 40);
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.line(20, 50, pageWidth - 20, 50);
        
        let yPos = 65;
        
        messages.forEach((msg, idx) => {
            if (msg.isSystem) return;
            
            const role = msg.type === 'user' ? 'YOU:' : 'ZYLRON AI:';
            const content = msg.content;
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(msg.type === 'user' ? 71 : 16, msg.type === 'user' ? 85 : 185, msg.type === 'user' ? 105 : 129);
            doc.text(role, 20, yPos);
            
            doc.setFont("helvetica", "normal");
            doc.setTextColor(30, 41, 59); // Slate 800
            
            const splitText = doc.splitTextToSize(content, pageWidth - 40);
            doc.text(splitText, 20, yPos + 7);
            
            yPos += (splitText.length * 5) + 20;
            
            if (yPos > 270) {
                doc.addPage();
                yPos = 30;
            }
        });
        
        doc.save(`Zylron_Report_${new Date().getTime()}.pdf`);
    };

    const handleShareChat = async () => {
        if (messages.length === 0) return;
        setIsLoading(true);
        const publicId = await createPublicShare(messages, persona);
        setIsLoading(false);
        if (publicId) {
            const url = `${window.location.origin}/share/${publicId}`;
            navigator.clipboard.writeText(url);
            setFeedbackToast("Share link copied to clipboard! 🔗");
        }
    };

    const toggleMemory = () => {
        const newValue = !isMemoryEnabled;
        setIsMemoryEnabled(newValue);
        localStorage.memory = newValue;
    };

    const detectWebCode = (content) => {
        const patterns = [/<html>/i, /<script>/i, /<div/i, /<svg/i, /<!DOCTYPE/i, /<canvas/i];
        return patterns.some(p => p.test(content));
    };

    const handleCodePreview = (content) => {
        // More robust regex: Matches ```[language] optionally followed by space, then newline, then code
        const codeBlockRegex = /```([a-z]*)[ \t]*\n([\s\S]*?)```/gi;
        let match;
        let htmlContent = "";
        let cssContent = "";
        let jsContent = "";
        
        while ((match = codeBlockRegex.exec(content)) !== null) {
            const lang = (match[1] || '').trim().toLowerCase();
            const code = match[2];

            if (lang === 'html') {
                htmlContent += code + "\n";
            } else if (lang === 'css') {
                cssContent += code + "\n";
            } else if (lang === 'js' || lang === 'javascript') {
                jsContent += code + "\n";
            } else {
                // Fallback: sniff content only if lang is missing/unknown
                // Check if it's mostly HTML or just JS containing an HTML string
                const isLikelyJS = code.includes('const ') || code.includes('let ') || code.includes('function') || code.includes('document.');
                
                if (!isLikelyJS && (code.includes('<html') || code.includes('<div') || code.includes('<body'))) {
                    htmlContent += code + "\n";
                } else if (!isLikelyJS && code.includes('{') && code.includes(':')) {
                    cssContent += code + "\n";
                } else {
                    jsContent += code + "\n";
                }
            }
        }

        // Assemble valid HTML document
        let finalCode = htmlContent;
        if (cssContent.trim()) finalCode += `\n<style>\n${cssContent}\n</style>`;
        if (jsContent.trim()) finalCode += `\n<script>\n${jsContent}\n</script>`;

        // Fallback: If no blocks found, use whole content
        if (!finalCode.trim()) finalCode = content;

        setPreviewCode(finalCode.trim());
        setIsCodeModalOpen(true);
    };

    // TTS Logic
    const stopSpeech = () => {
        window.speechSynthesis.cancel();
        setIsSpeakingIndex(null);
    };

    const speakText = (text, index) => {
        if (isSpeakingIndex === index) {
            stopSpeech();
            return;
        }

        stopSpeech();

        // Strip markdown and code blocks for clean speech
        const cleanText = text
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`.*?`/g, '') // Remove inline code
            .replace(/[*_#]/g, '') // Remove markdown symbols
            .replace(/https?:\/\/\S+/g, 'link') // Replace URLs
            .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Voice selection logic
        const voices = window.speechSynthesis.getVoices();
        const premiumVoice = voices.find(v => 
            v.name.includes('Google UK English Female') || 
            v.name.includes('Microsoft Zira') || 
            v.name.includes('Female') ||
            v.lang.startsWith('en-GB')
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        utterance.voice = premiumVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeakingIndex(index);
        utterance.onend = () => setIsSpeakingIndex(null);
        utterance.onerror = () => setIsSpeakingIndex(null);

        window.speechSynthesis.speak(utterance);
    };

    // Sync theme to root HTML
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // Image Upload Logic (Base64)
    const handleImageUpload = (file) => {
        setIsProcessingDoc(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            // The result is a Base64 encoded string starting with 'data:image/...;base64,'
            // We strip that prefix to get raw base64 data for the API
            const base64Data = reader.result.split(',')[1];
            setActiveImage({
                url: reader.result, // For UI Preview
                data: base64Data,   // For Gemini API inlineData
                mimeType: file.type,
                name: file.name
            });
            setIsProcessingDoc(false);
        };
        reader.readAsDataURL(file);
    };

    // PDF Extraction Logic
    const extractTextFromPdf = async (file) => {
        setIsProcessingDoc(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const strings = content.items.map(item => item.str);
                fullText += strings.join(" ") + "\n";
            }
            setPdfContext(fullText);
            setActivePdf({ name: file.name, size: (file.size / 1024).toFixed(1) + " KB" });
        } catch (error) {
            console.error("PDF Extraction Error:", error);
            alert("Failed to extract text from PDF. Please try a different file.");
        } finally {
            setIsProcessingDoc(false);
        }
    };

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        if (!file) return;
        
        if (file.type === "application/pdf") {
            extractTextFromPdf(file);
        } else if (file.type.startsWith("image/")) {
            handleImageUpload(file);
        } else {
            alert("Please upload a PDF or an Image file.");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        noClick: true, // Allow manual upload icon click instead
        accept: { 
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp']
        }
    });

    const removePdf = () => {
        setActivePdf(null);
        setPdfContext('');
    };

    const removeImage = () => {
        setActiveImage(null);
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support the Web Speech API.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                currentTranscript += event.results[i][0].transcript;
            }
            setInput(currentTranscript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onEmojiClick = (emojiObject) => {
        setInput(prev => prev + emojiObject.emoji);
    };

    // Cloud Persistence Layer (Phase 4)
    useEffect(() => {
        if (user) {
            fetchHistory();
        } else {
            setHistory([]);
        }
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const saveToCloud = async (sessionId, updatedMessages) => {
        if (!user) return;
        
        let chatTitle = 'New Chat';
        const existingSession = history.find(s => s.sessionId === sessionId);
        
        if (existingSession) {
            chatTitle = existingSession.message;
        } else {
            const firstUserMsg = updatedMessages.find(m => m.type === 'user' && !m.isSystem);
            chatTitle = firstUserMsg?.content?.substring(0, 40) || 'New Chat';
            
            if (updatedMessages.filter(m => !m.isSystem).length >= 2) {
                try {
                    const titlePrompt = `Analyze this user request and generate a professional 2-word chat title. Return ONLY the title. Request: ${firstUserMsg.content}`;
                    const generatedTitle = await chatWithGemini(titlePrompt, 'standard');
                    chatTitle = generatedTitle.replace(/["'*\.]/g, '').trim();
                } catch (err) {
                    console.warn("Failed to generate AI title:", err);
                }
            }
        }

        // Optimistic UI Update
        const newSessionData = {
            sessionId,
            message: chatTitle,
            messages: updatedMessages,
            userId: user.uid,
            createdAt: existingSession ? existingSession.createdAt : new Date().toISOString()
        };
        
        setHistory(prev => {
            const idx = prev.findIndex(s => s.sessionId === sessionId);
            if (idx !== -1) {
                const newHistory = [...prev];
                newHistory[idx] = newSessionData;
                return newHistory;
            }
            return [newSessionData, ...prev];
        });

        // Save to Firebase
        await saveChatToCloud(user.uid, sessionId, chatTitle, updatedMessages);
    };

    const fetchHistory = async () => {
        if (!user) return;
        const cloudHistory = await fetchCloudChats(user.uid);
        setHistory(cloudHistory);
    };

    const loadSession = async (sessionId) => {
        const session = history.find(s => s.sessionId === sessionId);
        if (session) {
            setCurrentSessionId(sessionId);
            setMessages(session.messages || []);
            if (window.innerWidth < 1024) setSidebarOpen(false);
        }
    };

    const handleNewChat = () => {
        setCurrentSessionId(null);
        setMessages([]); 
        removePdf();
        if (window.innerWidth < 1024) setSidebarOpen(false);
    };

    const handleSignOut = () => {
        logout();
    };

    const deleteSession = async (sessionId) => {
        if (!user) return;
        
        // Optimistic UI
        setHistory(prev => prev.filter(s => s.sessionId !== sessionId));
        if (currentSessionId === sessionId) handleNewChat();
        
        // Delete from Firebase
        await deleteCloudChat(sessionId);
    };

    const exportToMarkdown = () => {
        if (messages.length === 0) return;
        
        const session = history.find(s => s.sessionId === currentSessionId);
        const title = session ? session.message.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'zylron_chat';
        
        let mdContent = `# Zylron AI Chat Export\n\n**Date:** ${new Date().toLocaleString()}\n**Persona:** ${persona}\n\n---\n\n`;
        
        messages.forEach(msg => {
            if (msg.isSystem) return;
            const role = msg.type === 'user' ? '**You:**' : '**Zylron AI:**';
            mdContent += `${role}\n\n${msg.content}\n\n---\n\n`;
        });

        const blob = new Blob([mdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!input.trim() && !activePdf && !activeImage) return;

        // Production Limit Enforcement
        if (credits >= 50) {
            setMessages(prev => [...prev, { 
                type: 'ai', 
                content: "⚠️ **Daily Limit Reached.** You have exhausted your 50 free daily AI credits. Please upgrade to Zylron Pro to continue using AI services.",
                animate: false,
                isSystem: true
            }]);
            return;
        }

        const userMsg = input;
        const sessionId = currentSessionId || Date.now().toString();
        if (!currentSessionId) setCurrentSessionId(sessionId);

        // Prep image for Gemini and clear it from UI state immediately
        const imagePayload = activeImage ? {
            inlineData: {
                data: activeImage.data,
                mimeType: activeImage.mimeType
            }
        } : null;
        const imageUrlForUI = activeImage?.url;

        setInput('');
        setActiveImage(null);

        const updatedMessages = [...messages, { 
            type: 'user', 
            content: userMsg, 
            imageUrl: imageUrlForUI || null,
            animate: false 
        }];
        setMessages(updatedMessages);
        setIsLoading(true);

        // Phase 10: Long-term Memory Injection
        let memoryContext = "";
        if (isMemoryEnabled && history.length > 0) {
            const keywords = userMsg.toLowerCase().split(' ').filter(w => w.length > 3);
            const relevantChats = history.filter(chat => 
                keywords.some(k => chat.message.toLowerCase().includes(k))
            ).slice(0, 3);
            
            if (relevantChats.length > 0) {
                memoryContext = "\n\n[LONG-TERM MEMORY: You previously discussed these topics with the user. Use this for context if relevant:]\n" + 
                    relevantChats.map(c => `- ${c.message}`).join('\n');
            }
        }

        // Prep history for Gemini (only text parts to save tokens)
        const geminiHistory = updatedMessages.slice(0, -1).filter(m => m.type !== 'error').map(m => ({
            role: m.type === 'user' ? 'user' : 'model',
            parts: [{ text: m.content || "Attached an image." }]
        })).slice(-10);

        try {
            const aiResponse = await chatWithGemini(userMsg || "Please describe this image.", persona, pdfContext + memoryContext, geminiHistory, imagePayload);
            const finalMessages = [...updatedMessages, { type: 'ai', content: aiResponse, animate: true }];
            setMessages(finalMessages);
            setCredits(prev => Math.min(prev + 1, 50));
            
            // Auto-speak if enabled
            if (isAutoSpeak) {
                speakText(aiResponse, finalMessages.length - 1);
            }

            // Run cloud sync asynchronously so it doesn't block the UI loading state
            saveToCloud(sessionId, finalMessages).catch(console.error);
        } catch (error) {
            setMessages(prev => [...prev, { type: 'error', content: error.message }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="flex h-screen overflow-hidden bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-emerald-200 dark:selection:bg-cyan-500/30 transition-colors duration-300"
            style={{ 
                '--persona-color': persona === 'standard' ? '#10b981' : persona === 'code_master' ? '#3b82f6' : '#f59e0b',
                '--persona-glow': personaColors[persona].glow
            }}
        >
            
            {/* Fixed Overlay Sidebar */}
            <div className={`fixed z-40 inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition duration-300 ease-in-out shadow-2xl`}>
                <Sidebar 
                    history={history} 
                    loadSession={loadSession} 
                    handleNewChat={handleNewChat} 
                    currentSessionId={currentSessionId} 
                    deleteSession={deleteSession} 
                    credits={credits} 
                />
            </div>

            {/* Click outside to close sidebar overlay on smaller screens or just let user click hamburger */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-30 transition-opacity backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main view container */}
            <div className={`flex-1 flex flex-col h-full relative transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
                
                {/* Top Nav Header - Gemini Style */}
                <div className="sticky top-0 z-20 h-16 w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl border-b border-gray-200 dark:border-gray-900 flex items-center justify-between px-4 sm:px-6 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)} 
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-300 transition-all focus:outline-none sidebar-trigger"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-2 lg:gap-3 text-emerald-600 dark:text-cyan-400 font-bold text-xl drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
                            <img src={ZylronLogo} alt="Zylron AI Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-md object-cover mr-1" />
                            Zylron AI
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 relative persona-selector" ref={personaRef}>
                        <button 
                            onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all text-sm font-medium`}
                            style={{ borderColor: `var(--persona-color)` }}
                        >
                            {persona === 'standard' && <><Sparkles size={16} className="text-emerald-500" /> <span className="hidden sm:inline">Standard</span></>}
                            {persona === 'code_master' && <><Code size={16} className="text-blue-500" /> <span className="hidden sm:inline">Code Master</span></>}
                            {persona === 'sarcastic_genius' && <><Zap size={16} className="text-amber-500" /> <span className="hidden sm:inline">Sarcastic Genius</span></>}
                            {persona === 'code_architect' && <><ShieldCheck size={16} className="text-purple-500" /> <span className="hidden sm:inline">Architect</span></>}
                            {persona === 'academic_tutor' && <><GraduationCap size={16} className="text-rose-500" /> <span className="hidden sm:inline">Tutor</span></>}
                            {persona === 'tech_interviewer' && <><Briefcase size={16} className="text-slate-500" /> <span className="hidden sm:inline">Interviewer</span></>}
                            <ChevronDown size={14} className={`transition-transform duration-300 ${personaDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {personaDropdownOpen && (
                            <div className="absolute top-12 left-0 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                {[
                                    { id: 'standard', name: 'Standard AI', icon: Sparkles, color: 'text-emerald-600 dark:text-cyan-400' },
                                    { id: 'code_master', name: 'Code Master', icon: Code, color: 'text-blue-600 dark:text-blue-400' },
                                    { id: 'sarcastic_genius', name: 'Sarcastic Genius', icon: Zap, color: 'text-amber-600 dark:text-amber-400' },
                                    { id: 'code_architect', name: 'Code Architect', icon: ShieldCheck, color: 'text-purple-600 dark:text-purple-400' },
                                    { id: 'academic_tutor', name: 'Academic Tutor', icon: GraduationCap, color: 'text-rose-600 dark:text-rose-400' },
                                    { id: 'tech_interviewer', name: 'Tech Interviewer', icon: Briefcase, color: 'text-slate-600 dark:text-slate-400' },
                                ].map((p) => (
                                    <button 
                                        key={p.id}
                                        onClick={() => handlePersonaChange(p.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${persona === p.id ? `${p.color} font-semibold` : 'text-gray-700 dark:text-gray-300'}`}
                                    >
                                        <p.icon size={16} /> {p.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button 
                            onClick={() => setIsSenseActive(!isSenseActive)}
                            className={`p-2 rounded-full transition-all focus:outline-none sense-toggle ${isSenseActive ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'}`}
                            title="Toggle Zylron Sense"
                        >
                            <Eye size={20} />
                        </button>

                        <button 
                            onClick={() => setIsAutoSpeak(!isAutoSpeak)}
                            className={`p-2 rounded-full transition-all focus:outline-none ${isAutoSpeak ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'}`}
                            title="Toggle Auto-Speak (TTS)"
                        >
                            <Headphones size={20} />
                        </button>

                        <button 
                            onClick={handleShareChat}
                            disabled={messages.length === 0}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Share Conversation"
                        >
                            <Share2 size={20} />
                        </button>

                        <button 
                            onClick={exportToPDF}
                            disabled={messages.length === 0}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Download PDF Report"
                        >
                            <FileDown size={20} />
                        </button>

                        <button 
                            onClick={() => setIsTourActive(true)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none"
                            title="Start Guided Tour"
                        >
                            <HelpCircle size={20} />
                        </button>

                        <button 
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none hidden sm:flex"
                            title="Open Settings"
                        >
                            <Settings size={20} />
                        </button>

                        <button 
                            onClick={exportToMarkdown}
                            disabled={messages.length === 0}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Export to Markdown"
                        >
                            <Download size={20} />
                        </button>

                        <button 
                            onClick={toggleTheme} 
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-all focus:outline-none"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)} 
                            className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-black border border-emerald-300 dark:border-cyan-500/50 flex items-center justify-center font-bold text-emerald-700 dark:text-cyan-400 shadow-sm dark:shadow-[0_0_8px_rgba(0,255,255,0.3)] transition-all hover:scale-105 focus:outline-none"
                        >
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </button>
                        
                        {/* Profile Dropdown */}
                        {dropdownOpen && (
                            <div className="absolute top-12 right-0 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden py-2 focus:outline-none transition-all z-50">
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
                                </div>
                                <button onClick={() => { setDropdownOpen(false); setIsProfileModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><User size={16} /> Profile</button>
                                <button onClick={() => { setDropdownOpen(false); setIsSettingsModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Settings size={16} /> Settings</button>
                                <button onClick={() => { setDropdownOpen(false); navigate('/privacy-policy'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Shield size={16} /> Privacy Policy</button>
                                <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><LogOut size={16} /> Sign Out</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div {...getRootProps()} ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
                    <input {...getInputProps()} />
                    
                    {/* Drag and Drop Overlay */}
                    {isDragActive && (
                        <div className="absolute inset-0 z-50 bg-emerald-500/10 dark:bg-cyan-500/10 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-emerald-500 dark:border-cyan-400 rounded-3xl m-4 pointer-events-none animate-in fade-in duration-300">
                            <UploadCloud size={64} className="text-emerald-600 dark:text-cyan-400 mb-4 animate-bounce" />
                            <h2 className="text-2xl font-bold text-emerald-700 dark:text-cyan-300">Drop your PDF here</h2>
                            <p className="text-emerald-600 dark:text-cyan-400 opacity-80">Zylron will read and analyze its content</p>
                        </div>
                    )}

                    {messages.length === 0 ? (
                        /* Empty Welcoming State (Gemini Style) */
                        <div className="h-full flex flex-col items-center justify-center p-8 -mt-10 animate-fade-in">
                            <div className="w-16 h-16 rounded-3xl bg-white dark:bg-black border border-emerald-200 dark:border-cyan-500/30 flex items-center justify-center mb-6 shadow-lg dark:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all duration-300 hover:scale-105 overflow-hidden">
                                <img src={ZylronLogo} alt="Zylron AI Logo" className="w-full h-full object-cover" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-800 dark:from-cyan-400 dark:to-blue-500 mb-3 text-center transition-all duration-300">
                                Hello, {user?.name?.split(' ')[0] || 'there'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md text-lg">
                                How can I help you today? {activePdf ? `I've analyzed ${activePdf.name}. Ask me anything about it!` : "Ask me any question, upload a PDF, or just chat."}
                            </p>
                        </div>
                    ) : (
                        /* Active Chat Log */
                        <div className="space-y-6 pb-20">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} ${msg.isSystem ? 'justify-center my-6' : ''}`}>
                                    {msg.isSystem ? (
                                        <div className="flex items-center gap-4 w-full max-w-xl">
                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                                {msg.content.replace(/\*/g, '')}
                                            </span>
                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                                        </div>
                                    ) : (
                                        <div className={`w-full max-w-[95%] md:max-w-[85%] lg:max-w-5xl xl:max-w-6xl flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div 
                                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 overflow-hidden ${msg.type === 'user' ? 'bg-emerald-100 dark:bg-black border border-emerald-300 dark:border-cyan-500/80 shadow-sm dark:shadow-[0_0_15px_rgba(0,255,255,0.4)]' : msg.type === 'error' ? 'bg-red-100 dark:bg-red-600' : 'bg-gray-100 dark:bg-black border border-gray-300 dark:border-cyan-500/30 shadow-sm dark:shadow-[0_0_10px_rgba(0,255,255,0.2)]'}`}
                                                style={msg.type === 'ai' ? { borderColor: 'var(--persona-color)', boxShadow: `0 0 15px var(--persona-glow)` } : {}}
                                            >
                                                {msg.type === 'user' ? <User size={20} className="text-emerald-700 dark:text-cyan-400 dark:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" /> : <img src={ZylronLogo} alt="Zylron AI" className="h-8 w-8 rounded-full object-cover" />}
                                            </div>

                                            <div className={`px-5 py-4 rounded-3xl overflow-hidden transition-all duration-300 relative group/msg ${msg.type === 'user'
                                                ? 'bg-emerald-50 dark:bg-black border border-gray-200 dark:border-cyan-500/60 text-black dark:text-white rounded-tr-sm shadow-sm dark:shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                                                : msg.type === 'error'
                                                    ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 shadow-sm dark:shadow-[0_0_15px_rgba(239,68,68,0.2)] rounded-tl-sm'
                                                    : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-black dark:text-white rounded-tl-sm shadow-sm dark:shadow-lg'
                                                }`}
                                                style={msg.type === 'ai' ? { borderLeftColor: 'var(--persona-color)', borderLeftWidth: '4px' } : {}}
                                            >
                                                {msg.type === 'user' ? (
                                                    <div className="flex flex-col gap-3">
                                                        {msg.imageUrl && (
                                                            <div className="relative max-w-sm rounded-xl overflow-hidden border border-gray-200 dark:border-cyan-500/30 shadow-md">
                                                                <img src={msg.imageUrl} alt="Uploaded content" className="w-full h-auto object-cover max-h-[300px]" />
                                                            </div>
                                                        )}
                                                        <p className="whitespace-pre-wrap leading-relaxed">
                                                            {msg.content}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed prose-p:leading-relaxed prose-a:text-emerald-600 dark:prose-a:text-cyan-400 drop-shadow-none dark:drop-shadow-sm">
                                                            <TypewriterMarkdown text={msg.content} animate={msg.animate} />
                                                        </div>

                                                        {/* Action Bar (Feedback, Copy, TTS) */}
                                                        <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between opacity-40 group-hover/msg:opacity-100 transition-all">
                                                            <div className="flex items-center gap-1">
                                                                <button 
                                                                    onClick={() => handleFeedback(idx, 'up')}
                                                                    className={`p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all ${msg.feedback === 'up' ? 'text-emerald-500 dark:text-cyan-400' : 'text-gray-400'}`}
                                                                    title="Good response"
                                                                >
                                                                    <ThumbsUp size={14} fill={msg.feedback === 'up' ? 'currentColor' : 'none'} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleFeedback(idx, 'down')}
                                                                    className={`p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all ${msg.feedback === 'down' ? 'text-red-500 dark:text-red-400' : 'text-gray-400'}`}
                                                                    title="Bad response"
                                                                >
                                                                    <ThumbsDown size={14} fill={msg.feedback === 'down' ? 'currentColor' : 'none'} />
                                                                </button>
                                                                {detectWebCode(msg.content) && (
                                                                    <button 
                                                                        onClick={() => handleCodePreview(msg.content)}
                                                                        className="ml-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 dark:bg-cyan-500/10 text-emerald-600 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-all"
                                                                    >
                                                                        <Play size={12} /> Live Preview
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <button 
                                                                    onClick={() => copyToClipboard(msg.content, idx)}
                                                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-wider ${copiedIndex === idx ? 'text-emerald-500 dark:text-cyan-400' : 'text-gray-400'}`}
                                                                >
                                                                    {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                                                                    {copiedIndex === idx ? 'Copied' : 'Copy'}
                                                                </button>
                                                                <button 
                                                                    onClick={() => speakText(msg.content, idx)}
                                                                    className={`p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all ${isSpeakingIndex === idx ? 'text-emerald-500 dark:text-cyan-400 animate-pulse' : 'text-gray-400'}`}
                                                                    title="Read Aloud"
                                                                >
                                                                    {isSpeakingIndex === idx ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[85%] md:max-w-3xl flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-cyan-500/30 flex items-center justify-center shrink-0 shadow-sm dark:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all duration-300 overflow-hidden">
                                            <img src={ZylronLogo} alt="Zylron AI" className="h-8 w-8 rounded-full object-cover animate-pulse" />
                                        </div>
                                        <div className="px-5 py-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm flex items-center gap-2 shadow-sm dark:shadow-lg">
                                            <div className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-cyan-500 dark:shadow-[0_0_8px_rgba(0,255,255,0.8)]"></div>
                                            <div className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-cyan-500 dark:shadow-[0_0_8px_rgba(0,255,255,0.8)]"></div>
                                            <div className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-cyan-500 dark:shadow-[0_0_8px_rgba(0,255,255,0.8)]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Glassmorphism Input Area */}
                <div className="p-4 bg-transparent relative z-10 w-full mb-2">
                    <div className="max-w-4xl mx-auto flex flex-col gap-3">
                        
                        {/* Status / Active File Banners */}
                        <div className="flex flex-wrap gap-2 px-1">
                            {isProcessingDoc && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold animate-pulse shadow-sm shadow-emerald-500/10">
                                    <Loader2 size={12} className="animate-spin" />
                                    <span>Zylron is processing your file...</span>
                                </div>
                            )}
                            {activePdf && !isProcessingDoc && (
                                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-emerald-500/30 dark:border-cyan-500/30 text-emerald-600 dark:text-cyan-400 text-xs font-bold shadow-md animate-in slide-in-from-bottom-2 duration-300">
                                    <FileText size={14} className="text-emerald-500 dark:text-cyan-400" />
                                    <span className="truncate max-w-[150px]">{activePdf.name}</span>
                                    <button onClick={removePdf} className="hover:text-red-500 transition-colors bg-white dark:bg-black rounded-full p-0.5 ml-1">
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                            {activeImage && !isProcessingDoc && (
                                <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-emerald-500/30 dark:border-cyan-500/30 shadow-md animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                                        <img src={activeImage.url} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col pr-1">
                                        <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Image Ready</span>
                                        <span className="text-[11px] text-emerald-600 dark:text-cyan-400 font-bold truncate max-w-[100px]">{activeImage.name}</span>
                                    </div>
                                    <button onClick={removeImage} className="hover:text-red-500 transition-colors bg-white dark:bg-black rounded-full p-0.5 self-start">
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Prompt Library */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                            {QUICK_PROMPTS.map((qp, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInput(qp.text)}
                                    className="whitespace-nowrap px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-cyan-900/20 hover:text-emerald-600 dark:hover:text-cyan-400 hover:border-emerald-300 dark:hover:border-cyan-500/50 transition-all duration-300 shadow-sm"
                                >
                                    {qp.label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={sendMessage} className="relative group flex items-end sm:items-center gap-2 sm:gap-3 flex-col sm:flex-row">
                            <div className="relative flex-1 flex items-center w-full bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-sm dark:shadow-[0_0_10px_rgba(0,255,255,0.1)] focus-within:shadow-md dark:focus-within:shadow-[0_0_20px_rgba(0,255,255,0.3)] focus-within:border-emerald-300 dark:focus-within:border-cyan-500/50 transition-all duration-300">
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-3 z-50 shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                        <EmojiPicker theme={theme === 'dark' ? 'dark' : 'light'} onEmojiClick={onEmojiClick} />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="pl-4 pr-2 text-gray-400 hover:text-emerald-500 dark:hover:text-cyan-400 transition-all duration-300 z-10 drop-shadow-none dark:hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)] focus:outline-none font-bold"
                                >
                                    <Smile size={24} />
                                </button>
                                
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={activePdf ? `Ask Zylron about ${activePdf.name}...` : activeImage ? "Describe this image..." : "Message Zylron..."}
                                    className="w-full bg-transparent text-gray-800 dark:text-gray-100 py-4 px-3 focus:outline-none placeholder:text-gray-500/70 text-base font-medium"
                                    disabled={isLoading || isProcessingDoc}
                                />
                                
                                <div className="flex items-center pr-2 gap-1 upload-area">
                                    <div className="relative" title="Upload Image">
                                        <div onClick={() => document.getElementById('image-upload').click()} className="p-2 cursor-pointer text-gray-400 hover:text-emerald-500 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 group/upload">
                                            <Camera size={24} className="group-hover/upload:scale-110 transition-transform" />
                                        </div>
                                        <input 
                                            id="image-upload" 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={(e) => onDrop(e.target.files)} 
                                        />
                                    </div>

                                    <div className="relative" title="Upload Document">
                                        <div onClick={() => document.getElementById('file-upload').click()} className="p-2 cursor-pointer text-gray-400 hover:text-emerald-500 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 group/upload">
                                            <UploadCloud size={24} className="group-hover/upload:scale-110 transition-transform" />
                                        </div>
                                        <input 
                                            id="file-upload" 
                                            type="file" 
                                            className="hidden" 
                                            accept=".pdf" 
                                            onChange={(e) => onDrop(e.target.files)} 
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={startListening}
                                        className={`p-2 rounded-full transition-all duration-300 focus:outline-none ${isListening ? 'text-red-500 dark:text-cyan-400 bg-red-50 dark:bg-cyan-400/10 animate-pulse shadow-sm dark:shadow-[0_0_20px_rgba(0,255,255,0.6)]' : 'text-gray-400 hover:text-emerald-500 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm dark:hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]'}`}
                                        title="Use Microphone"
                                    >
                                        <Mic size={24} className={isListening ? "drop-shadow-none dark:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" : ""} />
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || isProcessingDoc || (!input.trim() && !activePdf)}
                                className="p-4 rounded-2xl bg-emerald-600 dark:bg-black border border-emerald-500 dark:border-cyan-500/50 hover:bg-emerald-500 dark:hover:bg-cyan-950 text-white dark:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md dark:shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] flex-shrink-0 focus:outline-none w-full sm:w-auto flex justify-center"
                            >
                                {isLoading ? <Loader2 size={24} className="animate-spin text-white dark:text-cyan-400" /> : <Send size={24} className="drop-shadow-none dark:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />}
                            </button>
                        </form>
                    </div>
                    <p className="text-center text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-600 mt-4 font-bold opacity-60">Zylron AI may display inaccurate info, so double-check its responses.</p>
                </div>
            </div>

            {/* Zylron Sense HCI Component */}
            {isSenseActive && (
                <ZylronSense 
                    onSendTrigger={() => sendMessage({ preventDefault: () => {} })}
                    onClose={() => setIsSenseActive(false)}
                    scrollContainerRef={scrollContainerRef}
                />
            )}

            {/* Modals & Overlays */}
            <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            <SettingsModal 
                isOpen={isSettingsModalOpen} 
                onClose={() => setIsSettingsModalOpen(false)} 
                theme={theme} 
                toggleTheme={toggleTheme}
                isMemoryEnabled={isMemoryEnabled}
                toggleMemory={toggleMemory}
                tourClass="credits-tracker"
                credits={credits}
            />

            <CodePreviewModal 
                isOpen={isCodeModalOpen} 
                onClose={() => setIsCodeModalOpen(false)} 
                code={previewCode} 
            />

            <Joyride
                steps={TOUR_STEPS}
                run={isTourActive}
                continuous={true}
                showProgress={true}
                showSkipButton={true}
                onEvent={(data) => {
                    if (data.status === 'finished' || data.status === 'skipped') {
                        setIsTourActive(false);
                    }
                }}
                styles={{
                    options: {
                        primaryColor: theme === 'dark' ? '#06b6d4' : '#10b981',
                        backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
                        textColor: theme === 'dark' ? '#fff' : '#333',
                        arrowColor: theme === 'dark' ? '#0f172a' : '#fff',
                    },
                    tooltipContainer: {
                        textAlign: 'left',
                        borderRadius: '20px',
                        padding: '10px'
                    },
                    buttonNext: {
                        borderRadius: '12px',
                        padding: '10px 20px',
                        fontWeight: 'bold'
                    }
                }}
            />

            {/* Feedback Toast */}
            {feedbackToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-white/90 dark:bg-black/80 backdrop-blur-md border border-emerald-500/50 dark:border-cyan-500/50 px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3">
                    <Zap size={18} className="text-emerald-500 dark:text-cyan-400 animate-pulse" />
                    <span className="text-sm font-bold text-gray-800 dark:text-white">{feedbackToast}</span>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
