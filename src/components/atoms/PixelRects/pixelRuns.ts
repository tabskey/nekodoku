/** A horizontal run of one character in a pixel map. */
export interface Run {
  x: number;
  width: number;
  char: string;
}

/** Groups a row of the map into runs, so "bbbb" is one 4-pixel rectangle. */
export function toRuns(row: string): Run[] {
  const runs: Run[] = [];
  for (let x = 0; x < row.length;) {
    let end = x + 1;
    while (end < row.length && row[end] === row[x]) end++;
    runs.push({ x, width: end - x, char: row[x] });
    x = end;
  }
  return runs;
}
