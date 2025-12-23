<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Odaa Network Marketing System

A comprehensive, futuristic Network Marketing dashboard featuring genealogy tracking, wallet management, and AI-driven business insights.

## 🚀 Quick Start (Local)

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:**
    *   Copy `.env.example` to `.env`
    *   Add your Gemini API Key:
        ```env
        GEMINI_API_KEY=AIzaSy...
        ```

3.  **Run the app:**
    ```bash
    npm run dev
    ```

## 📦 Deployment Checklist

To deploy this application to production (e.g., cPanel, Vercel, Netlify), follow these steps:

### 1. Essential Configuration
Before building, ensure you have the following information ready:

*   **Gemini API Key:** Required for the AI Support Chat, Business Advisor, and Image Generation features.
*   **Admin Credentials:** Default is username: `admin`, password: `admin`. You can change this in `odaa-main/constants.ts` before building, or change it via the Admin Dashboard after deployment.

### 2. Environment Variables
On your hosting provider, set the following environment variable:
*   Key: `GEMINI_API_KEY`
*   Value: `Your actual Google Gemini API Key`

### 3. Build for Production
Run the build command to generate the static files:

```bash
npm run build
```

This will create a `dist` folder.

### 4. Upload
*   **cPanel / Shared Hosting:** Upload the contents of the `dist` folder to your `public_html` folder.
*   **Vercel / Netlify:** Connect your repository and the build settings should be auto-detected (Output directory: `dist`).

## ⚙️ Customization (Before Build)

You can modify initial system defaults in `odaa-main/constants.ts`:

*   `COMPANY_BANK_DETAILS`: Set your initial bank info.
*   `MOCK_USERS`: Configure the initial Admin account.
*   `OTF_VALUE_ETB`: Set the base currency conversion rate.

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **AI:** Google Gemini API (`@google/genai`)
*   **Icons:** Lucide React
*   **Charts:** Recharts
