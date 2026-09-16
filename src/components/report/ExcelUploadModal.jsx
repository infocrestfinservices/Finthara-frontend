import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { parseExcelToMarkdown } from "@/lib/exportUtils";

export default function ExcelUploadModal({ report, onClose, onRegenerate }) {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setError("");
    setParsed(null);
    setIsParsing(true);
    try {
      const md = await parseExcelToMarkdown(f);
      setParsed(md);
    } catch {
      setError("Could not parse Excel file. Please use the exported template.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) handleFile(f);
    else setError("Please upload an .xlsx or .xls file.");
  };

  const handleRegenerate = async () => {
    if (!parsed) return;
    setIsRegenerating(true);
    await onRegenerate(parsed);
    setIsRegenerating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Upload Revised Financials</p>
              <p className="text-xs text-muted-foreground">Upload your edited Excel to regenerate the report</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 space-y-1.5">
            <p className="font-semibold">How it works:</p>
            <ol className="list-decimal pl-4 space-y-1 text-xs">
              <li>Click <strong>"Export Excel"</strong> in the toolbar to download financial tables</li>
              <li>Edit the numbers in Excel (adjust projections, costs, etc.)</li>
              <li>Save the file and upload it here</li>
              <li>Click <strong>"Regenerate Report"</strong> — AI will rebuild using your revised figures</li>
            </ol>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-primary hover:bg-accent/30"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="font-medium text-sm">Drop your Excel file here</p>
                <p className="text-xs text-muted-foreground">or click to browse · .xlsx / .xls</p>
              </div>
            )}
          </div>

          {/* Status */}
          {isParsing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Parsing financial data...
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          {parsed && !isParsing && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              Financial tables parsed successfully — ready to regenerate
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} size="sm">Cancel</Button>
          <Button
            onClick={handleRegenerate}
            disabled={!parsed || isRegenerating}
            size="sm"
            className="gap-2"
          >
            {isRegenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
            {isRegenerating ? "Regenerating..." : "Regenerate Report"}
          </Button>
        </div>
      </div>
    </div>
  );
}