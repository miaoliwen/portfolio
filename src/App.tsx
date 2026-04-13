/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import { LanguageProvider } from "./lib/LanguageContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Experience from "./components/Experience";

import Footer from "./components/Footer";

export default function App() {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
        <Navbar />
        <main>
          <Hero />
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <About />
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <Projects />
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <Experience />
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
