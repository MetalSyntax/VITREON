# 🖋️ Vitreon Notes v1.1.0

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
- **APIs:** Google Drive API (Google Identity Services)
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
    VITE_ENCRYPTION_SALT=secure_random_salt
    VITE_ENCRYPTION_KEY=your_master_secret
    ```

3.  **Launch the development server:**
    ```bash
    npm run dev
    ```

---

## 🚀 Deployment

### Deploying to Vercel

1.  **Push your code** to a GitHub, GitLab, or Bitbucket repository.
2.  **Import the project** in the [Vercel Dashboard](https://vercel.com/new).
3.  **Configure Environment Variables** in the Vercel project settings:
    - `VITE_GOOGLE_DRIVE_CLIENT_ID`
    - `VITE_ENCRYPTION_SALT`
    - `VITE_ENCRYPTION_KEY`
4.  **Deploy!** Vercel will automatically detect the Vite setup and build the project.

---

## 🔐 Security Disclaimer

Vitreon Notes is a local-first application. Your encryption keys (derived from your `VITE_ENCRYPTION_SALT` and `VITE_ENCRYPTION_KEY`) are essential to decrypt your data. **If you lose these variables or change them, previously encrypted notes will be unrecoverable.** Always keep a secure backup of your environment configuration.

## 📊 Changelog

### v1.1.0

- **Google Drive Integration Refactor**: Migrated from outdated `gapi` to native `fetch`. Resolves API key vulnerabilities and 400 Bad Request errors.
- **Drive Backup History Modal**: Automatically creates daily backup strings (`vitreon_backup_YYYY-MM-DD.json`) instead of overwriting, supported by a new sleek modal for restoring specific backups.
- **Google Keep Importer Integration**: `.json` data files exported from Google Keep are now instantly recognized and formatted upon internal import. Protects against duplicate notes via auto-UUID generation.
- **Improved Authentication UX**: Automatically captures cached access tokens dynamically to speed up login logic while bypassing redundant consent screens.
- **Elegant Event Flow System**: Eradicated all native web `alert()` boxes globally. The entire system now utilizes stylized, animated `Toasts`.
- **Intelligent Text Selection**: Granular text selection isolation inside notes rendering engine - disabled across UI elements to prioritize slick navigation.

---

<div align="center">
  Made with ❤️ by MetalSyntax
</div>
