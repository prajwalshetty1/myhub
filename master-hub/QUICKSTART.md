# Quick Start Guide

## Getting Started

1. **Open the Application**
   - Open `index.html` in a modern web browser
   - Or use a local server (recommended):
     ```bash
     cd master-hub
     python3 -m http.server 8000
     ```
     Then open: http://localhost:8000

2. **First Use**
   - The app will initialize with default settings
   - Your name "Prajwal" is pre-set
   - Default habits are already configured
   - All data is stored in browser localStorage

3. **Key Features to Try**
   - Click the theme toggle button (🌙) to cycle through 6 themes
   - Set morning intentions and evening gratitude
   - Check off habits to build streaks
   - Export your data via the export button
   - Use keyboard shortcuts (Ctrl+K for command palette)

4. **Modules**
   - Click on any module card to navigate to that module
   - Modules are currently placeholders but structure is ready
   - Each module can be developed independently

## Data Storage

- All data is stored in browser localStorage
- Use Export button to backup your data
- Use Import button to restore from backup
- Data persists across browser sessions

## Browser Requirements

- Modern browser with localStorage support
- Service Worker support for PWA features (optional)
- JavaScript enabled

## Troubleshooting

- If themes don't change: Clear browser cache and reload
- If data doesn't persist: Check that localStorage is enabled
- For PWA installation: Service worker must be registered (requires HTTPS or localhost)

