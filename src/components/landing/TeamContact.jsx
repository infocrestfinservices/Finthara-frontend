import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { EXTRA_MEMBER_PRICE } from "./landingData";

// Only what the product does today: teams are the Consultant & CA plan's seats (owner + 2),
// with editor / viewer roles. Larger teams are arranged by contacting us — there is no
// checkout here, on purpose.
const POINTS = [
  "Add team members beyond the 2 included in Consultant & CA",
  "Same roles as today — each member is an editor or a viewer",
  "Your projects and reports stay exactly as they are",
  "Pricing agreed with you before anything changes",
];

/** "Need a bigger team?" — information and a contact button only. */
export default function TeamContact() {
  const price = String(EXTRA_MEMBER_PRICE || "").trim();
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-16">
      <div className="max-w-5xl mx-auto rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-sky-500/5 p-6 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-primary">
              Need a bigger team?
            </h3>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-xl">
              If you need more than 2 team members, get in touch. We'll work out the pricing for
              your team — you'll just move to an updated version of your plan.
            </p>
            <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full lg:w-72 rounded-xl border bg-card shadow-sm p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Each extra team member
            </p>
            <p className="mt-2 text-4xl font-heading font-bold text-primary">
              ₹{price || "____"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">per month · GST extra</p>
            <Button asChild size="lg" className="mt-5 w-full">
              <Link to="/contact?topic=consultant">Contact us</Link>
            </Button>
            <p className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              Nothing is charged here — we'll reply with a plan for your team.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
