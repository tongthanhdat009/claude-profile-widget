import { useMemo } from "react";
import { computeDiff } from "../../utils/diff";
import { formatJson } from "../../utils/formatJson";

interface DiffPreviewProps {
  oldData: unknown;
  newData: unknown;
  maxHeight?: string;
}

export function DiffPreview({
  oldData,
  newData,
  maxHeight = "260px",
}: DiffPreviewProps) {
  const diff = useMemo(() => {
    const oldJson = formatJson(oldData);
    const newJson = formatJson(newData);
    return computeDiff(oldJson, newJson);
  }, [oldData, newData]);

  return (
    <div>
      <div className="flex gap-3 text-xs text-gray-500 mb-1.5 px-1">
        <span className="text-green-400">+{diff.addedCount} added</span>
        <span className="text-red-400">−{diff.removedCount} removed</span>
        {!diff.hasChanges && (
          <span className="text-gray-500">No changes detected</span>
        )}
      </div>
      <div
        className="font-mono text-xs bg-gray-900 rounded-lg overflow-auto border border-gray-800"
        style={{ maxHeight }}
        aria-label="Diff preview"
      >
        {diff.lines.map((line, i) => (
          <div
            key={i}
            className={`px-3 py-0.5 ${
              line.type === "added"
                ? "diff-added"
                : line.type === "removed"
                  ? "diff-removed"
                  : "diff-unchanged"
            }`}
          >
            <span className="select-none text-gray-600 mr-2 inline-block w-4 text-right text-[10px]">
              {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
            </span>
            {line.content}
          </div>
        ))}
      </div>
    </div>
  );
}
