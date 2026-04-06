# 🖋️ Vitreon Notes v1.2.0

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
- **Advanced Bulk Actions:** Select multiple notes to change categories, pin, or delete in one go.

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

### v1.2.0 (Current)

- **Mobile UX Overhaul**: Integrated search bar controls and horizontal category filter for better narrow-screen usability.
- **Pro Reordering**: Switched to `@formkit/drag-and-drop` for robust touch interactions.
- **Performance Fix**: Resolved "thundering herd" decryption bottleneck (Promise caching).
- **Testing Suite**: Implemented Cypress (Design System Audit) and Jest (Performance Benchmarks).
- **Refined Aesthetics**: Standardized 24px border-radius and expanded icon library to 50+ options.

### v1.1.0

- **Google Drive Integration Refactor**: Migrated from outdated `gapi` to native `fetch`.
- **Drive Backup History Modal**: Daily backup history support.
- **Google Keep Importer**: Native recognition of Keep JSON exports.
- **Toast Notification System**: Replaced native alerts with animated toasts.

---

<div align="center">
  Made with ❤️ by MetalSyntax
</div>
