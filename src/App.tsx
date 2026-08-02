import { useState, useRef, useEffect, useCallback } from "react";
import { ShoppingCart, Truck, HelpCircle, UserPlus, FileText, FlaskConical } from "lucide-react";
import { ProductCatalog } from "./components/ProductCatalog";
import { CartPanel } from "./components/CartPanel";
import { HeroSection } from "./components/HeroSection";
import { FaqPage } from "./components/FaqPage";
import { MemberSignupForm } from "./components/MemberSignupForm";
import { OrderOptimizer } from "./components/OrderOptimizer";
import { CoaLibrary } from "./components/CoaLibrary";
import { AgeGate, useAgeVerified } from "./components/AgeGate";
import { useCart } from "./lib/cart";
import { useAuth } from "./lib/auth";

type Page = "home" | "faq" | "signup" | "optimizer" | "coa-library";

function getInitialPage(): Page {
  if (window.location.pathname === "/optimizer") return "optimizer";
  if (window.location.pathname === "/coa-library") return "coa-library";
  return "home";
}

function OptimizerGate({ onBack }: { onBack: () => void }) {
  const { session, signIn, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!ready) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><span className="text-slate-400">Loading...</span></div>;

  if (session) {
    return <OrderOptimizer onBack={onBack} />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (!result.ok) setError(result.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Order Optimizer</h2>
        <p className="text-sm text-slate-500 mb-6">Sign in to access the order builder.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <button onClick={onBack} className="mt-4 text-sm text-slate-500 hover:text-slate-700 w-full text-center">
          Back to store
        </button>
      </div>
    </div>
  );
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [page, setPageRaw] = useState<Page>(getInitialPage);
  const cart = useCart();
  const catalogRef = useRef<HTMLDivElement>(null);
  const { verified, confirm: confirmAge } = useAgeVerified();

  const PAGE_PATHS: Record<Page, string> = { home: "/", faq: "/", signup: "/", optimizer: "/optimizer", "coa-library": "/coa-library" };
  const PAGE_TITLES: Record<Page, string> = { home: "Stateside Peptide Supply", faq: "Stateside Peptide Supply", signup: "Stateside Peptide Supply", optimizer: "Order Optimizer | Stateside Peptide Supply", "coa-library": "COA Library | Stateside Peptide Supply" };

  const setPage = useCallback((p: Page) => {
    setPageRaw(p);
    const path = PAGE_PATHS[p] || "/";
    if (window.location.pathname !== path) window.history.pushState(null, "", path);
    document.title = PAGE_TITLES[p] || "Stateside Peptide Supply";
  }, []);

  useEffect(() => {
    const onPop = () => setPageRaw(getInitialPage());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (!verified) {
    return <AgeGate onConfirm={confirmAge} />;
  }

  const scrollToCatalog = () => {
    setPage("home");
    setTimeout(() => {
      catalogRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e1a] overflow-x-hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6 h-14 border-b border-slate-700/50 bg-[#0d1220]/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setPage("home")} className="flex items-center gap-3">
            <img
              src="/spstranPSai copy copy.png"
              alt="Stateside Peptide Supply"
              className="h-20 w-auto -my-3 translate-y-[7px]"
            />
            <img
              src="/spsbottom.png"
              alt="Stateside Peptide Supply"
              className="h-10 w-auto"
            />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-lg">
              <Truck className="w-3.5 h-3.5" />
              <span className="inline-flex items-center gap-1">Flat $25 shipping | <img src="https://flagcdn.com/w20/us.png" alt="US" className="inline h-3 w-auto" /> Fulfillment</span>
            </div>
          </div>



          <button
            onClick={() => setPage("signup")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
              page === "signup"
                ? "text-purple-300 bg-purple-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Apply</span>
          </button>

          <button
            onClick={() => setPage("coa-library")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
              page === "coa-library"
                ? "text-emerald-300 bg-emerald-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span className="hidden sm:inline">COA Library</span>
          </button>

          <button
            onClick={() => setPage("faq")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
              page === "faq"
                ? "text-purple-300 bg-purple-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">FAQ</span>
          </button>

          <button
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-500 transition-all hover:shadow-lg hover:shadow-purple-600/20"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Order</span>
            {cart.count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0d1220]">
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Page content */}
      {page === "home" && (
        <>
          <HeroSection onBrowse={scrollToCatalog} onApply={() => setPage("signup")} />
          <main ref={catalogRef} className="flex-1">
            <ProductCatalog />
          </main>
        </>
      )}

      {page === "faq" && <FaqPage />}

      {page === "signup" && <MemberSignupForm onBack={() => setPage("home")} />}

      {page === "optimizer" && <OptimizerGate onBack={() => setPage("home")} />}

      {page === "coa-library" && <CoaLibrary />}

      {/* Floating cart button */}
      {cart.count > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 bg-purple-600 text-white text-sm font-semibold rounded-full shadow-xl shadow-purple-900/40 hover:bg-purple-500 hover:scale-105 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{cart.count} {cart.count === 1 ? 'item' : 'items'}</span>
          <span className="w-px h-4 bg-purple-400/40" />
          <span>${cart.subtotal.toFixed(2)}</span>
        </button>
      )}

      {/* Cart slide-over */}
      <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

export default App;
