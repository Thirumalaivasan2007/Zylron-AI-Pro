import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Draggable from 'react-draggable';
import { Loader2, ScanFace, X } from 'lucide-react';

const ZylronSense = ({ onSendTrigger, onClose, scrollContainerRef }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [model, setModel] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPinching, setIsPinching] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    
    // Refs for gesture state using timestamp debouncing and smoothing
    const stateRef = useRef({
        prevY: null,
        lastPinchTime: 0,
        feedbackUntil: 0
    });

    // 1. Initialize Camera & Model
    useEffect(() => {
        let stream = null;

        const setupCameraAndModel = async () => {
            try {
                await tf.ready();
                const loadedModel = await handpose.load();
                setModel(loadedModel);

                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240, facingMode: 'user' }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        setIsLoading(false);
                    };
                }
            } catch (error) {
                console.error("Error initializing Zylron Sense:", error);
                setIsLoading(false);
            }
        };

        setupCameraAndModel();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // 2. Detection Loop
    const detect = useCallback(async () => {
        if (!model || !videoRef.current || !canvasRef.current) return;
        if (videoRef.current.readyState !== 4) return;

        const video = videoRef.current;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        video.width = videoWidth;
        video.height = videoHeight;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const hand = await model.estimateHands(video);

        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, videoWidth, videoHeight);

        if (hand.length > 0) {
            const landmarks = hand[0].landmarks;
            const now = Date.now();
            const isSuccessFeedback = now < stateRef.current.feedbackUntil;
            
            // Draw Keypoints
            ctx.fillStyle = isSuccessFeedback ? '#22c55e' : '#06b6d4'; // Bright green on success, else cyan
            ctx.strokeStyle = isSuccessFeedback ? '#22c55e' : '#06b6d4';
            ctx.lineWidth = 2;

            for (let i = 0; i < landmarks.length; i++) {
                const [x, y] = landmarks[i];
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 3 * Math.PI);
                ctx.fill();
            }

            // --- GESTURE LOGIC ---

            // A) SCROLLING (Using Palm Base - index 0)
            const [palmX, palmY] = landmarks[0];
            const prevY = stateRef.current.prevY;
            
            if (prevY !== null) {
                // Anti-Jitter: Exponential Moving Average (EMA) smoothing
                const smoothedY = (palmY * 0.3) + (prevY * 0.7);
                const deltaY = smoothedY - prevY;
                
                // Deadzone to prevent natural hand shaking from scrolling
                if (Math.abs(deltaY) > 2.0) {
                    const scrollMultiplier = 3.5;
                    if (scrollContainerRef && scrollContainerRef.current) {
                        scrollContainerRef.current.scrollBy(0, deltaY * scrollMultiplier);
                    } else {
                        window.scrollBy(0, deltaY * scrollMultiplier);
                    }
                }
                stateRef.current.prevY = smoothedY;
            } else {
                stateRef.current.prevY = palmY;
            }

            // B) PINCH TO SEND (Thumb tip = 4, Index tip = 8)
            const [thumbX, thumbY] = landmarks[4];
            const [indexX, indexY] = landmarks[8];
            
            const distance = Math.sqrt(Math.pow(thumbX - indexX, 2) + Math.pow(thumbY - indexY, 2));
            
            if (distance < 45) { // Increased threshold from 25 to 45 for easier clicking
                setIsPinching(true);
                
                // Strict 1.5s Cooldown to prevent double-firing
                if (now - stateRef.current.lastPinchTime > 1500) { 
                    if (onSendTrigger) onSendTrigger();
                    
                    stateRef.current.lastPinchTime = now;
                    stateRef.current.feedbackUntil = now + 500; // Keep haptic color for 500ms
                    
                    setFeedbackMessage("Message Sent!");
                    setTimeout(() => setFeedbackMessage(null), 1500);
                }
                
                // Draw inner pinch circle
                ctx.beginPath();
                ctx.arc((thumbX + indexX)/2, (thumbY + indexY)/2, 10, 0, 2 * Math.PI);
                ctx.fillStyle = isSuccessFeedback ? '#4ade80' : '#10b981'; 
                ctx.fill();
            } else {
                setIsPinching(false);
            }
        } else {
            // Hand lost
            stateRef.current.prevY = null;
            setIsPinching(false);
        }

        requestAnimationFrame(detect);
    }, [model, onSendTrigger, scrollContainerRef]);

    useEffect(() => {
        if (!isLoading) {
            detect();
        }
    }, [isLoading, detect]);

    return (
        <Draggable bounds="parent" handle=".drag-handle">
            <div className="fixed bottom-6 right-6 w-64 md:w-80 z-50 rounded-2xl overflow-hidden backdrop-blur-xl bg-black/40 border border-cyan-500/30 shadow-[0_0_25px_rgba(0,255,255,0.15)] flex flex-col transform transition-all hover:border-cyan-400/60">
                
                <div className="drag-handle cursor-move bg-black/60 px-4 py-2 flex items-center justify-between border-b border-cyan-500/20">
                    <div className="flex items-center gap-2">
                        <ScanFace size={16} className="text-cyan-400" />
                        <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">Zylron Sense</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-400 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                    {isLoading && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0f172a]/90 backdrop-blur-sm">
                            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                            <p className="text-xs font-mono text-cyan-400 animate-pulse uppercase tracking-widest text-center px-4">Initializing Model...</p>
                        </div>
                    )}
                    
                    <video 
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                    />
                    
                    <canvas 
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-10 pointer-events-none"
                    />

                    {/* Temporary Haptic Feedback Overlay */}
                    {feedbackMessage && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-green-500/80 backdrop-blur-md text-white font-bold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-in zoom-in duration-200">
                            {feedbackMessage}
                        </div>
                    )}

                    {isPinching && !feedbackMessage && (
                        <div className="absolute inset-0 z-30 pointer-events-none border-4 border-emerald-500 transition-colors shadow-[inset_0_0_20px_rgba(16,185,129,0.5)]"></div>
                    )}
                </div>
                
                <div className="bg-black/60 p-2 text-[10px] text-center text-gray-400 font-mono">
                    Open palm to scroll • Pinch fingers to Send
                </div>
            </div>
        </Draggable>
    );
};

export default ZylronSense;
