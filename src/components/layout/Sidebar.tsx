type Page = "dashboard" | "profiles" | "backups" | "settings";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; label: string; icon: string }[] = [
  { page: "dashboard", label: "Dashboard", icon: "⊞" },
  { page: "profiles", label: "Profiles", icon: "⚙" },
  { page: "backups", label: "Backups", icon: "⟳" },
  { page: "settings", label: "Settings", icon: "≡" },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <nav className="flex flex-col w-14 bg-gray-950 border-r border-gray-800 py-3 items-center gap-1">
      {NAV_ITEMS.map(({ page, label, icon }) => (
        <button
          key={page}
          title={label}
          onClick={() => onNavigate(page)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors duration-150
            ${
              currentPage === page
                ? "bg-claude-700 text-white"
                : "text-gray-500 hover:text-gray-200 hover:bg-gray-800"
            }`}
          aria-label={label}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {icon}
        </button>
      ))}
    </nav>
  );
}

export type { Page };
