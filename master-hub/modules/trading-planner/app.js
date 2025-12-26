// Trading Planner Module

const TradingPlanner = {
  trades: [],
  mode: 'futures', // 'futures' or 'stocks'
  contracts: {
    MES: { pointValue: 5, tickSize: 0.25, tickValue: 1.25 },
    MNQ: { pointValue: 2, tickSize: 0.25, tickValue: 0.50 },
    PL: { pointValue: 50, tickSize: 0.10, tickValue: 5.00 },
    SIL: { pointValue: 5000, tickSize: 0.005, tickValue: 25 }
  },

  init() {
    this.loadTrades();
    this.render();
    this.setupEventListeners();
  },

  loadTrades() {
    const saved = localStorage.getItem('tradingTrades');
    if (saved) {
      this.trades = JSON.parse(saved);
    } else {
      this.trades = [];
    }
    
    const savedMode = localStorage.getItem('tradingMode');
    if (savedMode) {
      this.mode = savedMode;
    }
  },

  saveTrades() {
    localStorage.setItem('tradingTrades', JSON.stringify(this.trades));
    localStorage.setItem('tradingMode', this.mode);
  },

  calculatePL(trade) {
    if (this.mode === 'futures') {
      const contract = this.contracts[trade.symbol] || { pointValue: 5 };
      const priceDiff = trade.direction === 'long' 
        ? trade.exitPrice - trade.entryPrice
        : trade.entryPrice - trade.exitPrice;
      return priceDiff * contract.pointValue * trade.contracts;
    } else {
      // Stocks mode
      const priceDiff = trade.direction === 'long'
        ? trade.exitPrice - trade.entryPrice
        : trade.entryPrice - trade.exitPrice;
      return priceDiff * trade.contracts;
    }
  },

  calculateStats() {
    if (this.trades.length === 0) {
      return {
        totalPL: 0,
        winRate: 0,
        totalTrades: 0,
        avgWin: 0
      };
    }
    
    const totalPL = this.trades.reduce((sum, t) => sum + t.pl, 0);
    const winningTrades = this.trades.filter(t => t.pl > 0);
    const winRate = (winningTrades.length / this.trades.length) * 100;
    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.pl, 0) / winningTrades.length
      : 0;
    
    return { totalPL, winRate, totalTrades: this.trades.length, avgWin };
  },

  render() {
    this.renderStats();
    this.renderTrades();
  },

  renderStats() {
    const stats = this.calculateStats();
    
    document.getElementById('totalPL').textContent = 
      `$${stats.totalPL >= 0 ? '+' : ''}${stats.totalPL.toFixed(2)}`;
    document.getElementById('totalPL').style.color = 
      stats.totalPL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    
    document.getElementById('winRate').textContent = `${stats.winRate.toFixed(1)}%`;
    document.getElementById('totalTrades').textContent = stats.totalTrades;
    document.getElementById('avgWin').textContent = `$${stats.avgWin.toFixed(2)}`;
  },

  renderTrades() {
    const list = document.getElementById('tradeList');
    if (!list) return;
    
    if (this.trades.length === 0) {
      list.innerHTML = '<p style="color: var(--text-secondary);">No trades logged yet.</p>';
      return;
    }
    
    list.innerHTML = this.trades
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(trade => `
        <div class="trade-card ${trade.pl >= 0 ? 'profit' : 'loss'}">
          <div class="trade-header">
            <div class="trade-symbol">${trade.symbol}</div>
            <div class="trade-pl ${trade.pl >= 0 ? 'positive' : 'negative'}">
              ${trade.pl >= 0 ? '+' : ''}$${trade.pl.toFixed(2)}
            </div>
          </div>
          <div class="trade-details">
            <div>${trade.direction.toUpperCase()} | ${trade.contracts} ${this.mode === 'futures' ? 'contracts' : 'shares'}</div>
            <div>Entry: $${trade.entryPrice} → Exit: $${trade.exitPrice}</div>
            ${trade.setupType ? `<div>Setup: ${trade.setupType}</div>` : ''}
            ${trade.notes ? `<div class="trade-notes">${trade.notes}</div>` : ''}
            <div class="trade-date">${new Date(trade.date).toLocaleDateString()}</div>
          </div>
        </div>
      `).join('');
  },

  setupEventListeners() {
    const newBtn = document.getElementById('newTradeBtn');
    const modal = document.getElementById('tradeModal');
    const closeBtn = document.getElementById('closeTradeModal');
    const form = document.getElementById('tradeForm');
    const modeToggle = document.getElementById('modeToggle');
    
    if (newBtn) {
      newBtn.addEventListener('click', () => this.openTradeModal());
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
      });
    }
    
    if (form) {
      form.addEventListener('input', () => this.updatePLDisplay());
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTrade();
      });
    }
    
    if (modeToggle) {
      modeToggle.addEventListener('click', () => {
        this.mode = this.mode === 'futures' ? 'stocks' : 'futures';
        modeToggle.textContent = `Mode: ${this.mode.charAt(0).toUpperCase() + this.mode.slice(1)}`;
        this.saveTrades();
        this.render();
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

  updatePLDisplay() {
    const entry = parseFloat(document.getElementById('entryPrice').value) || 0;
    const exit = parseFloat(document.getElementById('exitPrice').value) || 0;
    const contracts = parseInt(document.getElementById('contracts').value) || 0;
    const direction = document.getElementById('tradeDirection').value;
    const symbol = document.getElementById('tradeSymbol').value.toUpperCase();
    
    if (entry && exit && contracts) {
      let pl = 0;
      if (this.mode === 'futures') {
        const contract = this.contracts[symbol] || { pointValue: 5 };
        const priceDiff = direction === 'long' ? exit - entry : entry - exit;
        pl = priceDiff * contract.pointValue * contracts;
      } else {
        const priceDiff = direction === 'long' ? exit - entry : entry - exit;
        pl = priceDiff * contracts;
      }
      
      const plDisplay = document.getElementById('plDisplay');
      if (plDisplay) {
        plDisplay.textContent = `P&L: ${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}`;
        plDisplay.style.color = pl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
      }
    }
  },

  openTradeModal(tradeId = null) {
    const modal = document.getElementById('tradeModal');
    const title = document.getElementById('tradeModalTitle');
    const form = document.getElementById('tradeForm');
    
    if (tradeId !== null) {
      const trade = this.trades.find(t => t.id === tradeId);
      if (trade) {
        document.getElementById('tradeId').value = trade.id;
        document.getElementById('tradeSymbol').value = trade.symbol;
        document.getElementById('entryPrice').value = trade.entryPrice;
        document.getElementById('exitPrice').value = trade.exitPrice;
        document.getElementById('contracts').value = trade.contracts;
        document.getElementById('tradeDirection').value = trade.direction;
        document.getElementById('setupType').value = trade.setupType || '';
        document.getElementById('tradeNotes').value = trade.notes || '';
        if (title) title.textContent = 'Edit Trade';
      }
    } else {
      form.reset();
      document.getElementById('tradeId').value = '';
      if (title) title.textContent = 'New Trade';
    }
    
    if (modal) modal.classList.add('active');
    this.updatePLDisplay();
  },

  saveTrade() {
    const id = document.getElementById('tradeId').value;
    const symbol = document.getElementById('tradeSymbol').value.toUpperCase();
    const entryPrice = parseFloat(document.getElementById('entryPrice').value);
    const exitPrice = parseFloat(document.getElementById('exitPrice').value);
    const contracts = parseInt(document.getElementById('contracts').value);
    const direction = document.getElementById('tradeDirection').value;
    const setupType = document.getElementById('setupType').value;
    const notes = document.getElementById('tradeNotes').value;
    
    const pl = this.calculatePL({
      symbol, entryPrice, exitPrice, contracts, direction
    });
    
    if (id) {
      const trade = this.trades.find(t => t.id === parseInt(id));
      if (trade) {
        Object.assign(trade, {
          symbol, entryPrice, exitPrice, contracts, direction, setupType, notes, pl
        });
      }
    } else {
      const newTrade = {
        id: Date.now(),
        symbol,
        entryPrice,
        exitPrice,
        contracts,
        direction,
        setupType,
        notes,
        pl,
        date: new Date().toISOString()
      };
      this.trades.push(newTrade);
    }
    
    this.saveTrades();
    this.render();
    document.getElementById('tradeModal').classList.remove('active');
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('hubTheme') || 'cosmic';
  document.body.setAttribute('data-theme', savedTheme);
  TradingPlanner.init();
});
