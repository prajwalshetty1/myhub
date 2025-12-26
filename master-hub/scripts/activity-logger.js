// Activity Logger - Centralized logging across all modules

const ActivityLogger = {
  log(module, action, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      module,
      action,
      details
    };

    // Get existing logs
    let logs = JSON.parse(localStorage.getItem('hubActivityLog') || '[]');
    logs.unshift(entry);

    // Keep only last 1000 entries
    if (logs.length > 1000) {
      logs = logs.slice(0, 1000);
    }

    // Save to localStorage
    localStorage.setItem('hubActivityLog', JSON.stringify(logs));

    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'hubActivityLog',
      newValue: JSON.stringify(logs)
    }));

    return entry;
  }
};

// Make available globally
window.ActivityLogger = ActivityLogger;

