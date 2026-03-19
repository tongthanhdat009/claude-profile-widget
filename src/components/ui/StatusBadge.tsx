interface StatusBadgeProps {
  status: "active" | "success" | "warning" | "error" | "info";
  label: string;
}

const STATUS_CLASSES: Record<StatusBadgeProps["status"], string> = {
  active: "badge-active",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
  info: "badge-info",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return <span className={STATUS_CLASSES[status]}>{label}</span>;
}
