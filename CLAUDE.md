# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Tauri v2 desktop widget for switching between Claude Code configuration profiles. It manages profiles (JSON files with permission settings, environment variables, and preferences) and backs up/restores Claude Code settings.

## Commands

```bash
# Development
bun run dev          # Start Vite dev server (port 1420)
bun run tauri dev    # Run Tauri app in development mode

# Build
bun run build        # TypeScript check + Vite build
bun run tauri build  # Build production desktop application
```

## Architecture

This is a Tauri v2 application with a React frontend and Rust backend.

### Frontend (src/)

- **pages/**: Top-level route components (Dashboard, ProfilesPage, BackupsPage, SettingsPage)
- **components/**: UI components organized by concern
  - `layout/`: AppShell, Header, Sidebar
  - `profile/`: ProfileCard, ProfileList, DiffPreview
  - `backup/`: BackupList
  - `ui/`: Reusable components (ActionBar, EmptyState, JsonPreview, StatusBadge)
- **services/**: TypeScript wrappers around Tauri commands via `invoke()`
- **hooks/**: React hooks for profiles, backups, and settings state
- **types/**: TypeScript interfaces matching Rust models

### Backend (src-tauri/src/)

- **commands/**: Tauri command handlers exposed to frontend via `invoke()`
- **services/**: Core business logic (file_service, settings_service, backup_service)
- **models/**: Rust structs with Serde serialization (Profile, ClaudeSettings, Backup)

### Data Flow

1. Profiles are JSON files in `profiles/` directory (bundled with app)
2. Backups are stored in `backups/` directory
3. Active settings are written to Claude Code's settings.json:
   - Windows: `%APPDATA%\Claude\settings.json`
   - macOS/Linux: `~/.claude/settings.json`

### Profile Structure

```json
{
  "name": "profile-id",
  "displayName": "Profile Name",
  "description": "Description",
  "version": "1.0.0",
  "settings": {
    "autoUpdaterEnabled": true,
    "permissions": { "allow": [...], "deny": [...] },
    "env": { "KEY": "value" }
  }
}
```

## Key Files

- `src-tauri/tauri.conf.json`: Window config, build settings, fs plugin scope
- `src-tauri/capabilities/default.json`: Permission declarations for fs and shell plugins
- `src/config/appConfig.ts`: Frontend constants (paths, limits)

## Git Commit Convention

Format: `type(scope): description`

### Types
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `docs` - Documentation
- `style` - Code style changes
- `test` - Tests
- `chore` - Build, CI, dependencies

### Scopes
- `frontend` - React frontend
- `backend` - Rust/Tauri backend
- `profiles` - Profile management
- `backups` - Backup functionality
- `ui` - UI components
- `config` - Configuration
- `ci` - CI/CD

### Rules
- Lowercase, imperative mood ("add" not "added")
- No period at the end
- Keep it concise

### Examples
```
feat(backend): add profile import from file
fix(frontend): handle missing profile gracefully
refactor(profiles): extract profile validation logic
chore(ci): update tauri build workflow
```