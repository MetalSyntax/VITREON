# Changelog

All notable changes to **Vitreon Notes** will be documented in this file.

## [1.2.0] - 2026-04-05

### Added
- **Integrated Search Control**: Redesigned search bar embedding Sort, Layout, and Selection toggles for efficient mobile use.
- **Horizontal Category Filter**: Added a scrollable filter bar with icons for instant note filtering by category.
- **FormKit Drag-and-Drop**: Robust, touch-friendly reordering engine replacing brittle HTML5 implementation.
- **Expanded Icon Palette**: Over 50 new Material Symbols for category personalization.
- **Jest Performance Benchmarks**: Automated stress tests ensuring 1,000+ notes load and sort within milliseconds.
- **Cypress Design Audit**: Automated UI consistency checks (font: Outfit, radius: 24px, glassmorphism).
- **Premium Aesthetics**: Removed "Untitled" and empty content placeholders; standardized 24px border-radius globally.

### Fixed
- **Thundering Herd Decryption**: Added `_cryptoKeyPromise` to prevent concurrent PBKDF2 derivations, fixing 10s+ load times.
- **Mobile Action Bar Visibility**: Applied `flex-shrink-0` to ensure search bar buttons are always accessible on narrow screens.
- **Global Text Selection**: Enabled native text selection inside notes while maintaining container-level drag/click functionality.

### Changed
- **Semantic HTML Refactor**: Optimized structural elements (`<header>`, `<main>`, `<section>`) for better SEO and accessibility.
- **Dependency Update**: Added `@formkit/drag-and-drop`, `cypress`, and `jest` stack.

---

## [1.1.0] - 2026-03-22

### Added
- **Google Drive Sync v2**: Native `fetch`-based integration with backup history viewer.
- **Google Keep Import**: Support for importing Keep JSON exports with automatic metadata mapping.
- **Animated Toast System**: Replaced all native alert calls with stylized UI notifications.

---

## [1.0.0] - initial Release
- **Core Markdown Editor**
- **AES-GCM Encryption**
- **Basic Google Drive Integration**
- **IndexedDB persistence**
