interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950">
      <div>
        <h1 className="text-sm font-semibold text-gray-100">{title}</h1>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[250px]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
