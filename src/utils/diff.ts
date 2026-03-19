export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  lineNumber: number;
  content: string;
}

export interface DiffResult {
  hasChanges: boolean;
  lines: DiffLine[];
  addedCount: number;
  removedCount: number;
}

/**
 * Computes a simple line-by-line diff between two JSON strings.
 */
export function computeDiff(oldJson: string, newJson: string): DiffResult {
  const oldLines = oldJson.split("\n");
  const newLines = newJson.split("\n");

  const lines: DiffLine[] = [];
  let addedCount = 0;
  let removedCount = 0;

  let oldIdx = 0;
  let newIdx = 0;
  let lineNumber = 1;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    const oldLine = oldLines[oldIdx];
    const newLine = newLines[newIdx];

    if (oldIdx >= oldLines.length) {
      // Only new lines remain
      lines.push({ type: "added", lineNumber: lineNumber++, content: newLine });
      addedCount++;
      newIdx++;
    } else if (newIdx >= newLines.length) {
      // Only old lines remain
      lines.push({
        type: "removed",
        lineNumber: lineNumber++,
        content: oldLine,
      });
      removedCount++;
      oldIdx++;
    } else if (oldLine === newLine) {
      lines.push({
        type: "unchanged",
        lineNumber: lineNumber++,
        content: oldLine,
      });
      oldIdx++;
      newIdx++;
    } else {
      // Lines differ - mark old as removed and new as added
      lines.push({
        type: "removed",
        lineNumber: lineNumber++,
        content: oldLine,
      });
      removedCount++;
      oldIdx++;
      lines.push({ type: "added", lineNumber: lineNumber++, content: newLine });
      addedCount++;
      newIdx++;
    }
  }

  return {
    hasChanges: addedCount > 0 || removedCount > 0,
    lines,
    addedCount,
    removedCount,
  };
}
