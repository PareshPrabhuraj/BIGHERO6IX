import { useEffect } from "react";
import Lenis from "lenis";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Timeline from "./components/Timeline";
import HardwareBento from "./components/HardwareBento";
import PIDLab from "./components/PIDLab";
import CodeStudio from "./components/CodeStudio";
import Competition from "./components/Competition";
import Footage from "./components/Footage";
import PosterSection from "./components/PosterSection";
import Team from "./components/Team";
import Footer from "./components/Footer";
import { Toaster } from "./components/ui/sonner";

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -76, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth" });
};

function App() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, autoRaf: true });
    window.__lenis = lenis;
    return () => lenis.destroy();
  }, []);

  return (
    <div className="bg-carbon text-cream antialiased">
      <ErrorBoundary>
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <Timeline />
          <HardwareBento />
          <PIDLab />
          <CodeStudio />
          <Competition />
          <Footage />
          <PosterSection />
          <Team />
        </main>
        <Footer />
      </ErrorBoundary>
      <Toaster position="bottom-right" theme="dark" richColors />
    </div>
  );
}

export default App;
