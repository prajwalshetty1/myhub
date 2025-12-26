# Migration Guide: localStorage to PostgreSQL

This guide explains how to migrate the frontend modules from localStorage to the PostgreSQL backend API.

## Current Status

- ✅ Backend API is complete with all endpoints
- ✅ API Client (`scripts/api-client.js`) is ready
- ✅ Authentication system is in place
- ⚠️ Frontend modules still use localStorage (need migration)

## Migration Steps

### 1. Update Module Files

Each module needs to be updated to use `window.API` instead of `localStorage`. Here's the pattern:

**Before (localStorage):**
```javascript
// Load data
this.tasks = JSON.parse(localStorage.getItem('taskTrackerv2') || '[]');

// Save data
localStorage.setItem('taskTrackerv2', JSON.stringify({ tasks: this.tasks }));
```

**After (API):**
```javascript
// Load data
try {
  this.tasks = await window.API.getTasks();
} catch (error) {
  console.error('Failed to load tasks:', error);
  this.tasks = [];
}

// Save data
try {
  await window.API.createTask(task);
  // or
  await window.API.updateTask(id, task);
} catch (error) {
  console.error('Failed to save task:', error);
  alert('Failed to save. Please try again.');
}
```

### 2. Make Functions Async

Functions that load/save data need to be async:

```javascript
// Before
loadTasks() {
  this.tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
}

// After
async loadTasks() {
  try {
    this.tasks = await window.API.getTasks();
  } catch (error) {
    console.error('Error loading tasks:', error);
    this.tasks = [];
  }
}
```

### 3. Update Initialization

```javascript
// Before
document.addEventListener('DOMContentLoaded', () => {
  TaskTracker.init();
});

// After
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!window.API.token) {
    window.location.href = '/login.html';
    return;
  }
  
  await TaskTracker.init();
});
```

### 4. Error Handling

Add proper error handling for network failures:

```javascript
async saveTask() {
  try {
    await window.API.createTask(this.task);
    this.render();
  } catch (error) {
    console.error('Save failed:', error);
    // Optionally: fallback to localStorage
    // localStorage.setItem('tasks_backup', JSON.stringify(this.tasks));
    alert('Failed to save. Please check your connection.');
  }
}
```

## Module-Specific Updates

### Phoenix Planner
- Replace `localStorage.getItem('phoenixSchedule')` with `await window.API.getSchedule()`
- Replace `localStorage.getItem('phoenixSelectedTasks')` with `await window.API.getSelectedTasks(date)`
- Replace `localStorage.getItem('phoenixSupplements')` with `await window.API.getSupplements()`

### Task Tracker
- Replace `localStorage.getItem('taskTrackerv2')` with `await window.API.getTasks()`
- Use `window.API.createTask()`, `updateTask()`, `deleteTask()`

### Diet Planner
- Replace meal storage with `await window.API.getMeals(date)`
- Use `window.API.saveMeals(date, mealType, meals)`
- Use `window.API.getFasting()` and `saveFasting()`

### Trading Planner
- Replace with `await window.API.getTrades()`
- Use `window.API.createTrade()`, `updateTrade()`, `deleteTrade()`

### Learning 2026
- Replace with `await window.API.getTopics()`
- Use `window.API.createTopic()`, `updateTopic()`, `logHours()`

### Project Tracker
- Replace with `await window.API.getProjects()`
- Use `window.API.createProject()`, `updateProject()`, `deleteProject()`

### Hub (Main)
- Replace habits with `await window.API.getHabits()`
- Replace gamification with `await window.API.getGamification()`
- Replace activity log with `await window.API.getActivityLog()`

## Testing

After migration:

1. **Test authentication:**
   - Register new user
   - Login
   - Verify token is stored

2. **Test each module:**
   - Create data
   - Refresh page (data should persist)
   - Edit data
   - Delete data

3. **Test error handling:**
   - Disconnect backend
   - Verify graceful error messages
   - Reconnect and verify data syncs

## Fallback Strategy

For offline support, you can implement a hybrid approach:

```javascript
async saveTask() {
  try {
    await window.API.createTask(task);
    // Clear localStorage backup on success
    localStorage.removeItem('tasks_backup');
  } catch (error) {
    // Save to localStorage as backup
    const backup = JSON.parse(localStorage.getItem('tasks_backup') || '[]');
    backup.push(task);
    localStorage.setItem('tasks_backup', JSON.stringify(backup));
    
    // Try to sync later
    this.syncBackup();
  }
}

async syncBackup() {
  const backup = JSON.parse(localStorage.getItem('tasks_backup') || '[]');
  for (const task of backup) {
    try {
      await window.API.createTask(task);
      backup.splice(backup.indexOf(task), 1);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
  localStorage.setItem('tasks_backup', JSON.stringify(backup));
}
```

## Quick Migration Script

You can create a one-time migration script to move existing localStorage data to the database:

```javascript
async function migrateLocalStorageToAPI() {
  if (!window.API.token) {
    console.error('Not authenticated');
    return;
  }

  // Migrate tasks
  const tasks = JSON.parse(localStorage.getItem('taskTrackerv2') || '{}').tasks || [];
  for (const task of tasks) {
    try {
      await window.API.createTask(task);
    } catch (error) {
      console.error('Failed to migrate task:', error);
    }
  }

  // Migrate other data similarly...
  console.log('Migration complete!');
}
```

## Notes

- All API calls require authentication (JWT token)
- Token is automatically included in requests via `api-client.js`
- Date formats: Use `YYYY-MM-DD` for dates
- JSON data is automatically stringified/parsed by the API client
- The backend handles all data validation and security

