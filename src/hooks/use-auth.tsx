
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signUp: (email: string, pass: string) => Promise<any>;
    signIn: (email: string, pass: string) => Promise<any>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsAdmin(user?.email === 'astrydeapp@gmail.com');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signUp = (email: string, pass: string) => {
        return createUserWithEmailAndPassword(auth, email, pass);
    }
    
    const signIn = (email: string, pass: string) => {
        return signInWithEmailAndPassword(auth, email, pass);
    }

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setIsAdmin(false);
    }

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// A wrapper for layout to provide auth context
export function AuthLayout({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}
