// Phoenix Planner Module

const PhoenixPlanner = {
  init() {
    this.loadData();
    this.renderSchedule();
    this.renderPlan();
    this.renderSupplements();
    this.renderAstrology();
    this.setupEventListeners();
  },

  loadData() {
    const today = new Date().toISOString().split('T')[0];
    
    // Load schedule
    this.schedule = JSON.parse(localStorage.getItem('phoenixSchedule') || '[]');
    
    // Load plan for today
    this.plan = JSON.parse(localStorage.getItem('phoenixSelectedTasks') || '{}')[today] || [];
    
    // Load completed tasks
    this.completed = JSON.parse(localStorage.getItem('phoenixCompletedTasks') || '{}')[today] || [];
    
    // Load supplements
    this.supplements = JSON.parse(localStorage.getItem('phoenixSupplements') || JSON.stringify({
      morning: [
        { name: 'Vitamin D 5000IU', taken: false },
        { name: 'Vitamin C 1000mg', taken: false },
        { name: 'Vitamin B12', taken: false },
        { name: 'Omega-3 Fish Oil', taken: false },
        { name: 'Collagen Peptides', taken: false }
      ],
      afternoon: [
        { name: 'Iron 65mg with Vitamin C', taken: false }
      ],
      evening: [
        { name: 'Magnesium Glycinate 400mg', taken: false },
        { name: 'Zinc 30mg', taken: false },
        { name: 'Ashwagandha 600mg', taken: false }
      ]
    }));
    
    // Load supplement logs for today
    const supplementLogs = JSON.parse(localStorage.getItem('phoenixSupplementsTaken') || '{}');
    this.supplementsTaken = supplementLogs[today] || {};
  },

  saveData() {
    localStorage.setItem('phoenixSchedule', JSON.stringify(this.schedule));
    
    const today = new Date().toISOString().split('T')[0];
    const selectedTasks = JSON.parse(localStorage.getItem('phoenixSelectedTasks') || '{}');
    selectedTasks[today] = this.plan;
    localStorage.setItem('phoenixSelectedTasks', JSON.stringify(selectedTasks));
    
    const completedTasks = JSON.parse(localStorage.getItem('phoenixCompletedTasks') || '{}');
    completedTasks[today] = this.completed;
    localStorage.setItem('phoenixCompletedTasks', JSON.stringify(completedTasks));
    
    localStorage.setItem('phoenixSupplements', JSON.stringify(this.supplements));
    
    const supplementsTaken = JSON.parse(localStorage.getItem('phoenixSupplementsTaken') || '{}');
    supplementsTaken[today] = this.supplementsTaken;
    localStorage.setItem('phoenixSupplementsTaken', JSON.stringify(supplementsTaken));
  },

  renderSchedule() {
    const list = document.getElementById('scheduleList');
    if (!list) return;

    if (this.schedule.length === 0) {
      list.innerHTML = '<p style="color: var(--text-secondary);">No schedule items. Click "Add Item" to create one.</p>';
      return;
    }

    list.innerHTML = this.schedule
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((item, index) => `
        <div class="schedule-item">
          <span class="schedule-time">${item.time}</span>
          <span class="schedule-title">${item.title}</span>
          <span class="schedule-category">${this.getCategoryEmoji(item.category)} ${item.category}</span>
          ${item.duration ? `<span>${item.duration} min</span>` : ''}
          <button class="btn" onclick="PhoenixPlanner.addToPlan(${index})">Add to Plan</button>
          <button class="btn" onclick="PhoenixPlanner.deleteScheduleItem(${index})">Delete</button>
        </div>
      `).join('');
  },

  renderPlan() {
    const list = document.getElementById('planList');
    if (!list) return;

    if (this.plan.length === 0) {
      list.innerHTML = '<p style="color: var(--text-secondary);">No items in your plan for today. Add items from schedule.</p>';
      return;
    }

    list.innerHTML = this.plan.map((item, index) => {
      const isCompleted = this.completed.includes(item.title);
      return `
        <div class="plan-item ${isCompleted ? 'completed' : ''}">
          <input type="checkbox" ${isCompleted ? 'checked' : ''} 
                 onchange="PhoenixPlanner.togglePlanItem(${index})">
          <span class="schedule-time">${item.time}</span>
          <span class="schedule-title">${item.title}</span>
          <span class="schedule-category">${this.getCategoryEmoji(item.category)}</span>
        </div>
      `;
    }).join('');
  },

  renderSupplements() {
    this.renderSupplementGroup('morning', 'morningSupplements');
    this.renderSupplementGroup('afternoon', 'afternoonSupplements');
    this.renderSupplementGroup('evening', 'eveningSupplements');
  },

  renderSupplementGroup(group, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const supplements = this.supplements[group] || [];
    element.innerHTML = supplements.map((supp, index) => {
      const taken = this.supplementsTaken[`${group}-${index}`] || false;
      return `
        <div class="supplement-item ${taken ? 'supplement-taken' : ''}">
          <input type="checkbox" ${taken ? 'checked' : ''} 
                 onchange="PhoenixPlanner.toggleSupplement('${group}', ${index})">
          <span class="supplement-name">${supp.name}</span>
        </div>
      `;
    }).join('');
  },

  renderAstrology() {
    const info = document.getElementById('astrologyInfo');
    if (!info) return;

    const userData = JSON.parse(localStorage.getItem('hubUserData') || '{}');
    
    info.innerHTML = `
      <div class="astrology-card">
        <h3>Sun Sign</h3>
        <p style="font-size: 2rem;">♈</p>
        <p>Aries</p>
      </div>
      <div class="astrology-card">
        <h3>Moon Sign</h3>
        <p style="font-size: 2rem;">♒</p>
        <p>Aquarius</p>
      </div>
      <div class="astrology-card">
        <h3>Ascendant</h3>
        <p style="font-size: 2rem;">♌</p>
        <p>Leo</p>
      </div>
      <div class="astrology-card">
        <h3>Lucky Colors</h3>
        <p>Red, Orange, Gold, Yellow</p>
      </div>
      <div class="astrology-card">
        <h3>Lucky Numbers</h3>
        <p>1, 9, 3, 5</p>
      </div>
    `;
  },

  getCategoryEmoji(category) {
    const emojis = {
      morning: '🌅',
      physical: '💪',
      mental: '🧠',
      spiritual: '🕉️',
      supplements: '💊',
      nutrition: '🍎'
    };
    return emojis[category] || '📌';
  },

  setupEventListeners() {
    const addBtn = document.getElementById('addScheduleItem');
    const modal = document.getElementById('scheduleModal');
    const closeBtn = document.getElementById('closeScheduleModal');
    const form = document.getElementById('scheduleForm');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (modal) modal.classList.add('active');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addScheduleItem();
      });
    }

    // Close modal on overlay click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  },

  addScheduleItem() {
    const time = document.getElementById('scheduleTime').value;
    const title = document.getElementById('scheduleTitle').value;
    const category = document.getElementById('scheduleCategory').value;
    const duration = document.getElementById('scheduleDuration').value;

    this.schedule.push({ time, title, category, duration: parseInt(duration) || null });
    this.saveData();
    this.renderSchedule();

    // Close modal and reset form
    document.getElementById('scheduleModal').classList.remove('active');
    document.getElementById('scheduleForm').reset();
  },

  addToPlan(index) {
    const item = this.schedule[index];
    if (!this.plan.find(p => p.title === item.title && p.time === item.time)) {
      this.plan.push({ ...item });
      this.saveData();
      this.renderPlan();
    }
  },

  togglePlanItem(index) {
    const item = this.plan[index];
    const completedIndex = this.completed.indexOf(item.title);
    
    if (completedIndex > -1) {
      this.completed.splice(completedIndex, 1);
    } else {
      this.completed.push(item.title);
    }
    
    this.saveData();
    this.renderPlan();
    
    // Award XP
    if (window.Gamification) {
      window.Gamification.awardXP(10, 'task_completed');
    }
  },

  toggleSupplement(group, index) {
    const key = `${group}-${index}`;
    this.supplementsTaken[key] = !this.supplementsTaken[key];
    this.saveData();
    this.renderSupplements();
  },

  deleteScheduleItem(index) {
    if (confirm('Delete this schedule item?')) {
      this.schedule.splice(index, 1);
      this.saveData();
      this.renderSchedule();
    }
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Load theme
  const savedTheme = localStorage.getItem('hubTheme') || 'cosmic';
  document.body.setAttribute('data-theme', savedTheme);
  
  PhoenixPlanner.init();
});
