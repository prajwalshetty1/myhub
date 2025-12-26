// Diet Planner Module

const DietPlanner = {
  fastingTimer: null,
  fastingStartTime: null,
  isFasting: false,
  meals: { protein: [], one: [] },
  macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  goals: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
  water: 0,

  init() {
    this.loadData();
    this.render();
    this.setupEventListeners();
    this.startTimerUpdate();
  },

  loadData() {
    const today = new Date().toISOString().split('T')[0];
    
    // Load meals
    const mealsData = JSON.parse(localStorage.getItem('dietPlannerMeals') || '{}');
    this.meals = mealsData[today] || { protein: [], one: [] };
    
    // Load macros
    const goalsData = JSON.parse(localStorage.getItem('dietPlannerGoals') || '{}');
    if (Object.keys(goalsData).length > 0) {
      this.goals = goalsData;
    }
    
    // Calculate current macros
    this.calculateMacros();
    
    // Load water
    const waterData = JSON.parse(localStorage.getItem('dietPlannerWater') || '{}');
    this.water = waterData[today] || 0;
    
    // Load fasting state
    const fastingData = JSON.parse(localStorage.getItem('dietPlannerFasting') || '{}');
    if (fastingData.startTime) {
      this.fastingStartTime = new Date(fastingData.startTime);
      this.isFasting = fastingData.isFasting || false;
    }
  },

  saveData() {
    const today = new Date().toISOString().split('T')[0];
    
    // Save meals
    const mealsData = JSON.parse(localStorage.getItem('dietPlannerMeals') || '{}');
    mealsData[today] = this.meals;
    localStorage.setItem('dietPlannerMeals', JSON.stringify(mealsData));
    
    // Save goals
    localStorage.setItem('dietPlannerGoals', JSON.stringify(this.goals));
    
    // Save water
    const waterData = JSON.parse(localStorage.getItem('dietPlannerWater') || '{}');
    waterData[today] = this.water;
    localStorage.setItem('dietPlannerWater', JSON.stringify(waterData));
    
    // Save fasting
    localStorage.setItem('dietPlannerFasting', JSON.stringify({
      startTime: this.fastingStartTime ? this.fastingStartTime.toISOString() : null,
      isFasting: this.isFasting
    }));
  },

  calculateMacros() {
    this.macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    [...this.meals.protein, ...this.meals.one].forEach(food => {
      this.macros.calories += food.calories || 0;
      this.macros.protein += food.protein || 0;
      this.macros.carbs += food.carbs || 0;
      this.macros.fat += food.fat || 0;
    });
  },

  render() {
    this.renderFastingTimer();
    this.renderMacros();
    this.renderMeals();
    this.renderWater();
  },

  renderFastingTimer() {
    const statusEl = document.getElementById('timerStatus');
    const timeEl = document.getElementById('timerTime');
    const startBtn = document.getElementById('startFastBtn');
    const endBtn = document.getElementById('endFastBtn');
    
    if (this.isFasting && this.fastingStartTime) {
      const elapsed = Date.now() - this.fastingStartTime.getTime();
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      
      if (statusEl) statusEl.textContent = 'Fasting';
      if (timeEl) timeEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      if (startBtn) startBtn.style.display = 'none';
      if (endBtn) endBtn.style.display = 'block';
    } else {
      if (statusEl) statusEl.textContent = 'Not Fasting';
      if (timeEl) timeEl.textContent = '00:00';
      if (startBtn) startBtn.style.display = 'block';
      if (endBtn) endBtn.style.display = 'none';
    }
  },

  renderMacros() {
    document.getElementById('caloriesCurrent').textContent = Math.round(this.macros.calories);
    document.getElementById('caloriesGoal').textContent = this.goals.calories;
    document.getElementById('proteinCurrent').textContent = Math.round(this.macros.protein);
    document.getElementById('proteinGoal').textContent = this.goals.protein;
    document.getElementById('carbsCurrent').textContent = Math.round(this.macros.carbs);
    document.getElementById('carbsGoal').textContent = this.goals.carbs;
    document.getElementById('fatCurrent').textContent = Math.round(this.macros.fat);
    document.getElementById('fatGoal').textContent = this.goals.fat;
    
    // Update progress bars
    document.getElementById('caloriesProgress').style.width = 
      Math.min(100, (this.macros.calories / this.goals.calories) * 100) + '%';
    document.getElementById('proteinProgress').style.width = 
      Math.min(100, (this.macros.protein / this.goals.protein) * 100) + '%';
    document.getElementById('carbsProgress').style.width = 
      Math.min(100, (this.macros.carbs / this.goals.carbs) * 100) + '%';
    document.getElementById('fatProgress').style.width = 
      Math.min(100, (this.macros.fat / this.goals.fat) * 100) + '%';
  },

  renderMeals() {
    this.renderMealList('protein', 'proteinMealList');
    this.renderMealList('one', 'oneMealList');
  },

  renderMealList(type, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const mealList = this.meals[type] || [];
    
    if (mealList.length === 0) {
      element.innerHTML = '<p style="color: var(--text-secondary);">No foods added yet</p>';
      return;
    }
    
    element.innerHTML = mealList.map((food, index) => `
      <div class="meal-item">
        <div class="meal-item-info">
          <div class="meal-item-name">${food.name}</div>
          <div class="meal-item-macros">
            P: ${food.protein || 0}g | C: ${food.carbs || 0}g | F: ${food.fat || 0}g
          </div>
        </div>
        <div class="meal-item-calories">${food.calories} cal</div>
        <button class="btn" onclick="DietPlanner.removeFood('${type}', ${index})" style="margin-left: 1rem;">×</button>
      </div>
    `).join('');
  },

  renderWater() {
    document.getElementById('waterCount').textContent = this.water;
    
    const glassesEl = document.getElementById('waterGlasses');
    if (glassesEl) {
      glassesEl.innerHTML = '';
      for (let i = 0; i < 8; i++) {
        const glass = document.createElement('div');
        glass.className = `water-glass ${i < this.water ? 'filled' : ''}`;
        glassesEl.appendChild(glass);
      }
    }
  },

  setupEventListeners() {
    const startBtn = document.getElementById('startFastBtn');
    const endBtn = document.getElementById('endFastBtn');
    const modal = document.getElementById('mealModal');
    const closeBtn = document.getElementById('closeMealModal');
    const form = document.getElementById('mealForm');
    
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startFast());
    }
    
    if (endBtn) {
      endBtn.addEventListener('click', () => this.endFast());
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
      });
    }
    
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addFood();
      });
    }
    
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  },

  startTimerUpdate() {
    setInterval(() => {
      if (this.isFasting) {
        this.renderFastingTimer();
      }
    }, 60000); // Update every minute
  },

  startFast() {
    this.fastingStartTime = new Date();
    this.isFasting = true;
    this.saveData();
    this.renderFastingTimer();
    
    // Award XP
    if (window.Gamification) {
      window.Gamification.awardXP(5, 'fast_started');
    }
  },

  endFast() {
    if (this.isFasting && this.fastingStartTime) {
      const duration = Date.now() - this.fastingStartTime.getTime();
      const hours = duration / 3600000;
      
      if (hours >= 16) {
        // Award XP for completing fast
        if (window.Gamification) {
          window.Gamification.awardXP(25, 'fast_completed');
        }
      }
    }
    
    this.isFasting = false;
    this.fastingStartTime = null;
    this.saveData();
    this.renderFastingTimer();
  },

  openMealModal(type) {
    document.getElementById('mealType').value = type;
    document.getElementById('mealForm').reset();
    document.getElementById('mealModal').classList.add('active');
  },

  addFood() {
    const type = document.getElementById('mealType').value;
    const name = document.getElementById('foodName').value;
    const calories = parseInt(document.getElementById('foodCalories').value) || 0;
    const protein = parseFloat(document.getElementById('foodProtein').value) || 0;
    const carbs = parseFloat(document.getElementById('foodCarbs').value) || 0;
    const fat = parseFloat(document.getElementById('foodFat').value) || 0;
    
    if (!this.meals[type]) {
      this.meals[type] = [];
    }
    
    this.meals[type].push({ name, calories, protein, carbs, fat });
    this.calculateMacros();
    this.saveData();
    this.render();
    
    document.getElementById('mealModal').classList.remove('active');
  },

  removeFood(type, index) {
    this.meals[type].splice(index, 1);
    this.calculateMacros();
    this.saveData();
    this.render();
  },

  addWater() {
    if (this.water < 8) {
      this.water++;
      this.saveData();
      this.renderWater();
    }
  },

  removeWater() {
    if (this.water > 0) {
      this.water--;
      this.saveData();
      this.renderWater();
    }
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('hubTheme') || 'cosmic';
  document.body.setAttribute('data-theme', savedTheme);
  DietPlanner.init();
});
