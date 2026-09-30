// Stored (uncompressed) zip for .xlsx workbooks and CSV+resume packs.
// Inline-string sheets, bold header row. No spreadsheet library.

import { formulaSafe } from "./export-safe.js";

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const ZIP_MIME = "application/zip";

export function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function asBytes(data) {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  return new TextEncoder().encode(String(data ?? ""));
}

export function zipBytes(files) {
  const enc = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  const u16 = (v) => [v & 0xFF, (v >>> 8) & 0xFF];
  const u32 = (v) => [v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF];
  for (const { name, data } of files) {
    const nameBytes = enc.encode(name);
    const body = asBytes(data);
    const crc = crc32(body);
    const local = new Uint8Array([0x50, 0x4B, 0x03, 0x04, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(body.length), ...u32(body.length), ...u16(nameBytes.length), ...u16(0)]);
    chunks.push(local, nameBytes, body);
    central.push(new Uint8Array([0x50, 0x4B, 0x01, 0x02, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(body.length), ...u32(body.length), ...u16(nameBytes.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), nameBytes);
    offset += local.length + nameBytes.length + body.length;
  }
  let size = 0;
  for (const c of central) size += c.length;
  const end = new Uint8Array([0x50, 0x4B, 0x05, 0x06, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(size), ...u32(offset), 0, 0]);
  const parts = [...chunks, ...central, end];
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

export function zipBlob(files, mime = ZIP_MIME) {
  return new Blob([zipBytes(files)], { type: mime });
}

const esc = (s) => formulaSafe(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

function colName(i) {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

function sheetXml(rows) {
  const widths = (rows[0] || []).map((_, c) => Math.min(60, Math.max(10, ...rows.map((r) => String(r[c] ?? "").length + 2))));
  const sheetRows = rows.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => `<c r="${colName(ci)}${ri + 1}" t="inlineStr"${ri === 0 ? " s=\"1\"" : ""}><is><t xml:space="preserve">${esc(v)}</t></is></c>`).join("")}</row>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols><sheetData>${sheetRows}</sheetData></worksheet>`;
}

function uniqueSheetName(raw, used) {
  let name = esc(raw || "Sheet").slice(0, 31) || "Sheet";
  let n = 2;
  while (used.has(name.toLowerCase())) {
    const suffix = ` ${n}`;
    name = `${esc(raw || "Sheet").slice(0, 31 - suffix.length)}${suffix}`;
    n += 1;
  }
  used.add(name.toLowerCase());
  return name;
}

/** One or more sheets. Each item is `{ name, rows }` where rows[0] is the header. */
export function xlsxBytes(sheets) {
  const list = (Array.isArray(sheets) && sheets[0]?.rows ? sheets : [{ name: "Candidates", rows: sheets }]).filter((s) => s && Array.isArray(s.rows));
  const used = new Set();
  const named = list.map((s, i) => ({ ...s, name: uniqueSheetName(s.name || `Sheet${i + 1}`, used) }));
  const types = [
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>`,
    ...named.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`),
    "</Types>",
  ].join("");
  const bookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${named.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="rId${named.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${named.map((s, i) => `<sheet name="${s.name}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`;
  const files = [
    { name: "[Content_Types].xml", data: types },
    { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: "xl/workbook.xml", data: workbook },
    { name: "xl/_rels/workbook.xml.rels", data: bookRels },
    { name: "xl/styles.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0"/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>` },
    ...named.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s.rows) })),
  ];
  return zipBytes(files);
}

export function xlsxBlob(rows, sheetName = "Candidates") {
  const sheets = Array.isArray(rows) && rows[0]?.rows ? rows : [{ name: sheetName, rows }];
  return new Blob([xlsxBytes(sheets)], { type: XLSX_MIME });
}
