// Daily Journal App
const Journal = {
  entries: [],
  selectedDate: new Date().toISOString().split('T')[0],
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),

  async init() {
    await this.loadEntries();
    this.setupEventListeners();
    this.renderCalendar();
    this.updateStats();
    this.loadEntryForDate(this.selectedDate);
    this.updateCurrentDate();
  },

  getClient() {
    return window.SupabaseClient || window.API;
  },

  async loadEntries() {
    try {
      const client = this.getClient();
      
      // Try journal-specific method first, fallback to generic API
      if (client.getJournalEntries) {
        this.entries = await client.getJournalEntries();
      } else {
        this.entries = await client.request('/journal');
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
      this.entries = [];
    }
  },

  setupEventListeners() {
    // Save button
    document.getElementById('saveBtn').addEventListener('click', () => this.saveEntry());

    // Word count
    const contentArea = document.getElementById('entryContent');
    contentArea.addEventListener('input', () => {
      const words = contentArea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
      document.getElementById('wordCount').textContent = words;
    });

    // Calendar navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.renderCalendar();
    });

    // Auto-save every 30 seconds
    setInterval(() => {
      if (this.hasUnsavedChanges()) {
        this.saveEntry(true); // Silent save
      }
    }, 30000);
  },

  renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('calendarMonth').textContent = 
      `${monthNames[this.currentMonth]} ${this.currentYear}`;

    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const today = new Date().toISOString().split('T')[0];

    grid.innerHTML = '';

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day other-month';
      grid.appendChild(cell);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      cell.textContent = day;
      
      if (dateStr === today) {
        cell.classList.add('today');
      }
      
      if (dateStr === this.selectedDate) {
        cell.classList.add('selected');
      }
      
      if (this.hasEntryForDate(dateStr)) {
        cell.classList.add('has-entry');
      }

      cell.addEventListener('click', () => {
        this.selectDate(dateStr);
      });

      grid.appendChild(cell);
    }
  },

  hasEntryForDate(date) {
    return this.entries.some(entry => entry.date === date);
  },

  selectDate(date) {
    this.selectedDate = date;
    this.renderCalendar();
    this.loadEntryForDate(date);
  },

  loadEntryForDate(date) {
    const entry = this.entries.find(e => e.date === date);
    
    if (entry) {
      document.getElementById('entryTitle').value = entry.title || '';
      document.getElementById('entryContent').value = entry.content || '';
      document.getElementById('moodSelector').value = entry.mood || '';
      document.getElementById('tagsInput').value = entry.tags ? entry.tags.join(', ') : '';
      
      // Update word count
      const words = entry.content ? entry.content.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
      document.getElementById('wordCount').textContent = words;
    } else {
      // Clear form for new entry
      document.getElementById('entryTitle').value = '';
      document.getElementById('entryContent').value = '';
      document.getElementById('moodSelector').value = '';
      document.getElementById('tagsInput').value = '';
      document.getElementById('wordCount').textContent = '0';
    }
  },

  hasUnsavedChanges() {
    const entry = this.entries.find(e => e.date === this.selectedDate);
    const currentContent = document.getElementById('entryContent').value;
    
    if (!entry && currentContent.trim().length > 0) {
      return true;
    }
    
    if (entry && entry.content !== currentContent) {
      return true;
    }
    
    return false;
  },

  async saveEntry(silent = false) {
    const title = document.getElementById('entryTitle').value;
    const content = document.getElementById('entryContent').value;
    const mood = document.getElementById('moodSelector').value;
    const tagsInput = document.getElementById('tagsInput').value;
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

    if (!content.trim()) {
      if (!silent) {
        this.showToast('Please write something before saving!');
      }
      return;
    }

    try {
      const client = this.getClient();
      
      const entryData = {
        date: this.selectedDate,
        title,
        content,
        mood,
        tags
      };

      let saved;
      if (client.saveJournalEntry) {
        saved = await client.saveJournalEntry(entryData);
      } else {
        saved = await client.request('/journal', {
          method: 'POST',
          body: JSON.stringify(entryData)
        });
      }

      // Update local entries
      const existingIndex = this.entries.findIndex(e => e.date === this.selectedDate);
      if (existingIndex >= 0) {
        this.entries[existingIndex] = saved;
      } else {
        this.entries.push(saved);
      }

      this.renderCalendar();
      this.updateStats();

      if (!silent) {
        this.showToast('Entry saved successfully! ✓');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      if (!silent) {
        this.showToast('Failed to save entry. Please try again.');
      }
    }
  },

  updateStats() {
    // Total entries
    document.getElementById('totalEntries').textContent = this.entries.length;

    // Current streak
    const streak = this.calculateStreak();
    document.getElementById('currentStreak').textContent = `${streak} day${streak !== 1 ? 's' : ''}`;

    // This month entries
    const monthEntries = this.entries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate.getMonth() === new Date().getMonth() && 
             entryDate.getFullYear() === new Date().getFullYear();
    }).length;
    document.getElementById('monthEntries').textContent = monthEntries;
  },

  calculateStreak() {
    if (this.entries.length === 0) return 0;

    const sortedDates = this.entries
      .map(e => new Date(e.date))
      .sort((a, b) => b - a);

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entryDate of sortedDates) {
      entryDate.setHours(0, 0, 0, 0);
      
      if (entryDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (entryDate < currentDate) {
        break;
      }
    }

    return streak;
  },

  updateCurrentDate() {
    const date = new Date(this.selectedDate);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = date.toLocaleDateString('en-US', options);
  },

  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  Journal.init();
});

