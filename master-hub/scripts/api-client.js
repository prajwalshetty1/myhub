// API Client for MyHub Frontend

// Determine API URL based on environment
function getApiBaseUrl() {
  // Check for injected API URL from HTML script tag (Vercel will replace {{VITE_API_URL}})
  if (typeof window !== 'undefined' && window.VITE_API_URL && window.VITE_API_URL !== '{{VITE_API_URL}}') {
    return window.VITE_API_URL;
  }
  
  // Development: use localhost
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3000/api';
  }
  
  // Production: use relative path (backend should be on same domain or use proxy)
  // For separate backend deployment, set VITE_API_URL in Vercel environment variables
  // and it will be injected via the script tag in index.html
  return '/api';
}

const API_BASE_URL = getApiBaseUrl();

class APIClient {
  constructor() {
    this.token = localStorage.getItem('authToken') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.setToken(null);
          window.location.href = '/login.html';
          throw new Error('Authentication required');
        }
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(username, email, password, name) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, name })
    });
  }

  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Phoenix Planner
  async getSchedule() {
    return this.request('/phoenix/schedule');
  }

  async addScheduleItem(item) {
    return this.request('/phoenix/schedule', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  async deleteScheduleItem(id) {
    return this.request(`/phoenix/schedule/${id}`, {
      method: 'DELETE'
    });
  }

  async getSelectedTasks(date) {
    return this.request(`/phoenix/selected-tasks/${date}`);
  }

  async saveSelectedTasks(date, tasks) {
    return this.request(`/phoenix/selected-tasks/${date}`, {
      method: 'POST',
      body: JSON.stringify({ tasks })
    });
  }

  async getCompletedTasks(date) {
    return this.request(`/phoenix/completed-tasks/${date}`);
  }

  async saveCompletedTasks(date, taskTitles) {
    return this.request(`/phoenix/completed-tasks/${date}`, {
      method: 'POST',
      body: JSON.stringify({ taskTitles })
    });
  }

  async getSupplements() {
    return this.request('/phoenix/supplements');
  }

  async saveSupplements(supplements) {
    return this.request('/phoenix/supplements', {
      method: 'POST',
      body: JSON.stringify({ supplements })
    });
  }

  async getSupplementsTaken(date) {
    return this.request(`/phoenix/supplements-taken/${date}`);
  }

  async saveSupplementsTaken(date, supplementsTaken) {
    return this.request(`/phoenix/supplements-taken/${date}`, {
      method: 'POST',
      body: JSON.stringify({ supplementsTaken })
    });
  }

  // Task Tracker
  async getTasks() {
    return this.request('/tasks');
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(task) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
  }

  async updateTask(id, task) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task)
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }

  // Diet Planner
  async getMeals(date) {
    return this.request(`/diet/meals/${date}`);
  }

  async saveMeals(date, mealType, meals) {
    return this.request(`/diet/meals/${date}`, {
      method: 'POST',
      body: JSON.stringify({ mealType, meals })
    });
  }

  async getGoals() {
    return this.request('/diet/goals');
  }

  async saveGoals(goals) {
    return this.request('/diet/goals', {
      method: 'POST',
      body: JSON.stringify({ goals })
    });
  }

  async getWater(date) {
    return this.request(`/diet/water/${date}`);
  }

  async saveWater(date, water) {
    return this.request(`/diet/water/${date}`, {
      method: 'POST',
      body: JSON.stringify({ water })
    });
  }

  async getFasting() {
    return this.request('/diet/fasting');
  }

  async saveFasting(startTime, isFasting) {
    return this.request('/diet/fasting', {
      method: 'POST',
      body: JSON.stringify({ startTime, isFasting })
    });
  }

  // Trading Planner
  async getTrades() {
    return this.request('/trading');
  }

  async getTrade(id) {
    return this.request(`/trading/${id}`);
  }

  async createTrade(trade) {
    return this.request('/trading', {
      method: 'POST',
      body: JSON.stringify(trade)
    });
  }

  async updateTrade(id, trade) {
    return this.request(`/trading/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trade)
    });
  }

  async deleteTrade(id) {
    return this.request(`/trading/${id}`, {
      method: 'DELETE'
    });
  }

  async getTradingMode() {
    return this.request('/trading/mode');
  }

  async saveTradingMode(mode) {
    return this.request('/trading/mode', {
      method: 'POST',
      body: JSON.stringify({ mode })
    });
  }

  // Learning 2026
  async getTopics() {
    return this.request('/learning');
  }

  async getTopic(id) {
    return this.request(`/learning/${id}`);
  }

  async createTopic(topic) {
    return this.request('/learning', {
      method: 'POST',
      body: JSON.stringify(topic)
    });
  }

  async updateTopic(id, topic) {
    return this.request(`/learning/${id}`, {
      method: 'PUT',
      body: JSON.stringify(topic)
    });
  }

  async deleteTopic(id) {
    return this.request(`/learning/${id}`, {
      method: 'DELETE'
    });
  }

  async logHours(id, hours) {
    return this.request(`/learning/${id}/hours`, {
      method: 'POST',
      body: JSON.stringify({ hours })
    });
  }

  // Project Tracker
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(project) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  }

  async updateProject(id, project) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project)
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // Hub
  async getHabits() {
    return this.request('/hub/habits');
  }

  async saveHabits(habits) {
    return this.request('/hub/habits', {
      method: 'POST',
      body: JSON.stringify({ habits })
    });
  }

  async getHabitLogs(date) {
    return this.request(`/hub/habit-logs/${date}`);
  }

  async saveHabitLogs(date, habitLogs) {
    return this.request(`/hub/habit-logs/${date}`, {
      method: 'POST',
      body: JSON.stringify({ habitLogs })
    });
  }

  async getIntentions(date) {
    return this.request(`/hub/intentions/${date}`);
  }

  async saveIntentions(date, intentions) {
    return this.request(`/hub/intentions/${date}`, {
      method: 'POST',
      body: JSON.stringify({ intentions })
    });
  }

  async getGamification() {
    return this.request('/hub/gamification');
  }

  async saveGamification(data) {
    return this.request('/hub/gamification', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getActivityLog(limit = 50) {
    return this.request(`/hub/activity-log?limit=${limit}`);
  }

  async logActivity(action, details = {}) {
    return this.request('/hub/activity-log', {
      method: 'POST',
      body: JSON.stringify({ action, details })
    });
  }
}

// Create global instance
window.API = new APIClient();

