# 2nd Semester Study Hub

A mobile-friendly Progressive Web App (PWA) designed to help diploma students organize and revise second-semester subjects in one place.

## Overview

**2nd Semester Study Hub** centralizes:
- Unit-wise notes
- Previous Year Questions (PYQs)
- Answer keys / solutions
- Formula sheets
- Quick study shortcuts (practice, roadmap, formulas)

The app is optimized for fast navigation and repeat usage during exam preparation.

## Key Features

- **Single dashboard for all subjects** with intuitive card-based navigation.
- **Three-level content flow**: Subject → Content Type → Item.
- **Dynamic home widgets**:
  - Greeting by time of day
  - Exam countdown banner
  - Continue-learning shortcut via `localStorage`
  - Dynamic subject/unit/PYQ stats
- **PWA support**:
  - Installable on mobile/desktop
  - Offline fallback page
  - Service worker caching
  - App manifest with icons and theme setup
- **Semester-specific organization** for:
  - Mathematics-II
  - Applied Physics-II
  - IT Systems Theory
  - FEEE
  - Engineering Mechanics

## Tech Stack

- **HTML5** for page structure
- **CSS3** for UI styling and responsive layout
- **Vanilla JavaScript (ES6+)** for app logic and state management
- **Service Worker + Web App Manifest** for PWA capabilities

No framework dependency is required.

## Project Structure

```text
.
├── index.html                  # App shell and primary UI screens
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker
├── offline.html                # Offline fallback
├── css/
│   └── main.css                # Main styling
├── js/
│   ├── app.js                  # UI logic, state, navigation, widgets
│   └── data.js                 # Centralized content metadata
├── Applied-Physics-II/
├── Engineering-Mechanics/
├── FEEE/
├── IT-Systems-Theory/
├── Mathematics-II/
└── Practice_question/
```

## Getting Started

### 1) Clone the repository

```bash
git clone https://github.com/pabitra27706-oss/Diploma-2nd-sem.git
cd Diploma-2nd-sem
```

### 2) Run locally

Use any static file server. Examples:

```bash
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080`

> Note: Some PWA behaviors (especially service worker scope/update behavior) are best tested over localhost with a static server.

## Usage Flow

1. Open the app and click **Get Started**.
2. Select a subject from the home dashboard.
3. Choose content type (Units, PYQs, Answers, Formula Sheet).
4. Open the desired topic/paper.
5. Use quick links for practice and roadmap navigation.

## PWA Notes

- The app registers a service worker on load.
- If a newer service worker is installed, the app can notify users about updates.
- Manifest and icon metadata are configured for install prompts and home-screen launch.

## Content Maintenance Guide

To add or update content:

1. Add/update the target HTML resource inside the relevant subject folder.
2. Update `js/data.js` to register the new file in the proper subject/type/item list.
3. Verify navigation from the main app screen.
4. Refresh service worker cache if required for deployment.

## Quality Checklist (Recommended)

Before release:

- Verify each subject card opens correctly.
- Validate all PYQ and answer links.
- Check formula sheet links.
- Test app installability on Android/desktop.
- Confirm offline fallback behavior.
- Run JavaScript syntax check:

```bash
node --check js/app.js
```

## Roadmap Ideas

- Search across units and PYQs
- Bookmark/favorites for frequently revised topics
- Revision streak tracking
- Lightweight analytics for study habits
- Optional dark/light theme toggle

## Contributing

If you’re extending this project:

1. Keep content metadata centralized in `js/data.js`.
2. Preserve navigation consistency across all subjects.
3. Prefer small, focused pull requests with clear testing notes.

## License

Add your preferred license (e.g., MIT) in a `LICENSE` file.

---

Built for students, focused on exam-day readiness.
