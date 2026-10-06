import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { EXTRA_MEMBER_PRICE } from "./landingData";

// Only what the product does today: Consultant & CA includes owner + 2 seats with editor /
// viewer roles; more seats are bought one at a time from the Team tab (Profile → Team). No
// checkout on this page itself.
const POINTS = [
  "Add seats beyond the 2 members included in Consultant & CA",
  "Same roles — each member is an editor or a viewer",
  "Your projects and reports stay as they are",
];

/** "Need a bigger team?" — points to the Team tab where seats are bought. Same width as the
 *  plan cards above it, so the page lines up. */
export default function TeamContact() {
  const price = String(EXTRA_MEMBER_PRICE || "").trim();
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div className="max-w-3xl mx-auto rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-sky-500/5 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-heading font-bold text-primary">
              Need a bigger team?
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Need more than 2 team members? Add a seat from your Team settings, any time.
            </p>
            <ul className="mt-3 space-y-1.5">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full sm:w-52 flex-shrink-0 rounded-2xl border bg-card shadow-sm p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Extra team member
            </p>
            <p className="mt-1 text-3xl font-heading font-bold text-primary">₹{price || "____"}</p>
            <p className="text-xs text-muted-foreground">per member / month · GST extra</p>
            <Button asChild className="mt-3 w-full rounded-full">
              <Link to="/profile?tab=team">Add a seat</Link>
            </Button>
            <Link to="/contact?topic=consultant" className="mt-2 inline-block text-xs text-muted-foreground underline hover:text-foreground">
              Questions? Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
