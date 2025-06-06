import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // wait for layout
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" }); // or behavior: "auto"
    }, 0);
  }, [pathname]);

  return children;
}

export default ScrollToTop;
