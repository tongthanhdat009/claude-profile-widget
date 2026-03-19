import { formatJson } from "../../utils/formatJson";

interface JsonPreviewProps {
  data: unknown;
  maxHeight?: string;
}

export function JsonPreview({ data, maxHeight = "300px" }: JsonPreviewProps) {
  const formatted = formatJson(data);

  return (
    <div
      className="json-viewer overflow-auto"
      style={{ maxHeight }}
      aria-label="JSON preview"
    >
      <pre className="whitespace-pre text-gray-300">{formatted}</pre>
    </div>
  );
}
