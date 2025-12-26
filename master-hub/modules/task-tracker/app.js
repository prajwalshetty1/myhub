// Task Tracker Module

const TaskTracker = {
  tasks: [],
  currentTaskId: null,

  init() {
    this.loadTasks();
    this.render();
    this.setupEventListeners();
  },

  loadTasks() {
    const saved = localStorage.getItem('taskTrackerv2');
    if (saved) {
      const data = JSON.parse(saved);
      this.tasks = data.tasks || [];
      this.currentTaskId = data.currentTaskId || 0;
    } else {
      this.tasks = [];
      this.currentTaskId = 0;
    }
  },

  saveTasks() {
    localStorage.setItem('taskTrackerv2', JSON.stringify({
      tasks: this.tasks,
      currentTaskId: this.currentTaskId
    }));
  },

  render() {
    const statuses = ['backlog', 'todo', 'inprogress', 'review', 'done'];
    
    statuses.forEach(status => {
      const column = document.querySelector(`[data-status="${status}"] .column-content`);
      const countEl = document.getElementById(`${status}Count`);
      
      if (column) {
        const tasks = this.tasks.filter(t => t.status === status);
        
        if (countEl) {
          countEl.textContent = tasks.length;
        }
        
        if (tasks.length === 0) {
          column.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No tasks</p>';
        } else {
          column.innerHTML = tasks.map(task => this.renderTask(task)).join('');
        }
      }
    });
  },

  renderTask(task) {
    const today = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < today && task.status !== 'done';
    
    return `
      <div class="task-card" 
           draggable="true" 
           ondragstart="TaskTracker.drag(event, ${task.id})"
           onclick="TaskTracker.editTask(${task.id})"
           data-overdue="${isOverdue}">
        <div class="task-title">${task.title}</div>
        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
        <div class="task-meta">
          <span class="task-priority ${task.priority}">${task.priority}</span>
          ${dueDate ? `<span class="task-due-date">Due: ${dueDate.toLocaleDateString()}</span>` : ''}
        </div>
      </div>
    `;
  },

  setupEventListeners() {
    const newTaskBtn = document.getElementById('newTaskBtn');
    const modal = document.getElementById('taskModal');
    const closeBtn = document.getElementById('closeTaskModal');
    const form = document.getElementById('taskForm');

    if (newTaskBtn) {
      newTaskBtn.addEventListener('click', () => {
        this.openTaskModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeTaskModal();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTask();
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeTaskModal();
        }
      });
    }
  },

  openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const title = document.getElementById('taskModalTitle');
    const form = document.getElementById('taskForm');
    
    if (taskId !== null) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.dueDate || '';
        document.getElementById('taskStatus').value = task.status;
        if (title) title.textContent = 'Edit Task';
      }
    } else {
      form.reset();
      document.getElementById('taskId').value = '';
      document.getElementById('taskStatus').value = 'backlog';
      if (title) title.textContent = 'New Task';
    }
    
    if (modal) modal.classList.add('active');
  },

  closeTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) modal.classList.remove('active');
  },

  saveTask() {
    const id = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const status = document.getElementById('taskStatus').value || 'backlog';

    if (id) {
      // Update existing task
      const task = this.tasks.find(t => t.id === parseInt(id));
      if (task) {
        task.title = title;
        task.description = description;
        task.priority = priority;
        task.dueDate = dueDate;
        task.status = status;
      }
    } else {
      // Create new task
      const newTask = {
        id: this.currentTaskId++,
        title,
        description,
        priority,
        dueDate,
        status,
        createdAt: new Date().toISOString()
      };
      this.tasks.push(newTask);
      
      // Award XP
      if (window.Gamification) {
        window.Gamification.awardXP(5, 'task_created');
      }
    }

    this.saveTasks();
    this.render();
    this.closeTaskModal();
  },

  editTask(id) {
    this.openTaskModal(id);
  },

  drag(e, taskId) {
    e.dataTransfer.setData('text/plain', taskId.toString());
    e.currentTarget.classList.add('dragging');
  },

  allowDrop(e) {
    e.preventDefault();
  },

  drop(e) {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('text/plain'));
    const column = e.currentTarget.closest('.kanban-column');
    const newStatus = column.dataset.status;
    
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      const oldStatus = task.status;
      task.status = newStatus;
      
      // Award XP if moved to done
      if (newStatus === 'done' && oldStatus !== 'done') {
        if (window.Gamification) {
          window.Gamification.awardXP(10, 'task_completed');
        }
      }
      
      this.saveTasks();
      this.render();
    }
    
    // Remove dragging class from all cards
    document.querySelectorAll('.task-card').forEach(card => {
      card.classList.remove('dragging');
    });
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('hubTheme') || 'cosmic';
  document.body.setAttribute('data-theme', savedTheme);
  TaskTracker.init();
});
