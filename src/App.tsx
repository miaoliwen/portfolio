/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageProvider } from "./lib/LanguageContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Experience from "./components/Experience";
import LeaveNote from "./components/LeaveNote";
import Footer from "./components/Footer";
import MusicPlayerPage from "./components/MusicPlayerPage";
import GamesPage from "./components/GamesPage";
import AttachmentTest from "./components/AttachmentTest";

type PageRoute = {
  path: string;
  element: React.ReactNode;
};

function getPathname() {
  if (typeof window === "undefined") return "/";
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-coral-500/20">
        <div className="app-grain" aria-hidden="true" />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

function NotFoundPage() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
      <div className="aurora-blob left-[-18%] top-[18%] h-[34rem] w-[34rem] bg-coral-500/10 dark:bg-coral-400/15" />
      <div className="surface-panel relative z-10 max-w-xl p-8 md:p-10">
        <p className="section-kicker">404</p>
        <h1 className="text-4xl font-normal tracking-[-0.96px] text-warm-800 md:text-5xl dark:text-warm-50">
          页面不存在
        </h1>
        <p className="mt-4 leading-relaxed text-warm-600 dark:text-warm-400">
          你访问的页面可能已移动或不存在。请返回首页继续浏览。
        </p>
        <a
          href="/"
          className="btn-primary-wpds mt-8 inline-flex rounded-full px-5 py-3 text-sm font-medium"
        >
          返回首页
        </a>
      </div>
    </section>
  );
}

export default function App() {
  const pathname = getPathname();

  const standaloneRoutes: PageRoute[] = [
    { path: "/player", element: <MusicPlayerPage /> },
    { path: "/games", element: <GamesPage /> },
    { path: "/test", element: <AttachmentTest /> },
  ];

  const standaloneRoute = standaloneRoutes.find((route) => route.path === pathname);
  if (standaloneRoute) {
    return standaloneRoute.element;
  }

  const pageRoutes: PageRoute[] = [
    { path: "/", element: <Hero /> },
    { path: "/about", element: <About /> },
    { path: "/projects", element: <Projects /> },
    { path: "/experience", element: <Experience /> },
    { path: "/leave-note", element: <LeaveNote /> },
  ];

  const pageRoute = pageRoutes.find((route) => route.path === pathname);

  return <PageLayout>{pageRoute?.element ?? <NotFoundPage />}</PageLayout>;
}
