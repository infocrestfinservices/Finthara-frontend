/**
 * DashboardTab.jsx — the shape of the business over time.
 *
 * The four stat cards above answer "what are the numbers"; this answers "which way are they
 * going", which is the question the cards cannot.
 *
 * Chart decisions worth keeping:
 *
 * - Signups and reports share ONE chart because they share a unit (counts of things).
 *   Revenue gets its own, because putting rupees on a second y-axis against counts is the
 *   single most misleading thing a dashboard can do — the crossing point of two arbitrary
 *   scales looks like a fact and is not.
 * - Weekly buckets, every week present. A quiet week is drawn as a zero rather than skipped;
 *   omitting empty periods silently changes the slope between the points that remain.
 * - Series colours are set as CSS custom properties, so the whole thing follows the app's
 *   dark class instead of being a light-only picture pasted into a dark page. The two
 *   palettes are separately chosen for their own surface, not one flipped.
 * - Every chart also has a table behind a toggle: colour is never the only way to read it.
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Loader2, Table2, LineChart as LineChartIcon } from "lucide-react";
import { getDashboard } from "@/api/adminService";

/* Validated with the data-viz palette validator against both surfaces:
   light  #fcfcfb — worst adjacent CVD ΔE 24.7, normal ΔE 33.6, all contrast ≥ 3:1
   dark   #1a1a19 — worst adjacent CVD ΔE 26.8, normal ΔE 31.8, all contrast ≥ 3:1
   The four-slot set used for plans warns on contrast in light mode, which is why those bars
   carry direct value labels — the warning is discharged by not needing colour to read them. */
const VIZ_CSS = `
.viz {
  --s1: #2a78d6;  /* signups / primary        */
  --s2: #eb6834;  /* reports                  */
  --s3: #1baf7a;
  --s4: #eda100;
  --seq: #2a78d6; /* single-hue magnitude     */
  --grid: hsl(var(--border));
  --ink: hsl(var(--muted-foreground));
  --tip-bg: hsl(var(--card));
  --tip-border: hsl(var(--border));
}
.dark .viz {
  --s1: #3987e5;
  --s2: #d95926;
  --s3: #199e70;
  --s4: #c98500;
  --seq: #3987e5;
}
`;

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const weekLabel = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

function Panel({ title, hint, children, right }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {right}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** Recharts' default tooltip inherits nothing useful; this one wears the app's surface. */
function Tip({ active, payload, label, valueFormat = (v) => v }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border px-3 py-2 text-xs shadow-sm"
         style={{ borderColor: "var(--tip-border)", background: "var(--tip-bg)" }}>
      <div className="mb-1 font-medium text-foreground">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: p.color }} />
          <span className="capitalize">{p.name}</span>
          <span className="ml-auto font-medium text-foreground">{valueFormat(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function MiniTable({ head, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>{head.map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className={`py-2 pr-4 ${j === 0 ? "text-foreground" : "text-muted-foreground"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ViewToggle({ asTable, onToggle }) {
  return (
    <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={onToggle}>
      {asTable ? <><LineChartIcon className="h-3.5 w-3.5" /> Chart</>
               : <><Table2 className="h-3.5 w-3.5" /> Table</>}
    </Button>
  );
}

const AXIS = { stroke: "var(--ink)", fontSize: 11, tickLine: false, axisLine: false };

export default function DashboardTab() {
  const [days, setDays] = useState(90);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tables, setTables] = useState({});

  const flip = (k) => setTables((p) => ({ ...p, [k]: !p[k] }));

  useEffect(() => {
    setData(null);
    getDashboard(days).then(setData).catch((e) => setError(e.message));
  }, [days]);

  const series = useMemo(
    () => (data?.series || []).map((w) => ({ ...w, label: weekLabel(w.week) })),
    [data]
  );

  if (error) return <p className="py-10 text-center text-sm text-destructive">{error}</p>;
  if (!data) {
    return (
      <div className="flex items-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  const anyRevenue = series.some((w) => w.revenue > 0);

  return (
    <div className="viz space-y-4">
      <style>{VIZ_CSS}</style>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Showing</span>
        {[30, 90, 180, 365].map((d) => (
          <Button key={d} size="sm" variant={days === d ? "default" : "outline"}
                  onClick={() => setDays(d)}>
            {d === 365 ? "1 year" : `${d} days`}
          </Button>
        ))}
      </div>

      <Panel
        title="Signups and reports"
        hint="Per week. Both are counts, so they share one scale — revenue is charted separately."
        right={<ViewToggle asTable={tables.activity} onToggle={() => flip("activity")} />}
      >
        {tables.activity ? (
          <MiniTable head={["Week", "Signups", "Reports"]}
                     rows={series.map((w) => [w.label, w.signups, w.reports])} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--s1)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--s1)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--s2)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--s2)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" />
              {/* width has to clear the widest tick — too narrow and recharts crops the
                  label rather than growing, so "16" came out as "i6". */}
              <YAxis {...AXIS} allowDecimals={false} width={40} />
              <Tooltip content={<Tip />} cursor={{ stroke: "var(--grid)" }} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area type="monotone" dataKey="signups" name="Signups" stroke="var(--s1)"
                    strokeWidth={2} fill="url(#gSignups)" dot={{ r: 2.5 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="reports" name="Reports" stroke="var(--s2)"
                    strokeWidth={2} fill="url(#gReports)" dot={{ r: 2.5 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Revenue"
          hint={anyRevenue ? "Collected per week." : "Nothing collected in this window yet."}
          right={<ViewToggle asTable={tables.revenue} onToggle={() => flip("revenue")} />}
        >
          {tables.revenue ? (
            <MiniTable head={["Week", "Collected"]}
                       rows={series.map((w) => [w.label, money(w.revenue)])} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" vertical={false} />
                {/* This panel is half the width of the one above with the same fourteen
                    weeks, so "preserveStartEnd" alone still collided every label into a
                    grey band. minTickGap drops labels until they fit; the bars all stay. */}
                <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={28} />
                <YAxis {...AXIS} width={54} tickFormatter={(v) => (v ? money(v) : "0")} />
                <Tooltip content={<Tip valueFormat={money} />} cursor={{ fill: "var(--grid)", fillOpacity: 0.3 }} />
                {/* One series, so no legend — the panel title names it. */}
                <Bar dataKey="revenue" name="Collected" fill="var(--s1)" radius={[4, 4, 0, 0]}
                     maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel
          title="Signup to paid"
          hint="Each step counted against everyone, not against the step before it."
          right={<ViewToggle asTable={tables.funnel} onToggle={() => flip("funnel")} />}
        >
          {tables.funnel ? (
            <MiniTable head={["Step", "People", "Of all signups"]}
                       rows={data.funnel.map((f) => [
                         f.step, f.count,
                         data.totals.users ? `${Math.round(f.count / data.totals.users * 100)}%` : "—",
                       ])} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.funnel} layout="vertical"
                        margin={{ top: 4, right: 44, left: 4, bottom: 4 }}>
                <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" {...AXIS} allowDecimals={false} />
                <YAxis type="category" dataKey="step" {...AXIS} width={136} />
                <Tooltip content={<Tip />} cursor={{ fill: "var(--grid)", fillOpacity: 0.3 }} />
                <Bar dataKey="count" name="People" fill="var(--seq)" radius={[0, 4, 4, 0]}
                     maxBarSize={22}>
                  {/* Direct labels, so the bars never have to be measured against the axis. */}
                  <LabelList dataKey="count" position="right"
                             style={{ fill: "var(--ink)", fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      <Panel
        title="Who is on what"
        hint="Counted from the plan in force right now — a lapsed monthly plan reads as Free."
        right={<ViewToggle asTable={tables.plans} onToggle={() => flip("plans")} />}
      >
        {tables.plans ? (
          <MiniTable head={["Plan", "Users"]}
                     rows={data.plans.map((p) => [p.label, p.count])} />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(120, data.plans.length * 46)}>
            <BarChart data={data.plans} layout="vertical"
                      margin={{ top: 4, right: 44, left: 4, bottom: 4 }}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" {...AXIS} allowDecimals={false} />
              <YAxis type="category" dataKey="label" {...AXIS} width={100} />
              <Tooltip content={<Tip />} cursor={{ fill: "var(--grid)", fillOpacity: 0.3 }} />
              <Bar dataKey="count" name="Users" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {/* Colour follows the PLAN, not the row's position, so filtering or a plan
                    emptying out never repaints the ones that remain. */}
                {data.plans.map((p) => (
                  <Cell key={p.plan}
                        fill={{ advanced: "var(--s3)",
                                basic: "var(--s2)", free: "var(--s1)" }[p.plan] || "var(--s1)"} />
                ))}
                <LabelList dataKey="count" position="right"
                           style={{ fill: "var(--ink)", fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>

      {data.totals.discount_given > 0 ? (
        <p className="text-xs text-muted-foreground">
          {money(data.totals.discount_given)} has been given away in coupon discounts.
        </p>
      ) : null}
    </div>
  );
}
