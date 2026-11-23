import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquareText } from "lucide-react";
import Logo from "@/components/Logo";
import FeedbackForm from "@/components/FeedbackForm";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

// Official LinkedIn brand mark (blue rounded square, white "in").
function LinkedInLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <rect x="4.6" y="9.5" width="2.5" height="9.5" fill="#fff" />
      <circle cx="5.85" cy="6.95" r="1.45" fill="#fff" />
      <path
        fill="#fff"
        d="M10.7 9.5h2.4v1.3h.04c.39-.74 1.34-1.52 2.76-1.52 2.95 0 3.5 1.94 3.5 4.47V19h-2.5v-4.6c0-1.1-.02-2.52-1.53-2.52-1.53 0-1.77 1.2-1.77 2.44V19h-2.5z"
      />
    </svg>
  );
}

// Shown at the right of the footer's bottom bar. Add further profiles here as they go live.
const SOCIAL = [
  { label: "Finthara on LinkedIn", href: "https://www.linkedin.com/company/finthara/", Icon: LinkedInLogo },
];

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/features" },
      { label: "Pricing", to: "/pricing" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "Create Report", to: "/create" },
      { label: "Blogs", to: "/blog" },
    ],
  },
  {
    title: "Formats",
    links: [
      { label: "CMA Data", to: "/create" },
      { label: "Feasibility Study", to: "/create?purpose=feasibility_study" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "My Reports", to: "/dashboard" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Contact", to: "/contact" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Renewal & Cancellation", to: "/renewal-policy" },
    ],
  },
];

export default function LandingFooter() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  // The "dark" class here scopes just this subtree to the dark palette in index.css
  // (its `.dark { --background: ...; }` overrides apply to ANY element carrying the
  // class, not only <html>) — so the footer band is always the dark theme, independent
  // of whatever light/dark mode the rest of the page is currently in. Every color below
  // still comes from the same bg-background/text-foreground/border tokens everything
  // else uses, so it stays one design system rather than a one-off hardcoded palette.
  return (
    <footer className="dark border-t border-border bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link to="/" className="inline-flex mb-4">
              <Logo size="xl" onDark />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              AI-powered feasibility studies and project reports — bank, scheme, and investor-ready
              in minutes, for Indian and global entrepreneurs.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold mb-3">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.comingSoon ? (
                      // Only bank loan / CMA is live today — the rest are listed but not linked.
                      <span className="text-sm text-muted-foreground inline-flex items-center gap-2 whitespace-nowrap">
                        {l.label}
                        <span className="text-[10px] font-medium rounded-full border border-blue-400/40 bg-blue-500/10 text-blue-400 px-2 py-0.5">
                          Coming Soon
                        </span>
                      </span>
                    ) : (
                      <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Infocrest Finweb Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a
              href="/feedback"
              onClick={(e) => { e.preventDefault(); setFeedbackOpen(true); }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 hover:text-foreground hover:border-foreground/40 transition-colors"
            >
              <MessageSquareText className="h-4 w-4" />
              Feedback
            </a>
            {SOCIAL.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:opacity-85 transition-opacity"
              >
                <Icon className="h-7 w-7" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share your feedback</DialogTitle>
            <DialogDescription>Five quick questions — takes under a minute.</DialogDescription>
          </DialogHeader>
          <FeedbackForm key={feedbackOpen ? "open" : "closed"} onDone={() => setFeedbackOpen(false)} />
        </DialogContent>
      </Dialog>
    </footer>
  );
}
