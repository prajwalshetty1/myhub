// Learning 2026 Module

const Learning2026 = {
  topics: [],

  init() {
    this.loadTopics();
    this.render();
    this.setupEventListeners();
  },

  loadTopics() {
    const saved = localStorage.getItem('learning2026');
    if (saved) {
      const data = JSON.parse(saved);
      this.topics = data.topics || [];
    } else {
      this.topics = [];
    }
  },

  saveTopics() {
    localStorage.setItem('learning2026', JSON.stringify({
      topics: this.topics
    }));
  },

  calculateStats() {
    const totalHours = this.topics.reduce((sum, t) => sum + (t.hoursLogged || 0), 0);
    const activeTopics = this.topics.filter(t => !t.completed).length;
    const completedTopics = this.topics.filter(t => t.completed).length;
    
    return { totalHours, activeTopics, completedTopics };
  },

  render() {
    this.renderStats();
    this.renderTopics();
  },

  renderStats() {
    const stats = this.calculateStats();
    
    document.getElementById('totalHours').textContent = stats.totalHours.toFixed(1);
    document.getElementById('activeTopics').textContent = stats.activeTopics;
    document.getElementById('completedTopics').textContent = stats.completedTopics;
  },

  renderTopics() {
    const list = document.getElementById('topicsList');
    if (!list) return;
    
    if (this.topics.length === 0) {
      list.innerHTML = '<p style="color: var(--text-secondary);">No topics added yet. Click "Add Topic" to get started.</p>';
      return;
    }
    
    list.innerHTML = this.topics.map(topic => {
      const progress = topic.targetHours > 0 
        ? Math.min(100, (topic.hoursLogged / topic.targetHours) * 100)
        : 0;
      
      return `
        <div class="topic-card ${topic.completed ? 'completed' : ''}">
          <div class="topic-header">
            <div class="topic-name">${this.getCategoryEmoji(topic.category)} ${topic.name}</div>
            <div class="topic-priority ${topic.priority}">${topic.priority}</div>
          </div>
          <div class="topic-progress">
            <div class="progress-info">
              <span>${topic.hoursLogged || 0} / ${topic.targetHours} hours</span>
              <span>${progress.toFixed(0)}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
          </div>
          <div class="topic-actions">
            <button class="btn btn-sm" onclick="Learning2026.logHours(${topic.id})">+ Log Hours</button>
            <button class="btn btn-sm" onclick="Learning2026.toggleComplete(${topic.id})">
              ${topic.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <button class="btn btn-sm" onclick="Learning2026.editTopic(${topic.id})">Edit</button>
            <button class="btn btn-sm" onclick="Learning2026.deleteTopic(${topic.id})">Delete</button>
          </div>
          ${topic.resources ? `<div class="topic-resources">${topic.resources}</div>` : ''}
        </div>
      `;
    }).join('');
  },

  getCategoryEmoji(category) {
    const emojis = {
      programming: '💻',
      design: '🎨',
      business: '💼',
      other: '📚'
    };
    return emojis[category] || '📚';
  },

  setupEventListeners() {
    const newBtn = document.getElementById('newTopicBtn');
    const modal = document.getElementById('topicModal');
    const closeBtn = document.getElementById('closeTopicModal');
    const form = document.getElementById('topicForm');
    const logModal = document.getElementById('logHoursModal');
    const closeLogBtn = document.getElementById('closeLogHoursModal');
    const logForm = document.getElementById('logHoursForm');
    
    if (newBtn) {
      newBtn.addEventListener('click', () => this.openTopicModal());
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
      });
    }
    
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTopic();
      });
    }
    
    if (closeLogBtn) {
      closeLogBtn.addEventListener('click', () => {
        if (logModal) logModal.classList.remove('active');
      });
    }
    
    if (logForm) {
      logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveLogHours();
      });
    }
    
    [modal, logModal].forEach(m => {
      if (m) {
        m.addEventListener('click', (e) => {
          if (e.target === m) {
            m.classList.remove('active');
          }
        });
      }
    });
  },

  openTopicModal(topicId = null) {
    const modal = document.getElementById('topicModal');
    const title = document.getElementById('topicModalTitle');
    const form = document.getElementById('topicForm');
    
    if (topicId !== null) {
      const topic = this.topics.find(t => t.id === topicId);
      if (topic) {
        document.getElementById('topicId').value = topic.id;
        document.getElementById('topicName').value = topic.name;
        document.getElementById('topicCategory').value = topic.category;
        document.getElementById('topicPriority').value = topic.priority;
        document.getElementById('targetHours').value = topic.targetHours;
        document.getElementById('topicResources').value = topic.resources || '';
        if (title) title.textContent = 'Edit Topic';
      }
    } else {
      form.reset();
      document.getElementById('topicId').value = '';
      if (title) title.textContent = 'New Topic';
    }
    
    if (modal) modal.classList.add('active');
  },

  saveTopic() {
    const id = document.getElementById('topicId').value;
    const name = document.getElementById('topicName').value;
    const category = document.getElementById('topicCategory').value;
    const priority = document.getElementById('topicPriority').value;
    const targetHours = parseInt(document.getElementById('targetHours').value) || 10;
    const resources = document.getElementById('topicResources').value;
    
    if (id) {
      const topic = this.topics.find(t => t.id === parseInt(id));
      if (topic) {
        Object.assign(topic, { name, category, priority, targetHours, resources });
      }
    } else {
      const newTopic = {
        id: Date.now(),
        name,
        category,
        priority,
        targetHours,
        resources,
        hoursLogged: 0,
        completed: false,
        createdAt: new Date().toISOString()
      };
      this.topics.push(newTopic);
    }
    
    this.saveTopics();
    this.render();
    document.getElementById('topicModal').classList.remove('active');
  },

  logHours(topicId) {
    document.getElementById('logTopicId').value = topicId;
    document.getElementById('logHoursModal').classList.add('active');
  },

  saveLogHours() {
    const topicId = parseInt(document.getElementById('logTopicId').value);
    const hours = parseFloat(document.getElementById('hoursAmount').value);
    
    const topic = this.topics.find(t => t.id === topicId);
    if (topic) {
      topic.hoursLogged = (topic.hoursLogged || 0) + hours;
      this.saveTopics();
      this.render();
      
      // Award XP
      if (window.Gamification) {
        window.Gamification.awardXP(15, 'learning_session');
      }
    }
    
    document.getElementById('logHoursModal').classList.remove('active');
    document.getElementById('logHoursForm').reset();
  },

  toggleComplete(topicId) {
    const topic = this.topics.find(t => t.id === topicId);
    if (topic) {
      topic.completed = !topic.completed;
      this.saveTopics();
      this.render();
    }
  },

  editTopic(topicId) {
    this.openTopicModal(topicId);
  },

  deleteTopic(topicId) {
    if (confirm('Delete this topic?')) {
      this.topics = this.topics.filter(t => t.id !== topicId);
      this.saveTopics();
      this.render();
    }
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('hubTheme') || 'cosmic';
  document.body.setAttribute('data-theme', savedTheme);
  Learning2026.init();
});
