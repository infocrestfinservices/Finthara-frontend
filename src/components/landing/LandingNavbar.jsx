import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { LogOut, Menu, X, ArrowRight, User as UserIcon } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "How it works", to: "/how-it-works" },
  { label: "Pricing", to: "/pricing" },
];

export default function LandingNavbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <>
    {/* Profile now lives in the pill nav above (with Home/Features/…), so the floating
        left-edge rail that used to duplicate it here has been removed. */}
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-border shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-2 min-h-24 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0">
          <Logo size="xl" />
        </Link>

        {/* Center nav — absolutely centered on the header, independent of the logo/actions widths on either side */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-1.5 rounded-full border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                isActive(link.to)
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-primary border-primary/20 hover:bg-primary/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {/* Its own pill like every other item — that's the one place logged-in users
              look for it. */}
          {user && (
            <Link
              to="/profile"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                isActive("/profile")
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-primary border-primary/20 hover:bg-primary/10"
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" /> Profile
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/create" className="hidden sm:block">
                <Button size="sm" className="h-9 px-4 gap-1.5">
                  New report <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hidden sm:inline-flex text-muted-foreground"
                onClick={() => logout("/login")}
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-9 px-4">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="h-9 px-4 gap-1.5 shadow-md shadow-primary/20">
                  Create free report <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden border-t border-border glass transition-[max-height] duration-300 ${
          open ? "max-h-[560px]" : "max-h-0 border-transparent"
        }`}
      >
        <nav className="px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive(link.to)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* My Reports/Account/Admin are tabs inside the Profile page itself now (see
              Profile.jsx) rather than separate links — one entry point, like SideKeys. */}
          {user && (
            <Link
              to="/profile"
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive("/profile") ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <UserIcon className="w-4 h-4" /> Profile
            </Link>
          )}

          <div className="flex gap-2 pt-2">
            {user ? (
              <>
                <Link to="/create" className="flex-1">
                  <Button className="w-full gap-1.5">
                    New report <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => logout("/login")}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button className="w-full gap-1.5">
                    Create report <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
    </>
  );
}
