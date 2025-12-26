// Supabase Direct Client for Local Development
// This bypasses the local backend and connects directly to Supabase REST API

class SupabaseClient {
  constructor() {
    this.supabaseUrl = 'https://jarhhglbeawefqpgmuch.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphcmhoZ2xiZWF3ZWZxcGdtdWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2ODkzNDUsImV4cCI6MjA4MjI2NTM0NX0.ZyhgD7VKmpdConxB6H1t1UD0A2hrSacIBUG_96ZCANQ';
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': this.supabaseKey,
      'Authorization': `Bearer ${this.supabaseKey}`,
      'Prefer': 'return=representation'
    };
    console.log('SupabaseClient initialized with URL:', this.supabaseUrl);
  }

  async request(endpoint, options = {}) {
    const url = `${this.supabaseUrl}/rest/v1/${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    };

    try {
      console.log(`🔵 Supabase Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Supabase error:', errorData);
        throw new Error(errorData.message || `Supabase request failed: ${response.statusText}`);
      }
      
      if (config.method === 'DELETE') {
        return { success: true };
      }
      
      const data = await response.json();
      console.log('✅ Supabase response:', data);
      return data;
    } catch (error) {
      console.error(`❌ Supabase request failed:`, error);
      throw error;
    }
  }

  // Journal Entry methods
  async getJournalEntries() {
    return this.request('journal_entries?user_id=is.null&order=date.desc');
  }

  async getJournalEntryByDate(date) {
    const result = await this.request(`journal_entries?user_id=is.null&date=eq.${date}`);
    return result.length > 0 ? result[0] : null;
  }

  async saveJournalEntry(entryData) {
    console.log('💾 Saving journal entry:', entryData);
    
    // Prepare data for Supabase
    const data = { 
      user_id: null, 
      date: entryData.date,
      title: entryData.title || null,
      content: entryData.content || '',
      mood: entryData.mood || null,
      tags: entryData.tags || [],
      category: entryData.category || null,
      is_favorite: entryData.is_favorite || false
    };
    
    // Check if entry exists
    const existing = await this.getJournalEntryByDate(entryData.date);
    
    if (existing) {
      console.log('📝 Updating existing entry');
      // Update existing entry
      const result = await this.request(
        `journal_entries?user_id=is.null&date=eq.${entryData.date}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data)
        }
      );
      return Array.isArray(result) && result.length > 0 ? result[0] : { ...existing, ...data };
    } else {
      console.log('✨ Creating new entry');
      // Create new entry
      const result = await this.request('journal_entries', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return Array.isArray(result) && result.length > 0 ? result[0] : data;
    }
  }

  async deleteJournalEntry(date) {
    return this.request(`journal_entries?user_id=is.null&date=eq.${date}`, {
      method: 'DELETE'
    });
  }
}

// Export for use in Journal app
window.SupabaseClient = new SupabaseClient();
console.log('✅ Supabase Direct Client initialized and ready');
