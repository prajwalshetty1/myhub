# MyHub - Personal Command Center

A comprehensive Progressive Web App (PWA) for personal productivity and life management, built with Vanilla JavaScript, Node.js, Express, and Supabase.

![MyHub](https://img.shields.io/badge/MyHub-Personal%20Command%20Center-purple)
![License](https://img.shields.io/badge/license-ISC-blue)

## 🌟 Features

- **6 Main Modules:**
  - 🔥 Phoenix Planner: AI-powered daily planning with astrology integration
  - ✅ Task Tracker: Kanban board task management
  - 🥗 Diet Planner: Nutrition tracking & intermittent fasting
  - 📈 Trading Planner: Futures & stocks trading journal
  - 📚 Learning 2026: Learning goals tracker
  - 📊 Project Tracker: Project management

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
  - PostgreSQL database (Supabase)
  - User authentication

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account (free tier works)
- Vercel account (free tier works)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prajwalshetty1/myhub.git
   cd myhub
   ```

2. **Set up Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Run the SQL schema from `backend/migrations/schema.sql` in Supabase SQL Editor

3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your Supabase credentials
   npm run dev
   ```

4. **Frontend Setup:**
   ```bash
   cd master-hub
   python3 -m http.server 8000
   # Or use any static file server
   ```

5. **Access the application:**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:3000

## 📦 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set build command: (none - static site)
4. Set output directory: `master-hub`
5. Add environment variable: `VITE_API_URL` (your backend URL)

### Backend (Vercel or Railway)

The backend can be deployed to Vercel as serverless functions or to Railway/Render.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🗄️ Database (Supabase)

This project uses Supabase (PostgreSQL) for data storage. 

- Create a Supabase project
- Run the migration SQL from `backend/migrations/schema.sql`
- Get connection details from Supabase dashboard
- Update `backend/.env` with Supabase credentials

## 📁 Project Structure

```
myhub/
├── backend/              # Node.js/Express API
│   ├── routes/          # API route handlers
│   ├── middleware/      # Auth middleware
│   ├── config/          # Database config
│   ├── migrations/      # Database schema
│   └── server.js        # Express server
├── master-hub/          # Frontend PWA
│   ├── modules/         # Individual modules
│   ├── scripts/         # API client and utilities
│   └── index.html       # Main hub page
└── README.md
```

## 🔐 Authentication

- JWT-based authentication
- User registration and login
- Secure password hashing with bcrypt
- Token stored in localStorage

## 🛠️ Tech Stack

**Frontend:**
- Vanilla JavaScript
- HTML5/CSS3
- PWA (Service Worker, Manifest)

**Backend:**
- Node.js
- Express.js
- PostgreSQL (via Supabase)
- JWT authentication
- bcryptjs

## 📝 API Documentation

See [backend/README.md](./backend/README.md) for complete API documentation.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License

## 👤 Author

**Prajwal Shetty**

- GitHub: [@prajwalshetty1](https://github.com/prajwalshetty1)
- Project: [MyHub](https://github.com/prajwalshetty1/myhub)

## 🙏 Acknowledgments

- Built with love for personal productivity
- Inspired by the need for a unified life management system

---

⭐ Star this repo if you find it helpful!

