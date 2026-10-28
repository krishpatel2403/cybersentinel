import { describe, expect, it } from "vitest";
import { escapeCsvCell, toCsv } from "@/lib/csv";

describe("CSV export", () => {
  it("neutralizes formula injection prefixes", () => {
    expect(escapeCsvCell("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)");
    expect(escapeCsvCell("+1")).toBe("'+1");
    expect(escapeCsvCell("-2")).toBe("'-2");
    expect(escapeCsvCell("@cmd")).toBe("'@cmd");
    expect(escapeCsvCell("\ttext")).toBe("'\ttext");
  });

  it("quotes cells containing commas, quotes, or newlines", () => {
    expect(escapeCsvCell("hello, world")).toBe('"hello, world"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell("line 1\nline 2")).toBe('"line 1\nline 2"');
  });

  it("renders a BOM and CRLF line endings", () => {
    const csv = toCsv(
      ["A", "B"],
      [
        ["1", "2"],
        ["3", "4"],
      ],
    );
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toBe("\uFEFFA,B\r\n1,2\r\n3,4\r\n");
  });

  it("handles null and undefined as empty cells", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
  });
});
