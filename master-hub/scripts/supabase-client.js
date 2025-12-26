// Supabase Direct Client - Bypass local backend for development
// This connects directly to Supabase REST API when local backend is unavailable

const SUPABASE_URL = 'https://jarhhglbeawefqpgmuch.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphcmhoZ2xiZWF3ZWZxcGdtdWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2ODkzNDUsImV4cCI6MjA4MjI2NTM0NX0.ZyhgD7VKmpdConxB6H1t1UD0A2hrSacIBUG_96ZCANQ';

class SupabaseClient {
  constructor() {
    this.baseUrl = `${SUPABASE_URL}/rest/v1`;
    this.headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `Request failed: ${response.status}`);
      }

      // For DELETE requests that return 204
      if (response.status === 204) {
        return { success: true };
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase API request failed:', error);
      throw error;
    }
  }

  // Trading Positions
  async getPositions() {
    return this.request('/trading_positions?user_id=is.null&order=entry_date.desc');
  }

  async createPosition(position) {
    return this.request('/trading_positions', {
      method: 'POST',
      body: JSON.stringify({
        user_id: null,
        ...position
      })
    });
  }

  async updatePosition(id, updates) {
    const result = await this.request(`/trading_positions?id=eq.${id}&user_id=is.null`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return result[0];
  }

  async deletePosition(id) {
    return this.request(`/trading_positions?id=eq.${id}&user_id=is.null`, {
      method: 'DELETE'
    });
  }

  // Trading Settings
  async getSettings() {
    const result = await this.request('/trading_settings?user_id=is.null');
    if (result.length === 0) {
      return {
        futures_balance: 10000,
        stocks_balance: 195000,
        daily_loss_limit: 500,
        max_risk_per_trade: 2
      };
    }
    return result[0];
  }

  async saveSettings(settings) {
    // Try to update first
    const existing = await this.request('/trading_settings?user_id=is.null');
    
    if (existing.length > 0) {
      // Update existing
      const result = await this.request('/trading_settings?user_id=is.null', {
        method: 'PATCH',
        body: JSON.stringify(settings)
      });
      return result[0];
    } else {
      // Insert new
      const result = await this.request('/trading_settings', {
        method: 'POST',
        body: JSON.stringify({
          user_id: null,
          ...settings
        })
      });
      return result[0];
    }
  }

  // Trading Mode
  async getMode() {
    const result = await this.request('/trading_mode?user_id=is.null');
    return result.length > 0 ? result[0].mode : 'futures';
  }

  async saveMode(mode) {
    const existing = await this.request('/trading_mode?user_id=is.null');
    
    if (existing.length > 0) {
      await this.request('/trading_mode?user_id=is.null', {
        method: 'PATCH',
        body: JSON.stringify({ mode })
      });
    } else {
      await this.request('/trading_mode', {
        method: 'POST',
        body: JSON.stringify({ user_id: null, mode })
      });
    }
    return { success: true };
  }

  // Trades
  async getTrades() {
    return this.request('/trades?user_id=is.null&order=trade_date.desc');
  }

  async createTrade(trade) {
    return this.request('/trades', {
      method: 'POST',
      body: JSON.stringify({
        user_id: null,
        trade_date: new Date().toISOString(),
        ...trade
      })
    });
  }

  // Planned Trades
  async getPlannedTrades() {
    return this.request('/trading_planned_trades?user_id=is.null&order=date.desc');
  }

  async createPlannedTrade(trade) {
    return this.request('/trading_planned_trades', {
      method: 'POST',
      body: JSON.stringify({
        user_id: null,
        ...trade
      })
    });
  }

  async deletePlannedTrade(id) {
    return this.request(`/trading_planned_trades?id=eq.${id}&user_id=is.null`, {
      method: 'DELETE'
    });
  }

  // Key Levels
  async getKeyLevels() {
    return this.request('/trading_key_levels?user_id=is.null&order=date.desc');
  }

  async createKeyLevel(level) {
    return this.request('/trading_key_levels', {
      method: 'POST',
      body: JSON.stringify({
        user_id: null,
        ...level
      })
    });
  }

  async deleteKeyLevel(id) {
    return this.request(`/trading_key_levels?id=eq.${id}&user_id=is.null`, {
      method: 'DELETE'
    });
  }

  // Execution Stages
  async getExecutionStages() {
    const result = await this.request('/trading_execution_stages?user_id=is.null');
    return result.length > 0 ? result[0].stage_data : {};
  }

  async saveExecutionStages(stages) {
    const existing = await this.request('/trading_execution_stages?user_id=is.null');
    
    if (existing.length > 0) {
      await this.request('/trading_execution_stages?user_id=is.null', {
        method: 'PATCH',
        body: JSON.stringify({ stage_data: stages })
      });
    } else {
      await this.request('/trading_execution_stages', {
        method: 'POST',
        body: JSON.stringify({ user_id: null, stage_data: stages })
      });
    }
    return { success: true };
  }

  // Watchlist
  async getWatchlist() {
    const result = await this.request('/trading_watchlist?user_id=is.null');
    return result.length > 0 ? result[0].symbols : ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];
  }

  async saveWatchlist(symbols) {
    const existing = await this.request('/trading_watchlist?user_id=is.null');
    
    if (existing.length > 0) {
      await this.request('/trading_watchlist?user_id=is.null', {
        method: 'PATCH',
        body: JSON.stringify({ symbols })
      });
    } else {
      await this.request('/trading_watchlist', {
        method: 'POST',
        body: JSON.stringify({ user_id: null, symbols })
      });
    }
    return { success: true, symbols };
  }

  // Psychology
  async getPsychology() {
    return this.request('/trading_psychology?user_id=is.null&order=date.desc&limit=50');
  }

  async createPsychology(entry) {
    return this.request('/trading_psychology', {
      method: 'POST',
      body: JSON.stringify({
        user_id: null,
        ...entry
      })
    });
  }

  // Daily Notes
  async getDailyNotes() {
    return this.request('/trading_daily_notes?user_id=is.null&order=date.desc');
  }

  async getDailyNote(date) {
    const result = await this.request(`/trading_daily_notes?user_id=is.null&date=eq.${date}`);
    return result.length > 0 ? result[0] : null;
  }

  async saveDailyNote(date, notes) {
    const existing = await this.request(`/trading_daily_notes?user_id=is.null&date=eq.${date}`);
    
    if (existing.length > 0) {
      const result = await this.request(`/trading_daily_notes?user_id=is.null&date=eq.${date}`, {
        method: 'PATCH',
        body: JSON.stringify({ notes })
      });
      return result[0];
    } else {
      const result = await this.request('/trading_daily_notes', {
        method: 'POST',
        body: JSON.stringify({ user_id: null, date, notes })
      });
      return result[0];
    }
  }

  async deleteDailyNote(date) {
    return this.request(`/trading_daily_notes?user_id=is.null&date=eq.${date}`, {
      method: 'DELETE'
    });
  }

  // Journal Entries
  async getJournalEntries() {
    return this.request('/journal_entries?user_id=is.null&order=date.desc');
  }

  async getJournalEntry(date) {
    const result = await this.request(`/journal_entries?user_id=is.null&date=eq.${date}`);
    return result.length > 0 ? result[0] : null;
  }

  async saveJournalEntry(entry) {
    const existing = await this.request(`/journal_entries?user_id=is.null&date=eq.${entry.date}`);
    
    if (existing.length > 0) {
      // Update existing
      const result = await this.request(`/journal_entries?user_id=is.null&date=eq.${entry.date}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
          updated_at: new Date().toISOString()
        })
      });
      return result[0];
    } else {
      // Insert new
      const result = await this.request('/journal_entries', {
        method: 'POST',
        body: JSON.stringify({
          user_id: null,
          ...entry
        })
      });
      return result[0];
    }
  }

  async deleteJournalEntry(date) {
    return this.request(`/journal_entries?user_id=is.null&date=eq.${date}`, {
      method: 'DELETE'
    });
  }
}

// Export for use in Trading Planner
window.SupabaseClient = new SupabaseClient();
console.log('✅ Supabase Direct Client initialized');

