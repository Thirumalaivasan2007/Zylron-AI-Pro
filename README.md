<div align="center">
  <img src="./frontend/src/logo.png" alt="Zylron AI Logo" width="120" height="120" />
  <h1>Zylron AI</h1>
  <p><strong>Next-Generation Multimodal AI Ecosystem with Spatial Interaction</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Gemini_1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
  </p>
</div>

---

## 🌟 Overview
**Zylron AI** is a cutting-edge, production-ready AI platform designed to push the boundaries of human-computer interaction. Powered by Google's latest **Gemini 1.5 Flash API**, Zylron transcends traditional text-based chatbots by offering deep multimodal capabilities (Text, Vision, Document RAG), real-time speech synthesis, and pioneering webcam-based spatial gesture controls.

---

## ✨ Elite Features

- 🧠 **Multimodal Intelligence**
  - **Vision & Document RAG:** Instantly drag-and-drop PDFs or images. Zylron intelligently extracts context and engages in highly specific, localized Q&A.
  - **Dynamic Personas:** Switch between "Code Architect," "Academic Tutor," or "Sarcastic Genius" to instantly re-align the AI's system instructions and tone.
  
- 🖐️ **Zylron Sense (HCI Spatial Control)**
  - A groundbreaking accessibility feature. Control the UI completely hands-free using your webcam and AI-driven hand gesture recognition.

- 💻 **Live Sandbox Preview**
  - Advanced code extraction engine. Whenever Zylron generates HTML, CSS, or JS, instantly compile and view a live, interactive rendering in a secure, isolated iframe sandbox.

- 🔐 **Stateful SaaS Architecture**
  - **Firebase Infrastructure:** Secure JWT Authentication, persistent Cloud Chat History across devices, and seamless public sharing links.
  - **Usage Telemetry:** Built-in daily credit tracking limits (up to 50 AI calls/day) to manage API load effectively.

- ⚡ **Premium UI / UX**
  - Built meticulously with dark-mode-first glassmorphism styling. Features ultra-fast dynamic typewriter effects, keyboard accessibility (Esc-to-close), and Progressive Web App (PWA) installability.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/zylron-ai.git
   cd zylron-ai
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `frontend/` directory and add your keys:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   *The app will be running at `http://localhost:3000`*

---

## 🏗️ Production Build
To create an optimized production build (including the PWA Service Worker configs):
```bash
npm run build
```
The compiled files will be outputted to the `/dist` directory, fully ready to be deployed to Vercel, Netlify, or Firebase Hosting.

---

<div align="center">
  <i>Built with passion by a Senior Full-Stack Developer.</i>
</div>
