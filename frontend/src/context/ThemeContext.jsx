import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Try to get theme from localStorage, default to 'light' if not found
        return localStorage.getItem('theme') || 'light'
    });
    const [colorTheme, setColorTheme] = useState(localStorage.getItem("colorTheme") || "default");

    useEffect(() => {
        // Update localStorage when theme changes
        localStorage.setItem('theme', theme);
        
        // Update document class for tailwind dark mode
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        if (colorTheme === "default") {
            delete document.documentElement.dataset.colorTheme;
        } else {
            document.documentElement.dataset.colorTheme = colorTheme;
        }
        localStorage.setItem("colorTheme", colorTheme);
    }, [colorTheme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colorTheme, setColorTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeContextProvider");
    }
    return context;
};