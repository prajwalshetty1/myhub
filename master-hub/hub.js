// MyHub - Personal Command Center - Main JavaScript

// ===== STATE MANAGEMENT =====
const HubState = {
  // Initialize state from localStorage or defaults
  init() {
    // Theme
    const savedTheme = localStorage.getItem('hubTheme') || 'cosmic';
    document.body.setAttribute('data-theme', savedTheme);
    
    // User data
    this.userData = JSON.parse(localStorage.getItem('hubUserData') || '{"name": "Prajwal", "birthDate": "1991-04-12T12:30:00", "birthPlace": "Bhiwandi, Maharashtra, India"}');
    
    // Gamification
    this.gamification = JSON.parse(localStorage.getItem('hubGamification') || '{"totalXP": 0, "weeklyXP": 0, "level": 1, "achievements": [], "streaks": {}}');
    
    // Habits
    this.habits = JSON.parse(localStorage.getItem('phoenixHabits') || '[]');
    this.habitLogs = JSON.parse(localStorage.getItem('phoenixHabitLogs') || '{}');
    
    // Intentions
    this.intentions = JSON.parse(localStorage.getItem('hubIntentions') || '{}');
    
    // Activity log
    this.activityLog = JSON.parse(localStorage.getItem('hubActivityLog') || '[]');
    
    this.updateThemeIcon();
  },

  // Save to localStorage
  save() {
    localStorage.setItem('hubTheme', document.body.getAttribute('data-theme'));
    localStorage.setItem('hubUserData', JSON.stringify(this.userData));
    localStorage.setItem('hubGamification', JSON.stringify(this.gamification));
    localStorage.setItem('phoenixHabits', JSON.stringify(this.habits));
    localStorage.setItem('phoenixHabitLogs', JSON.stringify(this.habitLogs));
    localStorage.setItem('hubIntentions', JSON.stringify(this.intentions));
    localStorage.setItem('hubActivityLog', JSON.stringify(this.activityLog));
  },

  updateThemeIcon() {
    const theme = document.body.getAttribute('data-theme');
    const icon = document.getElementById('themeToggle');
    const icons = {
      'cosmic': '🌌',
      'light': '☀️',
      'forest': '🌲',
      'ocean': '🌊',
      'sunset': '🌅',
      'midnight': '🌑'
    };
    if (icon) icon.textContent = icons[theme] || '🌙';
  },

  logActivity(action, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      details
    };
    this.activityLog.unshift(entry);
    // Keep only last 1000 entries
    if (this.activityLog.length > 1000) {
      this.activityLog = this.activityLog.slice(0, 1000);
    }
    this.save();
  }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  // Get current date in YYYY-MM-DD format
  getToday() {
    return new Date().toISOString().split('T')[0];
  },

  // Format date
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Ethiopian calendar conversion
  gregorianToEthiopian(year, month, day) {
    // Simplified Ethiopian calendar conversion
    // Note: This is a simplified version - full conversion is more complex
    const ethiopianMonths = [
      'Meskerem', 'Tikimt', 'Hidar', 'Tahesas', 'Tir', 'Yekatit',
      'Megabit', 'Miazia', 'Genbot', 'Sene', 'Hamle', 'Nehase', 'Pagumen'
    ];
    
    // Approximate conversion (simplified)
    let ethYear = year - 8;
    if (month < 9 || (month === 9 && day < 11)) {
      ethYear -= 1;
    }
    
    const ethMonth = Math.floor((month - 1) / 30) % 13;
    const ethDay = ((day - 1) % 30) + 1;
    
    return `${ethDay} ${ethiopianMonths[ethMonth]} ${ethYear}`;
  },

  // Generate random number
  random(min, max) {
    return Math.random() * (max - min) + min;
  },

  // Create particles animation
  createParticles(element, count = 20) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      particle.style.animationDelay = (i * 0.05) + 's';
      
      // Random direction
      const angle = (Math.PI * 2 * i) / count;
      const distance = Utils.random(50, 100);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      particle.style.setProperty('--dx', x + 'px');
      particle.style.setProperty('--dy', y + 'px');
      particle.style.transform = `translate(${x}px, ${y}px)`;
      
      document.body.appendChild(particle);
      
      setTimeout(() => particle.remove(), 2000);
    }
  }
};

// ===== CLOCK AND DATE =====
const Clock = {
  init() {
    this.update();
    setInterval(() => this.update(), 1000);
  },

  update() {
    const now = new Date();
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('currentDate');
    const ethDateEl = document.getElementById('ethiopianDate');
    
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    if (dateEl) {
      dateEl.textContent = Utils.formatDate(now);
    }
    
    if (ethDateEl) {
      const ethDate = Utils.gregorianToEthiopian(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
      );
      ethDateEl.textContent = ethDate;
    }
  }
};

// ===== GREETING =====
const Greeting = {
  update() {
    const hour = new Date().getHours();
    const greetingEl = document.getElementById('greeting');
    
    if (!greetingEl) return;
    
    let greeting;
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    greetingEl.textContent = greeting;
  }
};

// ===== THEME SYSTEM =====
const Theme = {
  themes: ['cosmic', 'light', 'forest', 'ocean', 'sunset', 'midnight'],
  currentIndex: 0,

  init() {
    const currentTheme = document.body.getAttribute('data-theme');
    this.currentIndex = this.themes.indexOf(currentTheme);
    if (this.currentIndex === -1) {
      this.currentIndex = 0;
      document.body.setAttribute('data-theme', this.themes[0]);
    }
  },

  toggle() {
    this.currentIndex = (this.currentIndex + 1) % this.themes.length;
    const newTheme = this.themes[this.currentIndex];
    document.body.setAttribute('data-theme', newTheme);
    HubState.updateThemeIcon();
    HubState.save();
    HubState.logActivity('theme_changed', { theme: newTheme });
  }
};

// ===== STARFIELD ANIMATION =====
const Starfield = {
  init() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    // Create stars
    const starCount = 200;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Utils.random(0, 100) + '%';
      star.style.top = Utils.random(0, 100) + '%';
      star.style.width = Utils.random(1, 3) + 'px';
      star.style.height = star.style.width;
      star.style.animationDuration = Utils.random(2, 5) + 's';
      star.style.animationDelay = Utils.random(0, 2) + 's';
      starfield.appendChild(star);
    }
  }
};

// ===== HABIT TRACKER =====
const HabitTracker = {
  init() {
    this.loadHabits();
    this.render();
  },

  loadHabits() {
    // Default habits if none exist
    if (HubState.habits.length === 0) {
      HubState.habits = [
        { id: 1, name: 'Morning Meditation', category: 'Morning Routine' },
        { id: 2, name: 'Exercise', category: 'Health' },
        { id: 3, name: 'Read for 30 min', category: 'Productivity' },
        { id: 4, name: 'Evening Reflection', category: 'Evening Routine' }
      ];
      HubState.save();
    }
  },

  render() {
    const habitListEl = document.getElementById('habitList');
    const progressEl = document.getElementById('habitProgress');
    const streakEl = document.getElementById('habitStreak');
    
    if (!habitListEl) return;

    const today = Utils.getToday();
    const todayLogs = HubState.habitLogs[today] || [];
    const completedCount = todayLogs.length;
    const totalCount = HubState.habits.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // Render habits
    habitListEl.innerHTML = HubState.habits.map(habit => {
      const isCompleted = todayLogs.includes(habit.id);
      const streak = this.getHabitStreak(habit.id);
      
      return `
        <div class="habit-item">
          <input 
            type="checkbox" 
            class="habit-checkbox" 
            data-habit-id="${habit.id}"
            ${isCompleted ? 'checked' : ''}
          >
          <span class="habit-name">${habit.name}</span>
          <span class="habit-streak">🔥 ${streak} days</span>
        </div>
      `;
    }).join('');

    // Update progress
    if (progressEl) {
      progressEl.style.width = progress + '%';
    }

    // Update streak
    if (streakEl) {
      const overallStreak = this.getOverallStreak();
      streakEl.textContent = `🔥 ${overallStreak} day streak`;
    }

    // Add event listeners
    habitListEl.querySelectorAll('.habit-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.toggleHabit(parseInt(e.target.dataset.habitId));
      });
    });
  },

  toggleHabit(habitId) {
    const today = Utils.getToday();
    if (!HubState.habitLogs[today]) {
      HubState.habitLogs[today] = [];
    }

    const index = HubState.habitLogs[today].indexOf(habitId);
    if (index > -1) {
      HubState.habitLogs[today].splice(index, 1);
      HubState.logActivity('habit_unchecked', { habitId });
    } else {
      HubState.habitLogs[today].push(habitId);
      HubState.logActivity('habit_checked', { habitId });
      // Award XP
      Gamification.awardXP(15, 'habit_completed');
    }

    HubState.save();
    this.render();
  },

  getHabitStreak(habitId) {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const logs = HubState.habitLogs[dateKey] || [];
      
      if (logs.includes(habitId)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  },

  getOverallStreak() {
    let streak = 0;
    const today = new Date();
    const totalHabits = HubState.habits.length;
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const logs = HubState.habitLogs[dateKey] || [];
      
      if (logs.length === totalHabits && totalHabits > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  }
};

// ===== INTENTION WIDGET =====
const IntentionWidget = {
  init() {
    const sendMorningBtn = document.getElementById('sendMorningIntention');
    const sendEveningBtn = document.getElementById('sendEveningGratitude');
    const morningInput = document.getElementById('morningIntention');
    const eveningInput = document.getElementById('eveningGratitude');

    if (sendMorningBtn) {
      sendMorningBtn.addEventListener('click', () => {
        this.sendIntention('morning', morningInput.value);
      });
    }

    if (sendEveningBtn) {
      sendEveningBtn.addEventListener('click', () => {
        this.sendIntention('evening', eveningInput.value);
      });
    }

    // Load saved intentions
    this.loadIntentions();
  },

  sendIntention(type, text) {
    if (!text.trim()) return;

    const today = Utils.getToday();
    if (!HubState.intentions[today]) {
      HubState.intentions[today] = {};
    }

    HubState.intentions[today][type] = {
      text,
      timestamp: new Date().toISOString()
    };

    HubState.save();
    HubState.logActivity(`${type}_intention_sent`, { text });

    // Show animation
    this.showUniverseAnimation();

    // Clear input
    const input = document.getElementById(
      type === 'morning' ? 'morningIntention' : 'eveningGratitude'
    );
    if (input) input.value = '';

    // Create particles
    const button = document.getElementById(
      type === 'morning' ? 'sendMorningIntention' : 'sendEveningGratitude'
    );
    if (button) {
      Utils.createParticles(button, 30);
    }
  },

  loadIntentions() {
    const today = Utils.getToday();
    const intentions = HubState.intentions[today] || {};
    
    const morningInput = document.getElementById('morningIntention');
    const eveningInput = document.getElementById('eveningGratitude');

    if (morningInput && intentions.morning) {
      morningInput.value = intentions.morning.text;
    }

    if (eveningInput && intentions.evening) {
      eveningInput.value = intentions.evening.text;
    }
  },

  showUniverseAnimation() {
    const overlay = document.getElementById('universeOverlay');
    if (!overlay) return;

    overlay.classList.add('active');
    setTimeout(() => {
      overlay.classList.remove('active');
    }, 3000);
  }
};

// ===== QUICK CAPTURE =====
const QuickCapture = {
  init() {
    const fab = document.getElementById('quickCaptureFab');
    const menu = document.getElementById('quickCaptureMenu');
    
    if (fab && menu) {
      fab.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!fab.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.remove('active');
        }
      });

      // Handle menu items
      menu.querySelectorAll('.quick-capture-item').forEach(item => {
        item.addEventListener('click', () => {
          const action = item.dataset.action;
          this.handleAction(action);
          menu.classList.remove('active');
        });
      });
    }
  },

  handleAction(action) {
    HubState.logActivity('quick_capture', { action });
    
    switch (action) {
      case 'inbox':
        alert('Inbox capture - to be implemented');
        break;
      case 'task':
        alert('Task feature removed - Trading Planner available');
        break;
      case 'idea':
        alert('Idea capture - to be implemented');
        break;
      case 'note':
        alert('Quick note - to be implemented');
        break;
    }
  }
};

// ===== GAMIFICATION =====
const Gamification = {
  xpThresholds: [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000],
  levelNames: [
    'Phoenix Initiate', 'Rising Spark', 'Flame Seeker', 'Fire Walker',
    'Blaze Runner', 'Ember Knight', 'Inferno Sage', 'Solar Guardian',
    'Celestial Phoenix', 'Phoenix Master'
  ],

  awardXP(amount, reason) {
    HubState.gamification.totalXP += amount;
    HubState.gamification.weeklyXP += amount;
    
    const oldLevel = HubState.gamification.level;
    const newLevel = this.calculateLevel(HubState.gamification.totalXP);
    
    if (newLevel > oldLevel) {
      HubState.gamification.level = newLevel;
      this.showLevelUp(newLevel);
    }
    
    HubState.save();
    HubState.logActivity('xp_awarded', { amount, reason, newLevel });
  },

  calculateLevel(xp) {
    for (let i = this.xpThresholds.length - 1; i >= 0; i--) {
      if (xp >= this.xpThresholds[i]) {
        return i + 1;
      }
    }
    return 1;
  },

  showLevelUp(level) {
    alert(`🎉 Level Up! You are now ${this.levelNames[level - 1]} (Level ${level})!`);
  }
};

// ===== MODAL SYSTEM =====
const Modal = {
  init() {
    // Shortcuts modal
    const shortcutsBtn = document.getElementById('shortcutsBtn');
    const shortcutsModal = document.getElementById('shortcutsModal');
    const closeShortcuts = document.getElementById('closeShortcutsModal');

    if (shortcutsBtn && shortcutsModal) {
      shortcutsBtn.addEventListener('click', () => this.open('shortcutsModal'));
    }
    if (closeShortcuts) {
      closeShortcuts.addEventListener('click', () => this.close('shortcutsModal'));
    }

    // Activity log modal
    const activityLogBtn = document.getElementById('activityLogBtn');
    const activityLogModal = document.getElementById('activityLogModal');
    const closeActivityLog = document.getElementById('closeActivityLogModal');

    if (activityLogBtn && activityLogModal) {
      activityLogBtn.addEventListener('click', () => {
        this.open('activityLogModal');
        this.renderActivityLog();
      });
    }
    if (closeActivityLog) {
      closeActivityLog.addEventListener('click', () => this.close('activityLogModal'));
    }

    // Control centre modal
    const controlCentreBtn = document.getElementById('controlCentreBtn');
    const controlCentreModal = document.getElementById('controlCentreModal');
    const closeControlCentre = document.getElementById('closeControlCentreModal');

    if (controlCentreBtn && controlCentreModal) {
      controlCentreBtn.addEventListener('click', () => {
        this.open('controlCentreModal');
        this.renderControlCentre();
      });
    }
    if (closeControlCentre) {
      closeControlCentre.addEventListener('click', () => this.close('controlCentreModal'));
    }

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.close(overlay.id);
        }
      });
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
          this.close(modal.id);
        });
      }
    });
  },

  open(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  },

  close(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  },

  renderActivityLog() {
    const content = document.getElementById('activityLogContent');
    if (!content) return;

    const logs = HubState.activityLog.slice(0, 50); // Show last 50
    
    if (logs.length === 0) {
      content.innerHTML = '<p>No activity logged yet.</p>';
      return;
    }

    content.innerHTML = logs.map(log => {
      const date = new Date(log.timestamp);
      return `
        <div style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div style="font-weight: 600;">${log.action}</div>
          <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">
            ${date.toLocaleString()}
          </div>
        </div>
      `;
    }).join('');
  },

  renderControlCentre() {
    const content = document.getElementById('controlCentreContent');
    if (!content) return;

    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <h3 style="margin-bottom: 1rem;">Quick Settings</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label>
              <input type="checkbox"> Enable Notifications
            </label>
            <label>
              <input type="checkbox"> Enable Sounds
            </label>
          </div>
        </div>
        <div>
          <h3 style="margin-bottom: 1rem;">Data Management</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button class="btn btn-primary" onclick="DataExport.export()">Export All Data</button>
            <button class="btn" onclick="document.getElementById('importFileInput').click()">Import Data</button>
          </div>
        </div>
        <div>
          <h3 style="margin-bottom: 1rem;">Statistics</h3>
          <div>
            <p>Level: ${Gamification.levelNames[HubState.gamification.level - 1]} (${HubState.gamification.level})</p>
            <p>Total XP: ${HubState.gamification.totalXP}</p>
            <p>Weekly XP: ${HubState.gamification.weeklyXP}</p>
          </div>
        </div>
      </div>
    `;
  }
};

// ===== KEYBOARD SHORTCUTS =====
const Shortcuts = {
  init() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+K - Quick command palette
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        alert('Quick command palette - to be implemented');
      }

      // Ctrl+N - New trade (Trading Planner)
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        window.location.href = 'modules/trading-planner/index.html';
      }
    });

    this.renderShortcuts();
  },

  renderShortcuts() {
    const content = document.getElementById('shortcutsContent');
    if (!content) return;

    const shortcuts = [
      { keys: 'Ctrl+K', description: 'Open quick command palette' },
      { keys: 'Ctrl+N', description: 'Open Trading Planner' },
      { keys: 'Esc', description: 'Close modals' },
      { keys: 'Ctrl+,', description: 'Open settings' }
    ];

    content.innerHTML = shortcuts.map(s => `
      <div style="display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <span>${s.description}</span>
        <kbd style="background: var(--bg-card); padding: 0.25rem 0.5rem; border-radius: 4px;">${s.keys}</kbd>
      </div>
    `).join('');
  }
};

// ===== DATA EXPORT/IMPORT =====
const DataExport = {
  export() {
    const data = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      hubData: {
        theme: document.body.getAttribute('data-theme'),
        userData: HubState.userData,
        gamification: HubState.gamification,
        habits: HubState.habits,
        habitLogs: HubState.habitLogs,
        intentions: HubState.intentions,
        activityLog: HubState.activityLog
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-hub-backup-${Utils.getToday()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    HubState.logActivity('data_exported');
  },

  import(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.version && data.hubData) {
          // Import data
          if (data.hubData.theme) {
            document.body.setAttribute('data-theme', data.hubData.theme);
            Theme.init();
            HubState.updateThemeIcon();
          }
          
          if (data.hubData.userData) HubState.userData = data.hubData.userData;
          if (data.hubData.gamification) HubState.gamification = data.hubData.gamification;
          if (data.hubData.habits) HubState.habits = data.hubData.habits;
          if (data.hubData.habitLogs) HubState.habitLogs = data.hubData.habitLogs;
          if (data.hubData.intentions) HubState.intentions = data.hubData.intentions;
          if (data.hubData.activityLog) HubState.activityLog = data.hubData.activityLog;

          HubState.save();
          HubState.logActivity('data_imported');
          
          // Reload page to reflect changes
          location.reload();
        } else {
          alert('Invalid backup file format');
        }
      } catch (error) {
        alert('Error importing data: ' + error.message);
      }
    };
    reader.readAsText(file);
  }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize state
  HubState.init();
  
  // Initialize components
  Clock.init();
  Greeting.update();
  Theme.init();
  Starfield.init();
  HabitTracker.init();
  IntentionWidget.init();
  QuickCapture.init();
  Modal.init();
  Shortcuts.init();

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => Theme.toggle());
  }

  // Export button
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => DataExport.export());
  }

  // Import button
  const importBtn = document.getElementById('importBtn');
  const importFileInput = document.getElementById('importFileInput');
  if (importBtn && importFileInput) {
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        DataExport.import(e.target.files[0]);
      }
    });
  }

  // Log initialization
  HubState.logActivity('hub_initialized');
});

// ===== STORAGE EVENT LISTENER (for cross-tab sync) =====
window.addEventListener('storage', (e) => {
  // Reload relevant data when localStorage changes in another tab
  if (e.key && e.key.startsWith('hub') || e.key.startsWith('phoenix')) {
    HubState.init();
    HabitTracker.render();
    IntentionWidget.loadIntentions();
  }
});

