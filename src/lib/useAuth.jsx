import React, { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "./createClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {

        const fetchUser = async () => {
            try {
                const { data: { session }, } = await supabase.auth.getSession();
                // console.log('session', session.user.user_metadata);
                setUser(session.user ?? null);
            } catch (error) {
                console.error('Error fetching user:', error.message);

            }
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event,
            session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };

    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    )};

export const useAuth = () => useContext(AuthContext);