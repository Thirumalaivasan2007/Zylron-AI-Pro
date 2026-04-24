import { collection, doc, setDoc, getDocs, query, where, orderBy, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const CHATS_COLLECTION = 'chats';

export const saveChatToCloud = async (userId, sessionId, chatTitle, messages) => {
    if (!userId) return;
    try {
        const chatRef = doc(db, CHATS_COLLECTION, sessionId);
        
        const payload = {
            userId,
            sessionId,
            message: chatTitle,
            messages: messages,
            updatedAt: serverTimestamp()
        };

        // Only set createdAt for the first time
        if (messages.length <= 2) {
            payload.createdAt = serverTimestamp();
        }

        await setDoc(chatRef, payload, { merge: true });
    } catch (error) {
        console.error("Error saving chat to cloud:", error);
    }
};

export const saveFeedbackToCloud = async (sessionId, messages) => {
    if (!sessionId) return;
    try {
        const chatRef = doc(db, CHATS_COLLECTION, sessionId);
        await updateDoc(chatRef, {
            messages: messages,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving feedback to cloud:", error);
    }
};

export const fetchCloudChats = async (userId) => {
    if (!userId) return [];
    try {
        const q = query(
            collection(db, CHATS_COLLECTION), 
            where("userId", "==", userId)
            // Note: To use orderBy with where, Firebase requires a composite index.
            // For now, we will sort them on the client side to prevent index errors for the user.
        );
        const querySnapshot = await getDocs(q);
        const chats = [];
        querySnapshot.forEach((doc) => {
            chats.push(doc.data());
        });
        
        // Sort descending by time
        return chats.sort((a, b) => {
            const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
            const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
            return timeB - timeA;
        });
    } catch (error) {
        console.error("Error fetching chats from cloud:", error);
        return [];
    }
};

export const deleteCloudChat = async (sessionId) => {
    try {
        await deleteDoc(doc(db, CHATS_COLLECTION, sessionId));
    } catch (error) {
        console.error("Error deleting cloud chat:", error);
    }
};

// Public Chat Sharing - Optimized for Speed
export const createPublicShare = async (messages, persona) => {
    try {
        // Payload Trimming: Remove non-essential UI state to speed up upload
        const trimmedMessages = messages.map(m => ({
            type: m.type,
            content: m.content,
            imageUrl: m.imageUrl || null,
            isSystem: m.isSystem || false
        }));

        const publicId = Math.random().toString(36).substring(2, 10);
        const shareRef = doc(db, 'public_shares', publicId);
        
        // Fast Write
        await setDoc(shareRef, {
            messages: trimmedMessages,
            persona,
            createdAt: serverTimestamp()
        });
        
        return publicId;
    } catch (error) {
        console.error("Error creating public share:", error);
        return null;
    }
};

// Instant Share Background Sync
export const createPublicShareWithId = async (publicId, messages, persona) => {
    try {
        const shareRef = doc(db, 'public_shares', publicId);
        await setDoc(shareRef, {
            messages,
            persona,
            createdAt: serverTimestamp()
        });
        return publicId;
    } catch (error) {
        console.error("Error in background share sync:", error);
        return null;
    }
};

export const fetchPublicChat = async (publicId) => {
    try {
        const shareRef = doc(db, 'public_shares', publicId);
        const docSnap = await getDocs(query(collection(db, 'public_shares'), where("__name__", "==", publicId)));
        if (!docSnap.empty) {
            return docSnap.docs[0].data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching public chat:", error);
        return null;
    }
};
