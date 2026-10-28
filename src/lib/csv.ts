/**
 * Prevents CSV formula injection. Spreadsheet apps treat cells beginning with
 * =, +, -, @, tab, or carriage return as formulas. Prefixing with an apostrophe
 * keeps the text literal.
 */
export function escapeCsvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function toCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsvCell).join(","));
  }
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
