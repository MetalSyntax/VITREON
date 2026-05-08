# 🖋️ Vitreon Notes v1.3.0

**A Premium, Secure, and Elegant Markdown Note-Taking Experience**

[Vitreon Notes](https://ai.studio/apps/drive/1nzi2_e5h2TA87dfFhe3ruKGhw504K2dU) combines cutting-edge security with a stunning glassmorphic design to provide the perfect environment for your digital thoughts.

## ✨ Features

### 🔒 Military-Grade Security

- **AES-GCM 256-bit Encryption:** Your notes are encrypted locally before ever hitting the database.
- **PBKDF2 Key Derivation:** Secure master key generation with 100,000 iterations to resist brute-force attacks.
- **Performance-First Decryption:** Optimized "Single Promise" key derivation ensures 1,000+ notes load in under 1 second.
- **Privacy-First:** Secure "Locked Notes" feature with dedicated PIN protection.

### 📝 Full Markdown Ecosystem

- **Rich Renderer:** Support for Headers (`#`), Blockquotes (`>`), Lists (`-`), Inline Code (`` ` ``), and Horizontal Rules (`---`).
- **Enhanced Format:** Support for **Bold**, _Italics_, and ++Underline++ patterns.
- **Reading First:** Optimized "Viewing Mode" toggle to read your notes without the clutter of the editor.

### 🍱 Integrated Control Center

- **Unified Search Bar:** Redesigned search input that embeds Sort, Layout, and Select-Mode buttons for a cleaner mobile experience.
- **Category Filter Bar:** Horizontal, scrollable filter bar with icons for instant collection switching.
- **Advanced Bulk Actions:** Select multiple notes to change categories, pin, delete, or export in one go.
- **Smart Data Portability:** Support for the `.vitreon` open JSON schema for full app state transfers.
- **Conflict Management:** Intelligence deduplication engine prevents note clashing during imports.

### 🎨 Premium Experience

- **Pro Drag & Drop:** Powered by `@formkit/drag-and-drop` for fluid, touch-friendly note reordering.
- **Expanded Icon Library:** Over 50 curated Material Symbols for visually stunning category management.
- **Glassmorphism UI:** A sleek, modern interface with 24px (rounded-3xl) standard radii and Outfit typography.
- **Minimalist Content:** "Untitled" and "Empty Content" placeholders removed to prioritize your actual data.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Database:** IndexedDB (Local-First Architecture)
- **Security:** Web Crypto API (AES-GCM, PBKDF2)
- **Testing:** Cypress (E2E/Design Audit), Jest (Performance Benchmarks)
- **Interactions:** @formkit/drag-and-drop

---

## 🚀 Getting Started

### Installation

1.  **Clone and install dependencies:**

    ```bash
    pnpm install
    ```

2.  **Launch the development server:**
    ```bash
    pnpm dev
    ```

### 🧪 Testing

Run the automated suites to ensure design and performance consistency:

```bash
pnpm test          # Run Jest Performance Benchmarks
pnpm cypress:run   # Run UI Consistency and Load stress tests
```

---

## 📊 Changelog

### v1.3.0 (Current)

- **Smart Import Deduplication**: Introduced deterministic fingerprinting (`title + createdAt`) to prevent duplicate notes on re-import.
- **Conflict Resolution UI**: Interactive glassmorphic modal for manual resolution of import conflicts (Keep Local, Replace, Keep Both).
- **GDPR Compliance Layer**: Comprehensive privacy controls including a consent banner, detailed Privacy Policy modal, and explicit "Right to be Forgotten" (Delete All Data) flow.
- **Power User Shortcuts**: Full keyboard navigation support with `Ctrl+N`, `Ctrl+S`, `Ctrl+F`, and `Esc` shortcuts.
- **.vitreon Support**: Native support for the `.vitreon` extension for both backups and restores.

### v1.2.0

- **Google Drive Integration Refactor**: Migrated from outdated `gapi` to native `fetch`.
- **Drive Backup History Modal**: Daily backup history support.
- **Google Keep Importer**: Native recognition of Keep JSON exports.
- **Toast Notification System**: Replaced native alerts with animated toasts.

---

<div align="center">
  Made with ❤️ by MetalSyntax
</div>
