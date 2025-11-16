import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTopButton({ showAfter = 300 }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;

            // Show only after scrolling down a certain amount
            if (y > showAfter) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [showAfter]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`
                fixed bottom-6 right-6 p-3 rounded-full shadow-lg 
                bg-primary text-white 
                transition-all duration-300 
                ${visible ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}
            `}
        >
            <ArrowUp size={20} />
        </button>
    );
}
