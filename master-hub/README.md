# MyHub - Personal Command Center

A comprehensive Progressive Web App (PWA) built with pure Vanilla JavaScript, HTML, and CSS for personal productivity and life management.

## Features

- **6 Main Modules:**
  - Phoenix Planner: AI-powered daily planning with astrology integration
  - Task Tracker: Kanban board task management
  - Diet Planner: Nutrition tracking & intermittent fasting
  - Trading Planner: Futures & stocks trading journal
  - Learning 2026: Learning goals tracker
  - Project Tracker: Project management

- **Core Features:**
  - 6 Beautiful Themes (Cosmic Dark, Light, Forest, Ocean, Sunset, Midnight)
  - Habit Tracker with streak tracking
  - Daily Intention & Gratitude widgets
  - Gamification system with XP and levels
  - Activity logging
  - PWA support for offline use and mobile installation
  - Export/Import data functionality
  - Keyboard shortcuts
  - Cross-module integration

## Getting Started

1. Open `index.html` in a modern web browser
2. The app will initialize with default settings
3. All data is stored locally in your browser's localStorage

## Structure

```
master-hub/
├── index.html          # Main hub page
├── hub.css            # Main stylesheet with design system
├── hub.js             # Core JavaScript
├── sw.js              # Service worker for PWA
├── manifest.json      # PWA manifest
├── modules/           # Individual module folders
│   ├── phoenix-planner/
│   ├── task-tracker/
│   ├── diet-planner/
│   ├── trading-planner/
│   ├── learning-2026/
│   └── project-tracker/
├── scripts/           # Shared scripts
└── icons/             # PWA icons (to be added)
```

## Browser Support

- Modern browsers with localStorage support
- Service Worker support for PWA features
- Works best in Chrome, Firefox, Safari, and Edge

## Notes

- This is a client-side only application - no server required
- All data is stored in browser localStorage
- Regular backups via export functionality are recommended
- Some modules are placeholders and will be fully implemented

## License

Personal project - use as you wish!

