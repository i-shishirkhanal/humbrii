import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // Immediate scroll
        window.scrollTo(0, 0);

        // Timeout to handle potential render delays or layout shifts
        const timeoutId = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [pathname, search]);

    return null;
};

export default ScrollToTop;
