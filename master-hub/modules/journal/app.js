// Advanced Journal App - Updated for New UI
const AdvancedJournal = {
  entries: [],
  filteredEntries: [],
  selectedDate: new Date().toISOString().split('T')[0],
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  editor: null,
  currentEntry: null,
  analytics: null,
  
  // Journal Templates
  templates: [
    {
      title: '🌅 Morning Pages',
      description: 'Start your day with free-form writing',
      content: '<p><strong>Morning Reflection</strong></p><p><br></p><p>What am I grateful for today?</p><p><br></p><p>What are my intentions for today?</p><p><br></p><p>How am I feeling this morning?</p><p><br></p>'
    },
    {
      title: '🙏 Gratitude Journal',
      description: 'Focus on what you\'re thankful for',
      content: '<p><strong>Today I am grateful for:</strong></p><p><br></p><p>1. </p><p>2. </p><p>3. </p><p><br></p><p><strong>Why these things matter to me:</strong></p><p><br></p>'
    },
    {
      title: '🎯 Goals & Plans',
      description: 'Set and track your goals',
      content: '<p><strong>My Goals</strong></p><p><br></p><p><strong>Short-term goals:</strong></p><p><br></p><p><strong>Long-term goals:</strong></p><p><br></p><p><strong>Steps to take today:</strong></p><p><br></p>'
    },
    {
      title: '💭 Dream Journal',
      description: 'Record and reflect on your dreams',
      content: '<p><strong>Dream Entry</strong></p><p><br></p><p><strong>The Dream:</strong></p><p><br></p><p><strong>People/Places:</strong></p><p><br></p><p><strong>Emotions Felt:</strong></p><p><br></p><p><strong>Interpretation:</strong></p><p><br></p>'
    },
    {
      title: '🌙 Evening Reflection',
      description: 'End your day with reflection',
      content: '<p><strong>Evening Reflection</strong></p><p><br></p><p>What went well today?</p><p><br></p><p>What could I improve?</p><p><br></p><p>What did I learn?</p><p><br></p><p>What am I letting go of?</p><p><br></p>'
    },
    {
      title: '💡 Ideas & Brainstorm',
      description: 'Capture your creative thoughts',
      content: '<p><strong>Ideas & Brainstorming</strong></p><p><br></p><p><strong>Main Idea:</strong></p><p><br></p><p><strong>Related Thoughts:</strong></p><ul><li></li><li></li><li></li></ul><p><br></p><p><strong>Next Steps:</strong></p><p><br></p>'
    }
  ],

  async init() {
    console.log('🚀 Initializing Journal App...');
    await this.initEditor();
    await this.loadEntries();
    this.setupEventListeners();
    this.renderCalendar();
    this.updateStats();
    this.loadEntryForDate(this.selectedDate);
    this.updateSelectedDate();
    this.renderTemplates();
    console.log('✅ Journal App initialized successfully');
  },

  getClient() {
    if (window.SupabaseClient && window.location.hostname === 'localhost') {
      console.log('Using Supabase Direct Client');
      return window.SupabaseClient;
    }
    console.log('Using Backend API Client');
    return window.API;
  },

  // Initialize Quill Rich Text Editor
  initEditor() {
    this.editor = new Quill('#editor', {
      theme: 'snow',
      placeholder: 'Start writing your thoughts...',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'color': [] }, { 'background': [] }],
          ['blockquote', 'code-block'],
          ['link'],
          ['clean']
        ]
      }
    });

    // Update word count on text change
    this.editor.on('text-change', () => {
      this.updateWordCount();
    });
    
    console.log('📝 Editor initialized');
  },

  async loadEntries() {
    try {
      console.log('📚 Loading journal entries...');
      const client = this.getClient();
      
      if (client.getJournalEntries) {
        this.entries = await client.getJournalEntries();
      } else {
        this.entries = await client.request('/journal');
      }
      
      this.filteredEntries = [...this.entries];
      console.log(`✅ Loaded ${this.entries.length} entries`);
    } catch (error) {
      console.error('❌ Error loading journal entries:', error);
      this.entries = [];
      this.filteredEntries = [];
      this.showToast('Failed to load entries', 'error');
    }
  },

  setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        console.log('💾 Save button clicked');
        this.saveEntry();
      });
    }

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

    // Favorite button
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => {
        console.log('⭐ Favorite button clicked');
        this.toggleFavorite();
      });
    }

    // Filters
    document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
    document.getElementById('moodFilter').addEventListener('change', () => this.applyFilters());
    document.getElementById('favoritesOnly').addEventListener('change', () => this.applyFilters());

    // Modals
    document.getElementById('searchBtn').addEventListener('click', () => this.openSearch());
    document.getElementById('analyticsBtn').addEventListener('click', () => this.openAnalytics());
    document.getElementById('exportBtn').addEventListener('click', () => this.openExport());
    document.getElementById('templatesBtn').addEventListener('click', () => this.openTemplates());

    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.closeModal(e.target.dataset.modal);
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', () => {
        backdrop.parentElement.classList.remove('show');
      });
    });

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.performSearch(e.target.value);
      });
    }

    // Export
    const confirmExportBtn = document.getElementById('confirmExport');
    if (confirmExportBtn) {
      confirmExportBtn.addEventListener('click', () => this.exportEntries());
    }

    // Auto-save every 30 seconds
    setInterval(() => {
      if (this.hasUnsavedChanges()) {
        console.log('💾 Auto-saving...');
        this.saveEntry(true);
      }
    }, 30000);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        console.log('⌨️ Keyboard shortcut: Save');
        this.saveEntry();
      }
      // Ctrl/Cmd + K to search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        console.log('⌨️ Keyboard shortcut: Search');
        this.openSearch();
      }
    });
    
    console.log('✅ Event listeners set up');
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
      
      const entry = this.entries.find(e => e.date === dateStr);
      if (entry) {
        cell.classList.add('has-entry');
        if (entry.is_favorite) {
          cell.classList.add('has-favorite');
        }
      }

      cell.addEventListener('click', () => {
        this.selectDate(dateStr);
      });

      grid.appendChild(cell);
    }
  },

  selectDate(date) {
    console.log('📅 Selected date:', date);
    this.selectedDate = date;
    this.renderCalendar();
    this.loadEntryForDate(date);
    this.updateSelectedDate();
  },

  loadEntryForDate(date) {
    console.log('📖 Loading entry for date:', date);
    const entry = this.entries.find(e => e.date === date);
    this.currentEntry = entry;
    
    if (entry) {
      console.log('✅ Entry found:', entry);
      document.getElementById('entryTitle').value = entry.title || '';
      this.editor.root.innerHTML = entry.content || '';
      document.getElementById('categorySelector').value = entry.category || '';
      document.getElementById('moodSelector').value = entry.mood || '';
      document.getElementById('tagsInput').value = entry.tags ? entry.tags.join(', ') : '';
      
      // Update favorite button
      const favoriteBtn = document.getElementById('favoriteBtn');
      if (entry.is_favorite) {
        favoriteBtn.classList.add('active');
        favoriteBtn.querySelector('svg').setAttribute('fill', 'currentColor');
      } else {
        favoriteBtn.classList.remove('active');
        favoriteBtn.querySelector('svg').setAttribute('fill', 'none');
      }
    } else {
      console.log('📝 No entry found, creating new');
      // Clear form for new entry
      document.getElementById('entryTitle').value = '';
      this.editor.setText('');
      document.getElementById('categorySelector').value = '';
      document.getElementById('moodSelector').value = '';
      document.getElementById('tagsInput').value = '';
      const favoriteBtn = document.getElementById('favoriteBtn');
      favoriteBtn.classList.remove('active');
      favoriteBtn.querySelector('svg').setAttribute('fill', 'none');
    }
    
    this.updateWordCount();
  },

  updateWordCount() {
    const text = this.editor.getText().trim();
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById('wordCount').textContent = words;
  },

  hasUnsavedChanges() {
    if (!this.currentEntry) {
      return this.editor.getText().trim().length > 0;
    }
    
    const currentContent = this.editor.root.innerHTML;
    return this.currentEntry.content !== currentContent;
  },

  async saveEntry(silent = false) {
    console.log('💾 Saving entry...');
    
    const title = document.getElementById('entryTitle').value;
    const content = this.editor.root.innerHTML;
    const category = document.getElementById('categorySelector').value;
    const mood = document.getElementById('moodSelector').value;
    const tagsInput = document.getElementById('tagsInput').value;
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    const is_favorite = document.getElementById('favoriteBtn').classList.contains('active');

    console.log('📝 Entry data:', { title, category, mood, tags, is_favorite, contentLength: content.length });

    if (!this.editor.getText().trim()) {
      if (!silent) {
        this.showToast('Please write something before saving! ✍️', 'error');
      }
      console.log('⚠️ Cannot save empty entry');
      return;
    }

    try {
      const client = this.getClient();
      
      const entryData = {
        date: this.selectedDate,
        title,
        content,
        category,
        mood,
        tags,
        is_favorite
      };

      console.log('📤 Sending to API:', entryData);

      let saved;
      if (client.saveJournalEntry) {
        // Supabase direct client
        saved = await client.saveJournalEntry(
          entryData.date,
          entryData.title,
          entryData.content,
          entryData.mood,
          entryData.tags
        );
        // Update is_favorite separately if needed
        if (this.currentEntry && this.currentEntry.is_favorite !== is_favorite) {
          await client.request('journal_entries', 'PATCH', 
            { is_favorite }, 
            `user_id=is.null&date=eq.${this.selectedDate}`
          );
        }
      } else {
        // Backend API client
        saved = await client.request('/journal', {
          method: 'POST',
          body: JSON.stringify(entryData)
        });
      }

      console.log('✅ Entry saved:', saved);

      // Update local entries
      const existingIndex = this.entries.findIndex(e => e.date === this.selectedDate);
      if (existingIndex >= 0) {
        this.entries[existingIndex] = saved;
      } else {
        this.entries.push(saved);
      }
      
      this.currentEntry = saved;
      this.applyFilters();
      this.renderCalendar();
      this.updateStats();

      if (!silent) {
        this.showToast('Entry saved successfully! ✓', 'success');
      }
    } catch (error) {
      console.error('❌ Error saving entry:', error);
      if (!silent) {
        this.showToast('Failed to save entry. Please try again.', 'error');
      }
    }
  },

  async toggleFavorite() {
    const favoriteBtn = document.getElementById('favoriteBtn');
    const isFavorite = favoriteBtn.classList.contains('active');
    
    if (isFavorite) {
      favoriteBtn.classList.remove('active');
      favoriteBtn.querySelector('svg').setAttribute('fill', 'none');
    } else {
      favoriteBtn.classList.add('active');
      favoriteBtn.querySelector('svg').setAttribute('fill', 'currentColor');
    }
    
    // If entry exists, save immediately
    if (this.currentEntry) {
      try {
        const client = this.getClient();
        const result = await client.request(`/journal/${this.selectedDate}/favorite`, {
          method: 'PATCH'
        });
        
        const existingIndex = this.entries.findIndex(e => e.date === this.selectedDate);
        if (existingIndex >= 0) {
          this.entries[existingIndex] = result;
        }
        
        this.currentEntry = result;
        this.renderCalendar();
        this.updateStats();
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    }
  },

  applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const mood = document.getElementById('moodFilter').value;
    const favoritesOnly = document.getElementById('favoritesOnly').checked;
    
    this.filteredEntries = this.entries.filter(entry => {
      if (category && entry.category !== category) return false;
      if (mood && entry.mood !== mood) return false;
      if (favoritesOnly && !entry.is_favorite) return false;
      return true;
    });
    
    this.renderCalendar();
    this.updateStats();
  },

  updateStats() {
    // Total entries
    document.getElementById('totalEntries').textContent = this.filteredEntries.length;

    // Streak
    const streak = this.calculateStreak();
    document.getElementById('streakNum').textContent = streak;

    // Total words
    const totalWords = this.entries.reduce((sum, entry) => sum + (entry.word_count || 0), 0);
    const formattedWords = totalWords >= 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords;
    document.getElementById('totalWords').textContent = formattedWords;
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

  updateSelectedDate() {
    const date = new Date(this.selectedDate);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    const selectedDateEl = document.getElementById('selectedDate');
    if (selectedDateEl) {
      selectedDateEl.textContent = formattedDate;
    }
  },

  // Search functionality
  openSearch() {
    document.getElementById('searchModal').classList.add('show');
    document.getElementById('searchInput').focus();
  },

  async performSearch(query) {
    if (!query.trim()) {
      document.getElementById('searchResults').innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Start typing to search...</p>';
      return;
    }

    try {
      const client = this.getClient();
      let results;
      
      if (client.request) {
        results = await client.request(`/journal?search=${encodeURIComponent(query)}`);
      } else {
        // Fallback to client-side search
        results = this.entries.filter(entry => {
          const searchText = `${entry.title} ${entry.content}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        });
      }

      this.renderSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  },

  renderSearchResults(results) {
    const container = document.getElementById('searchResults');
    
    if (results.length === 0) {
      container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No results found</p>';
      return;
    }

    container.innerHTML = results.map(entry => {
      const contentText = entry.content.replace(/<[^>]*>/g, '').substring(0, 150);
      return `
        <div class="search-result-item" onclick="AdvancedJournal.selectDate('${entry.date}'); AdvancedJournal.closeModal('searchModal');">
          <div class="search-result-title">${entry.title || 'Untitled'} ${entry.is_favorite ? '⭐' : ''}</div>
          <div class="search-result-date">${new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div class="search-result-excerpt">${contentText}...</div>
        </div>
      `;
    }).join('');
  },

  // Analytics functionality
  async openAnalytics() {
    document.getElementById('analyticsModal').classList.add('show');
    await this.loadAnalytics();
  },

  async loadAnalytics() {
    try {
      const client = this.getClient();
      
      if (client.request) {
        this.analytics = await client.request('/journal/analytics/stats');
      } else {
        // Calculate analytics client-side as fallback
        this.analytics = this.calculateAnalytics();
      }

      this.renderAnalytics();
    } catch (error) {
      console.error('Error loading analytics:', error);
      this.analytics = this.calculateAnalytics();
      this.renderAnalytics();
    }
  },

  calculateAnalytics() {
    const overall = {
      total_entries: this.entries.length,
      total_words: this.entries.reduce((sum, e) => sum + (e.word_count || 0), 0),
      avg_words_per_entry: Math.round(this.entries.reduce((sum, e) => sum + (e.word_count || 0), 0) / this.entries.length) || 0,
      favorite_count: this.entries.filter(e => e.is_favorite).length
    };

    const moodDist = {};
    this.entries.forEach(e => {
      if (e.mood) {
        moodDist[e.mood] = (moodDist[e.mood] || 0) + 1;
      }
    });

    const categoryDist = {};
    this.entries.forEach(e => {
      if (e.category) {
        categoryDist[e.category] = (categoryDist[e.category] || 0) + 1;
      }
    });

    return {
      overall,
      mood_distribution: Object.entries(moodDist).map(([mood, count]) => ({ mood, count })),
      category_distribution: Object.entries(categoryDist).map(([category, count]) => ({ category, count }))
    };
  },

  renderAnalytics() {
    const { overall, mood_distribution, category_distribution } = this.analytics;

    // Overall stats
    document.getElementById('overallStats').innerHTML = `
      <div class="stat-item">
        <span class="stat-label">Total Entries</span>
        <span class="stat-value">${overall.total_entries}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Words</span>
        <span class="stat-value">${overall.total_words?.toLocaleString() || 0}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Avg Words/Entry</span>
        <span class="stat-value">${Math.round(overall.avg_words_per_entry || 0)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Favorites</span>
        <span class="stat-value">${overall.favorite_count}</span>
      </div>
    `;

    // Mood distribution
    const moodEmojis = {
      amazing: '😄',
      great: '😊',
      good: '🙂',
      okay: '😐',
      bad: '😔',
      terrible: '😢'
    };

    document.getElementById('moodChart').innerHTML = mood_distribution.map(m => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
        <span>${moodEmojis[m.mood] || ''} ${m.mood}</span>
        <span style="font-weight: 600;">${m.count}</span>
      </div>
    `).join('') || '<p style="color: var(--text-secondary); text-align: center;">No mood data yet</p>';

    // Category distribution
    const categoryEmojis = {
      personal: '📔',
      work: '💼',
      gratitude: '🙏',
      goals: '🎯',
      dreams: '💭',
      ideas: '💡'
    };

    document.getElementById('categoryChart').innerHTML = category_distribution.map(c => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
        <span>${categoryEmojis[c.category] || ''} ${c.category}</span>
        <span style="font-weight: 600;">${c.count}</span>
      </div>
    `).join('') || '<p style="color: var(--text-secondary); text-align: center;">No category data yet</p>';

    // Activity chart (simple representation)
    const monthlyStats = this.calculateMonthlyStats();
    document.getElementById('activityChart').innerHTML = monthlyStats.map(m => {
      const maxCount = Math.max(...monthlyStats.map(s => s.count));
      const barWidth = maxCount > 0 ? (m.count / maxCount * 100) : 0;
      return `
        <div style="margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.85rem;">
            <span>${m.month}</span>
            <span style="font-weight: 600;">${m.count}</span>
          </div>
          <div style="width: 100%; height: 24px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
            <div style="width: ${barWidth}%; height: 100%; background: var(--accent-gradient); transition: width 0.3s;"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  calculateMonthlyStats() {
    const stats = {};
    this.entries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      stats[monthKey] = (stats[monthKey] || 0) + 1;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return Object.entries(stats)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .map(([key, count]) => {
        const [year, month] = key.split('-');
        return {
          month: `${monthNames[parseInt(month) - 1]} ${year}`,
          count
        };
      });
  },

  // Export functionality
  openExport() {
    document.getElementById('exportModal').classList.add('show');
  },

  async exportEntries() {
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    const startDate = document.getElementById('exportStartDate').value;
    const endDate = document.getElementById('exportEndDate').value;
    
    try {
      const client = this.getClient();
      let url = `/journal/export?format=${format}`;
      
      if (startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      if (format === 'markdown') {
        const baseUrl = client.supabaseUrl ? `${client.supabaseUrl}/rest/v1` : (window.API ? `${window.API.API_BASE_URL || '/api'}` : '/api');
        const response = await fetch(`${baseUrl}${url}`, {
          headers: client.headers || (window.API ? window.API.getHeaders() : {})
        });
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `journal_export_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const data = await client.request(url);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `journal_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      this.showToast('Export completed successfully!', 'success');
      this.closeModal('exportModal');
    } catch (error) {
      console.error('Error exporting:', error);
      this.showToast('Export failed. Please try again.', 'error');
    }
  },

  // Templates functionality
  openTemplates() {
    document.getElementById('templatesModal').classList.add('show');
  },

  renderTemplates() {
    const container = document.getElementById('templatesGrid');
    container.innerHTML = this.templates.map((template, index) => `
      <div class="template-item" onclick="AdvancedJournal.applyTemplate(${index})">
        <div class="template-title">${template.title}</div>
        <div class="template-description">${template.description}</div>
      </div>
    `).join('');
  },

  applyTemplate(index) {
    const template = this.templates[index];
    this.editor.root.innerHTML = template.content;
    this.closeModal('templatesModal');
    this.showToast('Template applied!', 'success');
  },

  // Modal management
  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
  },

  // Toast notification
  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 DOM Content Loaded, initializing Journal...');
  AdvancedJournal.init();
});
