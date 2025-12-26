// Project Tracker Module

const ProjectTracker = {
  projects: [],

  init() {
    this.loadProjects();
    this.render();
    this.setupEventListeners();
  },

  loadProjects() {
    const saved = localStorage.getItem('projectTracker');
    if (saved) {
      const data = JSON.parse(saved);
      this.projects = data.projects || [];
    } else {
      this.projects = [];
    }
  },

  saveProjects() {
    localStorage.setItem('projectTracker', JSON.stringify({
      projects: this.projects
    }));
  },

  render() {
    const list = document.getElementById('projectsList');
    if (!list) return;
    
    if (this.projects.length === 0) {
      list.innerHTML = '<p style="color: var(--text-secondary);">No projects yet. Click "New Project" to get started.</p>';
      return;
    }
    
    list.innerHTML = this.projects.map(project => {
      const statusColors = {
        planning: 'var(--accent-blue)',
        active: 'var(--accent-green)',
        'on-hold': 'var(--accent-orange)',
        completed: 'var(--accent-purple)'
      };
      
      return `
        <div class="project-card">
          <div class="project-header">
            <div class="project-name">${project.name}</div>
            <div class="project-status" style="background: ${statusColors[project.status] || 'var(--accent-blue)'}">
              ${project.status}
            </div>
          </div>
          ${project.description ? `<div class="project-description">${project.description}</div>` : ''}
          <div class="project-progress">
            <div class="progress-info">
              <span>Progress: ${project.progress || 0}%</span>
              <span class="project-priority ${project.priority}">${project.priority}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
            </div>
          </div>
          <div class="project-dates">
            ${project.startDate ? `<span>Start: ${new Date(project.startDate).toLocaleDateString()}</span>` : ''}
            ${project.endDate ? `<span>End: ${new Date(project.endDate).toLocaleDateString()}</span>` : ''}
          </div>
          <div class="project-actions">
            <button class="btn btn-sm" onclick="ProjectTracker.editProject(${project.id})">Edit</button>
            <button class="btn btn-sm" onclick="ProjectTracker.deleteProject(${project.id})">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  },

  setupEventListeners() {
    const newBtn = document.getElementById('newProjectBtn');
    const modal = document.getElementById('projectModal');
    const closeBtn = document.getElementById('closeProjectModal');
    const form = document.getElementById('projectForm');
    
    if (newBtn) {
      newBtn.addEventListener('click', () => this.openProjectModal());
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
      });
    }
    
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProject();
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

  openProjectModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const title = document.getElementById('projectModalTitle');
    const form = document.getElementById('projectForm');
    
    if (projectId !== null) {
      const project = this.projects.find(p => p.id === projectId);
      if (project) {
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectDescription').value = project.description || '';
        document.getElementById('projectStatus').value = project.status;
        document.getElementById('projectPriority').value = project.priority;
        document.getElementById('projectProgress').value = project.progress || 0;
        document.getElementById('projectStartDate').value = project.startDate || '';
        document.getElementById('projectEndDate').value = project.endDate || '';
        if (title) title.textContent = 'Edit Project';
      }
    } else {
      form.reset();
      document.getElementById('projectId').value = '';
      document.getElementById('projectProgress').value = 0;
      if (title) title.textContent = 'New Project';
    }
    
    if (modal) modal.classList.add('active');
  },

  saveProject() {
    const id = document.getElementById('projectId').value;
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDescription').value;
    const status = document.getElementById('projectStatus').value;
    const priority = document.getElementById('projectPriority').value;
    const progress = parseInt(document.getElementById('projectProgress').value) || 0;
    const startDate = document.getElementById('projectStartDate').value;
    const endDate = document.getElementById('projectEndDate').value;
    
    if (id) {
      const project = this.projects.find(p => p.id === parseInt(id));
      if (project) {
        Object.assign(project, {
          name, description, status, priority, progress, startDate, endDate
        });
      }
    } else {
      const newProject = {
        id: Date.now(),
        name,
        description,
        status,
        priority,
        progress,
        startDate,
        endDate,
        createdAt: new Date().toISOString()
      };
      this.projects.push(newProject);
    }
    
    this.saveProjects();
    this.render();
    document.getElementById('projectModal').classList.remove('active');
  },

  editProject(projectId) {
    this.openProjectModal(projectId);
  },

  deleteProject(projectId) {
    if (confirm('Delete this project?')) {
      this.projects = this.projects.filter(p => p.id !== projectId);
      this.saveProjects();
      this.render();
    }
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('hubTheme') || 'cosmic';
  document.body.setAttribute('data-theme', savedTheme);
  ProjectTracker.init();
});
