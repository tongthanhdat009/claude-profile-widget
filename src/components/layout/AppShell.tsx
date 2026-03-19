import { useState } from "react";
import { Sidebar } from "./Sidebar";
import type { Page } from "./Sidebar";

interface AppShellProps {
  children: (page: Page) => React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  return (
    <div className="flex h-full min-h-screen bg-gray-950">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex flex-col flex-1 overflow-hidden">
        {children(currentPage)}
      </main>
    </div>
  );
}
