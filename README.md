# SAQR Energy Guard — Website Showcase

**Creator:** Hussein Mlhem  
**Project Nature:** Fictional Concept / Job Capability Test

This repository contains the interactive two-page website for **SAQR Energy Guard**, a speculative dual-device protection concept designed for coastal energy installations. Built to showcase creative direction, multimedia asset management, storytelling, and interactive front-end design.

---

## 📋 Deliverables

1. **Interactive Website**: Responsive cinematic landing pages featuring scroll-driven product assembly sequences, custom HUD elements, and device callouts.
2. **Product Presentation**: A structured pitch deck outlining the brand identity, device architecture, and speculative positioning.
3. **Cinematic Product Video**: A motion reveal illustrating the mechanical components locking into their functional layouts.

---

## 🗺️ Routes & Pages

- **`/` (Project Showcase)**: Elegant showcase page introducing the creator, the project scope, and direct access points to the slide deck, cinematic trailer, and experience module.
- **`/experience` (Product Experience)**: Full-screen cinematic dashboard containing:
  - Pinned scroll-driven assembly canvas for **SAQR Defender** (49 frames)
  - Atmospheric scanning beam transition
  - Pinned scroll-driven assembly canvas for **SAQR Sentinel** (40 frames)
  - Cinematic YouTube Video embed
  - Automated PDF Presentation viewer
  - Contact links popup

---

## 📂 Asset Directories

All assets are located inside `public/assets/saqr/`:
- **Logo**: `/assets/saqr/Logo.png`
- **Defender Fallback Poster**: `/assets/saqr/Defender.png`
- **Sentinel Fallback Poster**: `/assets/saqr/Senetial.png`
- **Defender Frame Sequence**: `/public/assets/saqr/Defender/frames/` (WebP images: `frame_0001_0.00s.webp` to `frame_0049_4.80s.webp`)
- **Sentinel Frame Sequence**: `/public/assets/saqr/Senetial/frames/` (WebP images: `frame_0001_0.00s.webp` to `frame_0040_3.90s.webp`)
- **Presentation PDF target path**: `/public/assets/saqr/presentation/SAQR-Energy-Guard-Presentation.pdf`

---

## 🛠️ How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open the local URL displayed in your terminal (usually `http://localhost:5173`).

### 3. Build for Production
```bash
npm run build
```
Creates compiled JS/CSS production chunks inside the `dist/` directory.

---

## ⚙️ Configuration & Customization

All major external URLs, download paths, and contact details are controlled from a single centralized config object inside:  
**[`src/assets/saqr_assets.js`](file:///c:/Users/husse/Downloads/SAQR/Website/src/assets/saqr_assets.js)**

### How to replace the YouTube video link:
1. Open `src/assets/saqr_assets.js`.
2. Locate `youtubeVideoUrl` inside the `PROJECT_LINKS` object.
3. Replace the placeholder URL with your final YouTube embed link:
```javascript
export const PROJECT_LINKS = {
  youtubeVideoUrl: "https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE",
  ...
}
```

### How to add/replace the Presentation PDF:
1. Create the directory `/public/assets/saqr/presentation/` if it does not exist.
2. Save your final PDF file inside it, naming it exactly:  
   `SAQR-Energy-Guard-Presentation.pdf`
3. The website's PDF viewer will automatically detect the file, transition from its pending offline state, and enable the live PDF slide layout.
4. If you wish to change the target filename, edit `presentationViewUrl` and `presentationDownloadUrl` in `src/assets/saqr_assets.js`.

---

## ⚠️ Disclaimer

> [!IMPORTANT]
> **This is a fictional concept project created for portfolio and job evaluation purposes. It is not an official commercial product and does not represent a real military, safety, or corporate defense application.**
