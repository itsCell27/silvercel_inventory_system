import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { data } from "react-router-dom";
import { toast } from "sonner";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined);
    const [loading, setLoading] = useState(true);

    // login
    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            })
            if (error) {
                console.error("Error logging in:", error);
                toast.error("Error logging in:", error.message);
                return {success: false, error: error.message}
            }

            console.log("Logged in successfully:", data);
            toast.success("Logged in successfully");
            return {success: true, data: data} // remove data on production

        } catch (error) {
            console.error("Error logging in:", error);
            toast.error("Error logging in:", error.message);
        }
    }

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription?.unsubscribe();
    }, []);

    // logout
    const logout = async () => {
        const { error } = supabase.auth.signOut();
        if (error) {
            console.error("Error logging out:", error);
            toast.error("Error logging out:", error.message);
        } else {
            console.log("Logged out successfully");
            toast.success("Logged out successfully");
        }
    }

    return (
        <AuthContext.Provider value={{ session, logout, login, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext);
}
