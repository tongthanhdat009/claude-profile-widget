import { useState } from "react";
import { Sidebar } from "./Sidebar";
import type { Page } from "./Sidebar";
import { StatusBadge } from "../ui/StatusBadge";
import { isTauriRuntime } from "../../services/tauriBridge";

interface AppShellProps {
  children: (page: Page) => React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const isTauri = isTauriRuntime();

  return (
    <div className="flex h-full min-h-screen bg-gray-950">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex flex-col flex-1 overflow-hidden">
        {!isTauri && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-blue-900/70 bg-blue-950/30">
            <StatusBadge status="info" label="Browser Preview" />
            <p className="text-xs text-blue-200/80">
              Using local mock data until the Tauri runtime is available.
            </p>
          </div>
        )}
        {children(currentPage)}
      </main>
    </div>
  );
}
