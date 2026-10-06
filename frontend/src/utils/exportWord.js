const escapeHtml = (value) =>
  String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const downloadWordTable = ({ title, headers, rows, fileName }) => {
  const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const body = rows
    .map((r) => `<tr>${r.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
  h1 { font-size: 16pt; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #999; padding: 4px 6px; text-align: left; }
  th { background: #e8ecf3; font-weight: bold; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p>Taariikhda: ${new Date().toLocaleDateString()} · Wadarta: ${rows.length}</p>
<table>
<thead><tr>${head}</tr></thead>
<tbody>${body}</tbody>
</table>
</body>
</html>`;

  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
