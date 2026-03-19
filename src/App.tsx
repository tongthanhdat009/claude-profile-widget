import { AppShell } from "./components/layout/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { ProfilesPage } from "./pages/ProfilesPage";
import { BackupsPage } from "./pages/BackupsPage";
import { SettingsPage } from "./pages/SettingsPage";
import type { Page } from "./components/layout/Sidebar";

function App() {
  return (
    <AppShell>
      {(page: Page) => {
        switch (page) {
          case "dashboard":
            return <Dashboard />;
          case "profiles":
            return <ProfilesPage />;
          case "backups":
            return <BackupsPage />;
          case "settings":
            return <SettingsPage />;
        }
      }}
    </AppShell>
  );
}

export default App;
