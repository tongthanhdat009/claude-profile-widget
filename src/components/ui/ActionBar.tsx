interface ActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export function ActionBar({ children, className = "" }: ActionBarProps) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 border-t border-gray-800 bg-gray-950 ${className}`}
    >
      {children}
    </div>
  );
}
