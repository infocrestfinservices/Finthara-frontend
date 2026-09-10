/**
 * generationService.js
 *
 * Talks to the backend purpose-driven generation pipeline:
 *  - generateModel(): runs agents + builds the structured model (returns preview)
 *  - downloadExcel() / downloadWord(): stream the .xlsx / .docx deliverables
 *
 * Files are fetched with the JWT (the endpoints require auth + ownership), then
 * saved client-side — a plain <a href> download would not send the token.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function authHeaders(json = true) {
  const token = localStorage.getItem("rc_auth_token");
  const h = {};
  if (json) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Start a report generation and wait for it to finish.
 *
 * Generation is a 1-3 minute pipeline. It used to run inside this one HTTP request, which
 * the hosting platform kills at ~60s — so a report that was still building came back as a
 * 504 "failed". Now the POST only starts a background job and returns a job id; we poll
 * GET /generate/jobs/{id} until it's done. `onProgress(pct, stage)` fires on each poll.
 */
export async function generateModel(projectId, purposeAnswers = {}, templateId = null,
                                    refreshInputs = false, instructions = undefined,
                                    withWordReport = false, onProgress = null) {
  const startRes = await fetch(`${BACKEND_URL}/generate/${projectId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      purpose_answers: purposeAnswers,
      template_id: templateId,
      // false => rebuild from the inputs already on file, so a regeneration
      // reproduces the same model instead of inventing a new business.
      refresh_inputs: refreshInputs,
      // The written report is the one expensive call in the pipeline (minutes of
      // reasoning), and the workbook does not use a word of it — so it is OFF unless
      // asked for. Without it the Word file still builds, but its Executive Summary,
      // Business Model and References are the sections that never get written.
      excel_only: !withWordReport,
      // the user's own words about what this report should contain
      ...(instructions !== undefined ? { instructions } : {}),
    }),
  });
  const start = await startRes.json().catch(() => ({}));
  // A plan limit (402) is refused here, before any job is created.
  if (!startRes.ok) throw planAwareError(startRes, start, `Generation failed (${startRes.status})`);

  const jobId = start.job_id;
  if (!jobId) {
    // Backend not yet on the async build — the old shape (the result inline). Use it as-is.
    return start;
  }

  // Poll. ~2.5s between checks; give up after ~10 minutes (the server fails a job that
  // outlives its own limit, so this is just a backstop against a hung poll).
  const deadline = Date.now() + 10 * 60 * 1000;
  while (Date.now() < deadline) {
    await sleep(2500);
    let job;
    try {
      const r = await fetch(`${BACKEND_URL}/generate/jobs/${jobId}`, { headers: authHeaders(false) });
      job = await r.json().catch(() => ({}));
      if (!r.ok) {
        // A transient network/proxy blip on a poll — keep trying rather than failing the
        // whole generation for it.
        if (r.status >= 500 || r.status === 429) continue;
        throw planAwareError(r, job, `Generation failed (${r.status})`);
      }
    } catch (e) {
      if (e.status) throw e;         // a real HTTP error surfaced above
      continue;                      // fetch threw (offline etc.) — retry
    }

    if (onProgress && typeof job.progress === "number") {
      onProgress(job.progress, job.stage || "");
    }
    if (job.status === "done") {
      if (onProgress) onProgress(100, "Done");
      return job.result || {};
    }
    if (job.status === "failed") {
      const err = new Error(job.error || "Report generation failed. Please try again.");
      // The server phrases a plan-limit failure the same way the 402 does; flag it so the
      // UI shows the upgrade path instead of "please try again".
      err.needsUpgrade = /plan|upgrade|covers \d+ report/i.test(job.error || "");
      throw err;
    }
  }
  throw new Error("Report generation is taking longer than expected. It may still finish — "
                + "check your reports in a few minutes.");
}

// The inputs this project's model was built from, labelled — shown for review before a
// regeneration so the user can correct anything instead of re-running blind.
export async function getProjectAnswers(projectId) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/answers`, {
    headers: authHeaders(false),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `Could not load your answers (${res.status})`);
  return data; // { project, template, fields: [{key,label,value,type,options}] }
}

// Fetch the sample templates offered for a purpose (app slug or canonical key).
export async function listTemplates(purpose) {
  const res = await fetch(`${BACKEND_URL}/templates/${encodeURIComponent(purpose)}`, {
    headers: authHeaders(false),
  });
  if (!res.ok) throw new Error(`Could not load templates (${res.status})`);
  return res.json(); // { purpose_key, purpose_label, templates: [...] }
}

// Fetch a template's input schema (the questions to ask, grouped by sheet).
export async function getTemplateSchema(purpose, templateId) {
  const res = await fetch(`${BACKEND_URL}/templates/${encodeURIComponent(purpose)}/${encodeURIComponent(templateId)}/schema`, {
    headers: authHeaders(false),
  });
  if (!res.ok) throw new Error(`Could not load template inputs (${res.status})`);
  return res.json(); // { label, purpose_key, template_id, groups: [...] }
}

/**
 * An error that remembers WHY the server said no.
 *
 * The backend answers 402 when the request is perfectly valid and the caller simply is not
 * on a plan that covers it — a Word download on Free, or a fourth report on Starter. That
 * is not a failure to report as one: the user has done nothing wrong and there is an
 * obvious next step. Marking it here lets the screens show the plan message with a way to
 * act on it, instead of a red "download failed".
 */
function planAwareError(res, body, fallback) {
  const err = new Error(body?.detail || fallback);
  err.status = res.status;
  err.needsUpgrade = res.status === 402;
  return err;
}

async function streamDownload(projectId, kind) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/${kind}`, {
    headers: authHeaders(false),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw planAwareError(res, e, `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition") || "";
  const m = cd.match(/filename="?([^"]+)"?/);
  // Prefer the server's real filename (needs Content-Disposition exposed via
  // CORS). If unavailable, derive the extension from the Content-Type so a
  // macro workbook (.xlsm) is never mis-saved as .xlsx — which corrupts it.
  const ct = res.headers.get("Content-Type") || blob.type || "";
  const fallbackExt = kind !== "excel"
    ? "docx"
    : ct.includes("macroEnabled") ? "xlsm" : "xlsx";
  const name = m ? m[1] : `report.${fallbackExt}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const downloadExcel = (projectId) => streamDownload(projectId, "excel");
export const downloadWord = (projectId) => streamDownload(projectId, "word");

// Logo + brand colour for this project's report. Stored server-side (in the project's
// answers blob, so no schema change) and used by the Word document as well as the UI.
export async function saveBranding(projectId, { logoUrl, brandColor } = {}) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/branding`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      ...(logoUrl !== undefined ? { logo_url: logoUrl } : {}),
      ...(brandColor !== undefined ? { brand_color: brandColor } : {}),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `Could not save branding (${res.status})`);
  return data; // { logo_url, brand_color }
}

export async function getBranding(projectId) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/branding`, {
    headers: authHeaders(false),
  });
  if (!res.ok) return { logo_url: "", brand_color: "" };
  return res.json();
}

// The client's own images, placed at the end of a named section of the report. The whole
// list is sent on every save — the same shape as branding, so adding and removing are one
// code path and cannot get out of step with what the server holds.
export async function getReportSections(projectId) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/sections`, {
    headers: authHeaders(false),
  });
  if (!res.ok) return { sections: [] };
  return res.json(); // { sections: ["Executive Summary", ...] }
}

export async function getInserts(projectId) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/inserts`, {
    headers: authHeaders(false),
  });
  if (!res.ok) return { inserts: [] };
  return res.json(); // { inserts: [{ section, data_url, caption }] }
}

export async function saveInserts(projectId, inserts) {
  const res = await fetch(`${BACKEND_URL}/generate/${projectId}/inserts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ inserts }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `Could not save the inserts (${res.status})`);
  return data;
}

// The project's cover artwork — the same image the Word report's cover carries, generated
// once and cached server-side, so the screen and the document can never disagree.
export async function fetchCoverImage(projectId) {
  // Fetched rather than set as an <img src>: the endpoint needs the JWT in a header, and
  // an <img> tag cannot send one. Returns an object URL, or "" when there is no artwork.
  try {
    const res = await fetch(`${BACKEND_URL}/generate/${projectId}/cover`, {
      headers: authHeaders(false),
    });
    if (!res.ok) return "";
    return URL.createObjectURL(await res.blob());
  } catch {
    return "";
  }
}
