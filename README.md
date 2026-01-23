# 🖋️ Vitreon Notes

**A Premium, Secure, and Elegant Markdown Note-Taking Experience**

[Vitreon Notes](https://ai.studio/apps/drive/1nzi2_e5h2TA87dfFhe3ruKGhw504K2dU) combines cutting-edge security with a stunning glassmorphic design to provide the perfect environment for your digital thoughts.

## ✨ Features

### 🔒 Military-Grade Security

- **AES-GCM 256-bit Encryption:** Your notes are encrypted locally before ever hitting the database.
- **PBKDF2 Key Derivation:** Secure master key generation with 100,000 iterations to resist brute-force attacks.
- **Privacy-First:** Secure "Locked Notes" feature with dedicated PIN protection.
- **No Compromises:** Sensitive data is obfuscated even within the browser's internal database.

### 📝 Full Markdown Ecosystem

- **Rich Renderer:** Support for Headers (`#`), Blockquotes (`>`), Lists (`-`), Inline Code (`` ` ``), and Horizontal Rules (`---`).
- **Enhanced Format:** Support for **Bold**, _Italics_, and ++Underline++ (using standard markdown patterns).
- **Reading First:** Optimized "Viewing Mode" toggle to read your notes without the clutter of the editor.

### ☁️ Cloud Sync & Data Portability

- **Google Drive Sync:** Effortless multi-device backup and restore via official Google API integration.
- **.MD Power User:** Export your notes as standard `.md` files or import existing ones directly into your secure vault.
- **Full Backups:** Comprehensive JSON export/import for complete data control.

### 🎨 Premium Experience

- **Glassmorphism UI:** A sleek, modern interface with dynamic blurs, smooth gradients, and micro-animations.
- **Visual Organization:** Custom categories with unique icons and colors.
- **Media Support:** Attach images (with drag-and-drop reordering), voice notes, and hand-drawn sketches.
- **Smart Search:** Real-time voice search and category filtering for instant access.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Database:** IndexedDB (Local-First Architecture)
- **Security:** Web Crypto API (AES-GCM, PBKDF2)
- **APIs:** Google Drive API (GAPI + GIS)
- **Design:** Custom Glassmorphic CSS System

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)

### Installation

1.  **Clone and install dependencies:**

    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the root directory (use `.env.example` as a template):

    ```env
    VITE_GOOGLE_DRIVE_CLIENT_ID=your_id
    VITE_GOOGLE_DRIVE_API_KEY=your_key
    VITE_ENCRYPTION_SALT=secure_random_salt
    VITE_ENCRYPTION_KEY=your_master_secret
    ```

3.  **Launch the development server:**
    ```bash
    npm run dev
    ```

---

## 🔐 Security Disclaimer

Vitreon Notes is a local-first application. Your encryption keys (derived from your `.env` salt and key) are essential to decrypt your data. **If you lose your `.env` configuration or change the salt, previously encrypted notes will be unrecoverable.** Always keep a secure backup of your settings.

---

<div align="center">
  Made with ❤️ by MetalSyntax
</div>
