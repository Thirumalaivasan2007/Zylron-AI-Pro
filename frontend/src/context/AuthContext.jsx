import { createContext, useState, useEffect, useContext } from 'react';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut, 
    sendSignInLinkToEmail, 
    isSignInWithEmailLink, 
    signInWithEmailLink 
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../config/firebase";
import Loader from '../components/Loader';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Enforce a minimum cinematic delay so the user can enjoy the epic Loader animation
        const minLoadTime = new Promise(resolve => setTimeout(resolve, 3500));
        let initialCheckDone = false;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Map Firebase user fields to match app expectations
                setUser({
                    uid: currentUser.uid,
                    name: currentUser.displayName,
                    email: currentUser.email,
                    photoURL: currentUser.photoURL,
                    token: currentUser.accessToken // For legacy axios calls if needed
                });
            } else {
                setUser(null);
            }
            
            if (!initialCheckDone) {
                initialCheckDone = true;
                await minLoadTime;
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const loginWithFacebook = async () => {
        try {
            const result = await signInWithPopup(auth, facebookProvider);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const loginWithEmail = async (email) => {
        const actionCodeSettings = {
            url: window.location.origin + '/login',
            handleCodeInApp: true,
        };
        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loginWithGoogle, 
            loginWithFacebook, 
            loginWithEmail, 
            logout, 
            loading 
        }}>
            {loading ? <Loader /> : children}
        </AuthContext.Provider>
    );
};
