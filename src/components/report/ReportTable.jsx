import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal, Eye, Trash2, FileText, Download, FileSpreadsheet, FileType,
  CheckCircle2, Clock, AlertCircle, Zap, ChevronUp, ChevronDown
} from "lucide-react";
import { formatCurrency, purposes } from "@/lib/countryData";
import { exportToWord } from "@/lib/exportUtils";
import { downloadExcel, downloadPdf } from "@/api/generationService";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

const STATUS_CONFIG = {
  completed: { label: "Completed", icon: CheckCircle2, className: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  generating: { label: "Generating", icon: Zap, className: "text-blue-700 bg-blue-50 border-blue-200" },
  draft: { label: "Draft", icon: Clock, className: "text-amber-700 bg-amber-50 border-amber-200" },
  failed: { label: "Failed", icon: AlertCircle, className: "text-red-700 bg-red-50 border-red-200" },
};


function ActionMenu({ report, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDelete = async () => {
    setOpen(false);
    await onDelete(report.id);
    toast({ title: "Report deleted" });
  };

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(v => !v)}>
        <MoreHorizontal className="w-4 h-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-card border rounded-xl shadow-lg py-1.5 w-48 z-20">
          <Link to={`/report/${report.id}`} onClick={() => setOpen(false)}>
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2.5 transition-colors">
              <Eye className="w-4 h-4 text-primary" /> View / Edit
            </button>
          </Link>
          <div className="border-t my-1" />
          <button
            onClick={async () => {
              setOpen(false);
              try {
                await downloadPdf(report.id);
              } catch (err) {
                toast({ title: "Download failed", description: err?.message || "Please try again.", variant: "destructive" });
              }
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2.5 transition-colors"
          >
            <Download className="w-4 h-4 text-red-500" /> Download PDF
          </button>
          <button
            onClick={() => { setOpen(false); exportToWord(report); }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2.5 transition-colors"
          >
            <FileType className="w-4 h-4 text-blue-500" /> Download Word
          </button>
          <button
            onClick={async () => {
              setOpen(false);
              try {
                await downloadExcel(report.id);
              } catch (err) {
                toast({ title: "Download failed", description: err?.message || "Please try again.", variant: "destructive" });
              }
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Download Excel
          </button>
          <div className="border-t my-1" />
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2.5 transition-colors text-destructive"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function SortButton({ label, sortKey, currentSort, onSort }) {
  const active = currentSort.key === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide select-none"
    >
      {label}
      <span className="flex flex-col">
        <ChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${active && currentSort.dir === "asc" ? "text-primary" : "opacity-30"}`} />
        <ChevronDown className={`w-2.5 h-2.5 ${active && currentSort.dir === "desc" ? "text-primary" : "opacity-30"}`} />
      </span>
    </button>
  );
}

export default function ReportTable({ reports, onDelete }) {
  const [sort, setSort] = useState({ key: "updated_date", dir: "desc" });

  const handleSort = (key) => {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" });
  };

  const sorted = [...reports].sort((a, b) => {
    let va = a[sort.key], vb = b[sort.key];
    if (sort.key === "project_cost") { va = Number(va) || 0; vb = Number(vb) || 0; }
    else { va = va || ""; vb = vb || ""; }
    if (va < vb) return sort.dir === "asc" ? -1 : 1;
    if (va > vb) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="rounded-xl border overflow-hidden bg-card">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b">
              <th className="text-left px-5 py-3.5">
                <SortButton label="Project" sortKey="title" currentSort={sort} onSort={handleSort} />
              </th>
              <th className="text-left px-4 py-3.5">
                <SortButton label="Status" sortKey="status" currentSort={sort} onSort={handleSort} />
              </th>
              <th className="text-left px-4 py-3.5 hidden lg:table-cell">
                <SortButton label="Purpose" sortKey="purpose" currentSort={sort} onSort={handleSort} />
              </th>
              <th className="text-left px-4 py-3.5 hidden lg:table-cell">
                <SortButton label="Project Cost" sortKey="project_cost" currentSort={sort} onSort={handleSort} />
              </th>
              <th className="text-left px-4 py-3.5">
                <SortButton label="Last Updated" sortKey="updated_date" currentSort={sort} onSort={handleSort} />
              </th>
              <th className="px-4 py-3.5 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((report) => {
              const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.draft;
              const purposeLabel = purposes.find(p => p.value === report.purpose)?.label || report.purpose || "—";
              return (
                <tr key={report.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <Link to={`/report/${report.id}`} className="font-medium text-foreground hover:text-primary transition-colors truncate block max-w-[200px]">
                          {report.title}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">{report.industry} · {report.country}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${status.className}`}>
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">{purposeLabel}</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-sm font-medium">{formatCurrency(report.project_cost, report.currency)}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-muted-foreground" title={report.updated_date}>
                      {moment(report.updated_date).fromNow()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <ActionMenu report={report} onDelete={onDelete} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y">
        {sorted.map((report) => {
          const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.draft;
          return (
            <div key={report.id} className="px-4 py-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/report/${report.id}`} className="font-medium text-sm hover:text-primary transition-colors block truncate">
                  {report.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">{report.industry} · {report.country}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${status.className}`}>
                    <status.icon className="w-3 h-3" />
                    {status.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{moment(report.updated_date).fromNow()}</span>
                </div>
              </div>
              <ActionMenu report={report} onDelete={onDelete} />
            </div>
          );
        })}
      </div>
    </div>
  );
}