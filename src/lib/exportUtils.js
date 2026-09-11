import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// ── PDF export via browser print ─────────────────────────────────────────────
export function exportToPDF(report, theme) {
  const printWindow = window.open("", "_blank");
  const content = report.report_content || "";

  // Use brand color if set, otherwise fall back to theme
  const primary = report.brand_color || theme.primary;
  // Derive light/text from brand color (simple tint/shade)
  const light = report.brand_color ? report.brand_color + "15" : theme.light;
  const text = report.brand_color || theme.text;
  const effectiveTheme = { primary, light, text };

  const htmlContent = markdownToHTML(content, effectiveTheme);

  const logoHTML = report.logo_url
    ? `<img src="${report.logo_url}" alt="Logo" style="height:56px; max-width:180px; object-fit:contain; margin-bottom:16px; display:block;" />`
    : "";

  // Running page header (shows on every page after the cover)
  const pageHeaderHTML = report.logo_url
    ? `<div class="page-header"><img src="${report.logo_url}" alt="" style="height:28px; object-fit:contain;" /><span>${report.title}</span></div>`
    : `<div class="page-header"><span style="font-weight:700;color:${primary}">${report.promoter_name || "Finthara AI"}</span><span>${report.title}</span></div>`;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${report.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a2e; background: white; }

        /* Running page header — hidden on first page (cover) */
        .page-header {
          display: none;
          position: running(pageHeader);
          width: 100%;
          padding: 8px 48px;
          border-bottom: 2px solid ${primary};
          font-size: 8.5pt;
          color: #6b7280;
          align-items: center;
          justify-content: space-between;
        }
        @page { margin: 80px 0 40px; @top-center { content: element(pageHeader); } }
        @page :first { margin-top: 0; @top-center { content: none; } }
        @media print { .page-header { display: flex; } }

        .cover { background: ${primary}; color: white; padding: 56px 48px 40px; margin-bottom: 0; page-break-after: always; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .cover h1 { font-family: 'Playfair Display', serif; font-size: 26pt; font-weight: 700; margin-bottom: 12px; line-height: 1.2; }
        .cover .meta { font-size: 10pt; opacity: 0.75; margin-bottom: 12px; }
        .cover .tag { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 20px; padding: 3px 12px; margin: 3px 4px 0 0; font-size: 9pt; }
        .cover .promoter { margin-top: 24px; font-size: 10pt; opacity: 0.85; }

        .stats { display: flex; border-bottom: 2px solid ${primary}20; margin-bottom: 24px; }
        .stat { flex: 1; text-align: center; padding: 14px 8px; border-right: 1px solid #e5e7eb; }
        .stat:last-child { border-right: none; }
        .stat-label { font-size: 8pt; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-value { font-size: 13pt; font-weight: 700; color: ${text}; margin-top: 4px; }

        .body { padding: 24px 48px 48px; }
        h1 { font-family: 'Playfair Display', serif; font-size: 18pt; color: ${text}; margin: 32px 0 8px; padding-bottom: 8px; border-bottom: 2px solid ${primary}; }
        h2 { font-size: 14pt; font-weight: 700; background: ${primary}; color: white; padding: 6px 14px; border-radius: 6px; margin: 24px 0 10px; display: inline-block; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        h3 { font-size: 11pt; font-weight: 600; color: ${text}; margin: 16px 0 6px; border-left: 3px solid ${primary}; padding-left: 10px; }
        p { margin: 6px 0; }
        ul { margin: 6px 0 6px 18px; }
        li { margin: 3px 0; }
        table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 9.5pt; page-break-inside: avoid; }
        thead tr { background: ${primary}; color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        th { padding: 8px 12px; text-align: left; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.03em; }
        td { padding: 7px 12px; border-bottom: 1px solid ${primary}20; }
        tbody tr:nth-child(even) { background: ${light}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        tbody tr:first-child td { font-weight: 600; }
        blockquote { background: ${light}; border-left: 4px solid ${primary}; padding: 10px 16px; margin: 12px 0; border-radius: 0 8px 8px 0; }
        strong { color: ${text}; font-weight: 600; }
      </style>
    </head>
    <body>
      ${pageHeaderHTML}
      <div class="cover">
        ${logoHTML}
        <div class="meta">Project Report · ${report.report_format === "long" ? "Comprehensive" : "Executive Summary"}</div>
        <h1>${report.title}</h1>
        <div>
          ${[report.industry, report.country, report.location].filter(Boolean).map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
        ${report.promoter_name ? `<div class="promoter">Prepared by: <strong>${report.promoter_name}</strong></div>` : ""}
      </div>
      <div class="stats">
        <div class="stat"><div class="stat-label">Total Cost</div><div class="stat-value">${report.currency} ${Number(report.project_cost || 0).toLocaleString()}</div></div>
        <div class="stat"><div class="stat-label">Own Contribution</div><div class="stat-value">${report.currency} ${Number(report.own_contribution || 0).toLocaleString()}</div></div>
        <div class="stat"><div class="stat-label">Funding Required</div><div class="stat-value">${report.currency} ${Number(report.loan_amount || 0).toLocaleString()}</div></div>
      </div>
      <div class="body">${htmlContent}</div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 800);
}

// ── Word (.docx) export ───────────────────────────────────────────────────────
export async function exportToWord(report) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType } = await import("docx");

  const content = report.report_content || "";
  const lines = content.split("\n");
  const children = [];

  // Cover title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: report.title, bold: true, size: 52, color: "4F46E5" })],
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `${report.industry} · ${report.country}${report.location ? ` · ${report.location}` : ""}`, size: 22, color: "6B7280" })],
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Total Cost: ${report.currency} ${Number(report.project_cost||0).toLocaleString()}   |   Own Contribution: ${report.currency} ${Number(report.own_contribution||0).toLocaleString()}   |   Funding: ${report.currency} ${Number(report.loan_amount||0).toLocaleString()}`, bold: true, size: 20 })],
      spacing: { after: 600 },
    })
  );

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Markdown table detection
    if (line.trim().startsWith("|") && i + 1 < lines.length && lines[i+1].trim().startsWith("|---")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const headers = tableLines[0].split("|").map(h => h.trim()).filter(Boolean);
      const rows = tableLines.slice(2).map(l => l.split("|").map(c => c.trim()).filter(Boolean));

      const tableRows = [
        new TableRow({
          children: headers.map(h => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: "FFFFFF" })], alignment: AlignmentType.LEFT })],
            shading: { type: ShadingType.SOLID, color: "4F46E5" },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
          })),
          tableHeader: true,
        }),
        ...rows.map((row, ri) => new TableRow({
          children: row.map((cell, ci) => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: cell, size: 17, bold: ci === 0 })], alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT })],
            shading: ri % 2 !== 0 ? { type: ShadingType.SOLID, color: "EEF2FF" } : undefined,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
          })),
        }))
      ];

      children.push(new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      }));
      children.push(new Paragraph({ spacing: { after: 200 } }));
      continue;
    }

    if (line.startsWith("# ")) {
      children.push(new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 120 } }));
    } else if (line.startsWith("## ")) {
      children.push(new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2, spacing: { before: 320, after: 100 } }));
    } else if (line.startsWith("### ")) {
      children.push(new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 80 } }));
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      children.push(new Paragraph({ text: line.slice(2), bullet: { level: 0 }, spacing: { after: 60 } }));
    } else if (line.startsWith("> ")) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.slice(2), italics: true, color: "4F46E5" })],
        indent: { left: 400 },
        border: { left: { color: "4F46E5", size: 12, space: 10, style: BorderStyle.SINGLE } },
        spacing: { after: 120 },
      }));
    } else if (line.trim() !== "") {
      // Inline bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const runs = parts.map(p => {
        if (p.startsWith("**") && p.endsWith("**")) return new TextRun({ text: p.slice(2, -2), bold: true, size: 20 });
        return new TextRun({ text: p, size: 20 });
      });
      children.push(new Paragraph({ children: runs, spacing: { after: 80 } }));
    }
    i++;
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${report.title.replace(/[^a-z0-9]/gi, "_")}.docx`);
}

// ── Excel financial tables export ────────────────────────────────────────────
export function exportFinancialsToExcel(report) {
  const content = report.report_content || "";
  const wb = XLSX.utils.book_new();

  // Extract all markdown tables
  const tableBlocks = extractMarkdownTables(content);

  if (tableBlocks.length === 0) {
    // Fallback: basic financials sheet
    const ws = XLSX.utils.aoa_to_sheet([
      ["Project Financial Summary"],
      [],
      ["Particulars", "Amount"],
      ["Total Project Cost", report.project_cost || 0],
      ["Own Contribution", report.own_contribution || 0],
      ["Loan / Funding Required", report.loan_amount || 0],
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Financials");
  } else {
    tableBlocks.forEach((tb, idx) => {
      const aoa = [tb.headers, ...tb.rows];
      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // Style header row
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c });
        if (ws[cellRef]) {
          ws[cellRef].s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4F46E5" } }, alignment: { horizontal: "center" } };
        }
      }

      // Auto column widths
      ws["!cols"] = tb.headers.map((h, ci) => {
        const maxLen = Math.max(h.length, ...tb.rows.map(r => (r[ci] || "").length));
        return { wch: Math.min(Math.max(maxLen + 2, 12), 40) };
      });

      const sheetName = tb.title ? tb.title.slice(0, 31) : `Table ${idx + 1}`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
  }

  // Summary sheet
  const summaryData = [
    ["FINANCIAL OVERVIEW", ""],
    ["", ""],
    ["Project Title", report.title || ""],
    ["Industry", report.industry || ""],
    ["Country", report.country || ""],
    ["Currency", report.currency || ""],
    ["", ""],
    ["Total Project Cost", report.project_cost || 0],
    ["Own Contribution", report.own_contribution || 0],
    ["Loan / Funding Required", report.loan_amount || 0],
    ["Debt-Equity Ratio", report.own_contribution > 0 ? ((report.loan_amount || 0) / report.own_contribution).toFixed(2) : "N/A"],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs["!cols"] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  XLSX.writeFile(wb, `${(report.title || "Report").replace(/[^a-z0-9]/gi, "_")}_Financials.xlsx`);
}

// ── Parse uploaded Excel back to markdown ────────────────────────────────────
export async function parseExcelToMarkdown(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        let markdown = "";
        wb.SheetNames.forEach(name => {
          if (name === "Summary") return;
          const ws = wb.Sheets[name];
          const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
          if (!aoa.length) return;
          markdown += `\n### ${name}\n\n`;
          const headers = aoa[0].map(String);
          markdown += `| ${headers.join(" | ")} |\n`;
          markdown += `| ${headers.map(() => "---").join(" | ")} |\n`;
          aoa.slice(1).forEach(row => {
            markdown += `| ${row.map(c => String(c)).join(" | ")} |\n`;
          });
          markdown += "\n";
        });
        resolve(markdown);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractMarkdownTables(content) {
  const lines = content.split("\n");
  const tables = [];
  let i = 0;
  let lastHeading = "";

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith("#")) lastHeading = line.replace(/^#+\s*/, "");

    if (line.startsWith("|") && i + 1 < lines.length && lines[i+1].trim().startsWith("|---")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const headers = tableLines[0].split("|").map(h => h.trim()).filter(Boolean);
      const rows = tableLines.slice(2)
        .map(l => l.split("|").map(c => c.trim()).filter(Boolean))
        .filter(r => r.length > 0);
      if (headers.length && rows.length) {
        tables.push({ title: lastHeading, headers, rows });
      }
      continue;
    }
    i++;
  }
  return tables;
}

function markdownToHTML(md, theme) {
  return md
    .replace(/^#### (.+)$/gm, `<h4>$1</h4>`)
    .replace(/^### (.+)$/gm, `<h3>$1</h3>`)
    .replace(/^## (.+)$/gm, `<h2>$1</h2>`)
    .replace(/^# (.+)$/gm, `<h1>$1</h1>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong>$1</strong>`)
    .replace(/\*(.+?)\*/g, `<em>$1</em>`)
    .replace(/^> (.+)$/gm, `<blockquote>$1</blockquote>`)
    .replace(/^[-*] (.+)$/gm, `<li>$1</li>`)
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/^---$/gm, `<hr>`)
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\|(.+)\|\n\|[-|: ]+\|\n((?:\|.+\|\n?)*)/g, (_, header, body) => {
      const ths = header.split("|").map(h => h.trim()).filter(Boolean).map(h => `<th>${h}</th>`).join("");
      const trs = body.trim().split("\n").map(row => {
        const tds = row.split("|").map(c => c.trim()).filter(Boolean).map(c => `<td>${c}</td>`).join("");
        return `<tr>${tds}</tr>`;
      }).join("");
      return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    })
    .replace(/^(?!<[h|u|t|b|p|h])(.+)$/gm, `<p>$1</p>`);
}