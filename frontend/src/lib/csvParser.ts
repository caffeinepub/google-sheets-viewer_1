/**
 * Parses a CSV string into headers and rows.
 * Handles quoted fields with commas and newlines inside them.
 */
export function parseCSV(csv: string): { headers: string[]; rows: string[][] } {
  if (!csv || csv.trim() === '') {
    return { headers: [], rows: [] };
  }

  const lines = splitCSVLines(csv);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(parseCSVLine).filter(row => row.some(cell => cell.trim() !== ''));

  return { headers, rows };
}

function splitCSVLines(csv: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    if (char === '"') {
      if (inQuotes && csv[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        current += char;
      }
    } else if (char === '\n' && !inQuotes) {
      lines.push(current.replace(/\r$/, ''));
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current.replace(/\r$/, ''));
  return lines;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}
