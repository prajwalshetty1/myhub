// Trading Planner - Complete Implementation

const TradingPlanner = {
  // Data Storage Keys
  STORAGE_KEYS: {
    TRADES: 'tradingTrades',
    POSITIONS: 'tradingPositions',
    MODE: 'tradingMode',
    SETTINGS: 'tradingSettings',
    PLANNED_TRADES: 'tradingPlannedTrades',
    KEY_LEVELS: 'tradingKeyLevels',
    EXECUTION_STAGES: 'tradingExecutionStages',
    PSYCHOLOGY: 'tradingPsychology',
    WATCHLIST: 'tradingWatchlist'
  },

  // State
  trades: [],
  positions: [],
  mode: 'futures',
  settings: {
    futuresBalance: 10000,
    stocksBalance: 195000,
    dailyLossLimit: 500,
    maxRiskPerTrade: 2
  },
  plannedTrades: [],
  keyLevels: [],
  executionStages: {},
  psychology: [],
  watchlist: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'],
  currentCalendarMonth: new Date().getMonth(),
  currentCalendarYear: 2026,

  // Futures Contracts Data
  contracts: {
    MES: { 
      pointValue: 5, 
      tickSize: 0.25, 
      tickValue: 1.25,
      name: 'Micro E-mini S&P 500'
    },
    MNQ: { 
      pointValue: 2, 
      tickSize: 0.25, 
      tickValue: 0.50,
      name: 'Micro E-mini Nasdaq-100'
    },
    PL: { 
      pointValue: 50, 
      tickSize: 0.10, 
      tickValue: 5.00,
      name: 'Platinum'
    },
    SIL: { 
      pointValue: 5000, 
      tickSize: 0.005, 
      tickValue: 25,
      name: 'Silver'
    }
  },

  // Default Stocks
  defaultStocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'],

  async init() {
    await this.loadAllData();
    this.setupEventListeners();
    this.render();
    this.initTradingView();
    this.updateRiskPanel();
    this.updateAccountDisplay();
  },

  // ===== DATA PERSISTENCE =====
  async loadAllData() {
    try {
      // Load trades
      this.trades = await window.API.getTrades() || [];

      // Load positions
      this.positions = await window.API.getPositions() || [];

      // Load mode
      const modeData = await window.API.getTradingMode();
      if (modeData.mode) this.mode = modeData.mode;

      // Load settings
      const settingsData = await window.API.getTradingSettings();
      if (settingsData) {
        this.settings = {
          futuresBalance: parseFloat(settingsData.futures_balance || 10000),
          stocksBalance: parseFloat(settingsData.stocks_balance || 195000),
          dailyLossLimit: parseFloat(settingsData.daily_loss_limit || 500),
          maxRiskPerTrade: parseFloat(settingsData.max_risk_per_trade || 2)
        };
      }

      // Load planned trades
      this.plannedTrades = await window.API.getPlannedTrades() || [];

      // Load key levels
      this.keyLevels = await window.API.getKeyLevels() || [];

      // Load execution stages
      const stagesData = await window.API.getExecutionStages();
      if (stagesData.stages) this.executionStages = stagesData.stages;

      // Load psychology
      this.psychology = await window.API.getPsychology() || [];

      // Load watchlist
      const watchlistData = await window.API.getWatchlist();
      if (watchlistData.symbols) this.watchlist = watchlistData.symbols;
      else if (this.watchlist.length === 0) {
        // Initialize with defaults if empty
        this.watchlist = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];
        await window.API.saveWatchlist(this.watchlist);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to empty arrays if API fails
      this.trades = [];
      this.positions = [];
      this.plannedTrades = [];
      this.keyLevels = [];
      this.psychology = [];
    }
  },

  async saveAllData() {
    try {
      // Save mode
      await window.API.saveTradingMode(this.mode);

      // Save settings
      await window.API.saveTradingSettings({
        futuresBalance: this.settings.futuresBalance,
        stocksBalance: this.settings.stocksBalance,
        dailyLossLimit: this.settings.dailyLossLimit,
        maxRiskPerTrade: this.settings.maxRiskPerTrade
      });

      // Save execution stages
      await window.API.saveExecutionStages(this.executionStages);

      // Save watchlist
      await window.API.saveWatchlist(this.watchlist);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },

  // ===== P&L CALCULATIONS =====
  calculatePL(trade) {
    if (this.mode === 'futures') {
      return this.calculateFuturesPL(trade);
    } else {
      return this.calculateStocksPL(trade);
    }
  },

  calculateFuturesPL(trade) {
    const contract = this.contracts[trade.symbol];
    if (!contract) return 0;

    const priceDiff = trade.direction === 'long' 
      ? trade.exitPrice - trade.entryPrice
      : trade.entryPrice - trade.exitPrice;
    
    return priceDiff * contract.pointValue * trade.contracts;
  },

  calculateStocksPL(trade) {
    const priceDiff = trade.direction === 'long'
      ? trade.exitPrice - trade.entryPrice
      : trade.entryPrice - trade.exitPrice;
    
    return priceDiff * trade.shares;
  },

  // ===== RISK CALCULATIONS =====
  calculateRiskAmount(entryPrice, stopLoss, size, direction) {
    if (!entryPrice || !stopLoss || !size) return 0;

    const priceDiff = Math.abs(entryPrice - stopLoss);
    
    if (this.mode === 'futures') {
      const symbol = document.getElementById('tradeSymbol')?.value;
      const contract = this.contracts[symbol];
      if (!contract) return 0;
      return priceDiff * contract.pointValue * size;
    } else {
      return priceDiff * size;
    }
  },

  calculatePositionSize(riskAmount, entryPrice, stopLoss) {
    if (!entryPrice || !stopLoss || !riskAmount) return 0;

    const priceDiff = Math.abs(entryPrice - stopLoss);
    if (priceDiff === 0) return 0;

    if (this.mode === 'futures') {
      const symbol = document.getElementById('tradeSymbol')?.value;
      const contract = this.contracts[symbol];
      if (!contract) return 0;
      return Math.floor(riskAmount / (priceDiff * contract.pointValue));
    } else {
      return Math.floor(riskAmount / priceDiff);
    }
  },

  // ===== EVENT LISTENERS =====
  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Mode toggle
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;
        this.switchMode(mode);
      });
    });

    // Trade entry form
    const tradeForm = document.getElementById('tradeEntryForm');
    if (tradeForm) {
      tradeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.enterTrade();
      });
      tradeForm.addEventListener('input', () => this.updateRiskCalculator());
    }

    // Settings
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsModal');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    if (settingsBtn) settingsBtn.addEventListener('click', () => this.openSettings());
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', () => this.saveSettings());

    // New position button
    const newPosBtn = document.getElementById('newPositionBtn');
    if (newPosBtn) newPosBtn.addEventListener('click', () => this.focusTradeEntry());

    // Close position
    const closePosForm = document.getElementById('closePositionForm');
    if (closePosForm) {
      closePosForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.closePosition();
      });
      closePosForm.addEventListener('input', () => this.updateClosePL());
    }

    const closePosModalBtn = document.getElementById('closePositionModalBtn');
    if (closePosModalBtn) closePosModalBtn.addEventListener('click', () => this.closePositionModal());

    // Journal calendar
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => this.changeMonth(1));

    // Journal filter
    const journalFilter = document.getElementById('journalFilter');
    if (journalFilter) journalFilter.addEventListener('change', () => this.renderJournal());

    // Planner
    const newPlannedBtn = document.getElementById('newPlannedTradeBtn');
    const newKeyLevelBtn = document.getElementById('newKeyLevelBtn');
    if (newPlannedBtn) newPlannedBtn.addEventListener('click', () => this.addPlannedTrade());
    if (newKeyLevelBtn) newKeyLevelBtn.addEventListener('click', () => this.addKeyLevel());

    // Execution stages are handled in renderExecutionStages

    // Psychology
    const savePsychBtn = document.getElementById('savePsychologyBtn');
    if (savePsychBtn) savePsychBtn.addEventListener('click', () => this.savePsychology());

    // Watchlist
    const addWatchlistBtn = document.getElementById('addWatchlistBtn');
    if (addWatchlistBtn) addWatchlistBtn.addEventListener('click', () => this.addToWatchlist());

    // Chart symbol change
    const chartSymbol = document.getElementById('chartSymbol');
    if (chartSymbol) chartSymbol.addEventListener('change', () => this.updateTradingView());

    // Chart timeframe change
    const chartTimeframe = document.getElementById('chartTimeframe');
    if (chartTimeframe) chartTimeframe.addEventListener('change', () => this.updateTradingView());
  },

  // ===== TAB MANAGEMENT =====
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === tabName) btn.classList.add('active');
    });

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    const activePane = document.getElementById(`${tabName}-tab`);
    if (activePane) {
      activePane.classList.add('active');
      
      // Render specific tab content
      if (tabName === 'journal') this.renderJournal();
      else if (tabName === 'planner') this.renderPlanner();
      else if (tabName === 'analytics') this.renderAnalytics();
      else if (tabName === 'playbook') this.renderPlaybook();
      else if (tabName === 'charts') this.updateTradingView();
    }
  },

  // ===== MODE MANAGEMENT =====
  async switchMode(mode) {
    this.mode = mode;
    
    // Update UI
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.mode === mode) btn.classList.add('active');
    });

    // Update symbol options
    const futuresOpts = document.getElementById('futuresOptions');
    const stocksOpts = document.getElementById('stocksOptions');
    const sizeLabel = document.getElementById('sizeLabel');
    
    if (mode === 'futures') {
      if (futuresOpts) futuresOpts.style.display = 'block';
      if (stocksOpts) stocksOpts.style.display = 'none';
      if (sizeLabel) sizeLabel.textContent = 'Contracts';
    } else {
      if (futuresOpts) futuresOpts.style.display = 'none';
      if (stocksOpts) stocksOpts.style.display = 'block';
      if (sizeLabel) sizeLabel.textContent = 'Shares';
    }

    this.updateAccountDisplay();
    this.updateRiskPanel();
    await this.saveAllData();
  },

  // ===== RENDERING =====
  render() {
    this.renderPositions();
    this.updateRiskCalculator();
    this.renderJournal();
    this.renderPlanner();
    this.renderAnalytics();
    this.renderPlaybook();
  },

  renderPositions() {
    const list = document.getElementById('positionsList');
    if (!list) return;

    if (this.positions.length === 0) {
      list.innerHTML = '<div class="empty-state">No open positions</div>';
      return;
    }

    list.innerHTML = this.positions.map(pos => {
      const pl = this.calculatePositionPL(pos);
      const plClass = pl >= 0 ? 'positive' : 'negative';
      const plSign = pl >= 0 ? '+' : '';
      
      return `
        <div class="position-item ${pl >= 0 ? 'profit' : 'loss'}" data-position-id="${pos.id}">
          <div>
            <div class="position-symbol">${pos.symbol}</div>
            <div class="position-details">${pos.direction.toUpperCase()} | ${pos.size} ${(pos.mode || this.mode) === 'futures' ? 'contracts' : 'shares'}</div>
          </div>
          <div>
            <div class="position-details">Entry: $${parseFloat(pos.entry_price).toFixed(2)}</div>
            <div class="position-details">Stop: $${pos.stop_loss ? parseFloat(pos.stop_loss).toFixed(2) : 'N/A'}</div>
          </div>
          <div>
            <div class="position-details">Target: $${pos.take_profit ? parseFloat(pos.take_profit).toFixed(2) : 'N/A'}</div>
            <div class="position-details">Current: $${(pos.current_price || pos.entry_price).toFixed(2)}</div>
          </div>
          <div>
            <div class="position-pl ${plClass}">${plSign}$${pl.toFixed(2)}</div>
            <div class="position-details">${((pl / (parseFloat(pos.entry_price) * pos.size)) * 100).toFixed(2)}%</div>
          </div>
          <button class="btn-terminal btn-sm" onclick="TradingPlanner.openClosePositionModal('${pos.id}')">CLOSE</button>
        </div>
      `;
    }).join('');
  },

  calculatePositionPL(position) {
    const currentPrice = position.current_price || position.entry_price;
    if (!currentPrice) return 0;

    const entryPrice = position.entry_price;
    const size = position.size;
    const mode = position.mode || this.mode;

    if (mode === 'futures') {
      const contract = this.contracts[position.symbol];
      if (!contract) return 0;
      const priceDiff = position.direction === 'long'
        ? currentPrice - entryPrice
        : entryPrice - currentPrice;
      return priceDiff * contract.pointValue * size;
    } else {
      const priceDiff = position.direction === 'long'
        ? currentPrice - entryPrice
        : entryPrice - currentPrice;
      return priceDiff * size;
    }
  },

  // ===== TRADE ENTRY =====
  async enterTrade() {
    const symbol = document.getElementById('tradeSymbol').value;
    const direction = document.getElementById('tradeDirection').value;
    const entryPrice = parseFloat(document.getElementById('entryPrice').value);
    const size = parseInt(document.getElementById('tradeSize').value);
    const stopLoss = parseFloat(document.getElementById('stopLoss').value) || null;
    const takeProfit = parseFloat(document.getElementById('takeProfit').value) || null;
    const setupType = document.getElementById('setupType').value || null;
    const riskPercent = parseFloat(document.getElementById('riskPercent').value) || 1;

    if (!symbol || !entryPrice || !size) {
      alert('Please fill in all required fields');
      return;
    }

    // Check risk limits
    if (stopLoss) {
      const riskAmount = this.calculateRiskAmount(entryPrice, stopLoss, size, direction);
      const accountBalance = this.mode === 'futures' ? this.settings.futuresBalance : this.settings.stocksBalance;
      const maxRisk = accountBalance * (this.settings.maxRiskPerTrade / 100);
      
      if (riskAmount > maxRisk) {
        if (!confirm(`Risk amount ($${riskAmount.toFixed(2)}) exceeds max risk per trade ($${maxRisk.toFixed(2)}). Continue?`)) {
          return;
        }
      }
    }

    // Create position
    const position = {
      id: Date.now().toString(),
      symbol,
      direction,
      entryPrice,
      size: this.mode === 'futures' ? size : size, // For stocks, size is shares
      stopLoss,
      takeProfit,
      setupType,
      currentPrice: entryPrice,
      entryDate: new Date().toISOString(),
      mode: this.mode
    };

    try {
      const positionData = {
        symbol,
        direction,
        entryPrice,
        size,
        stopLoss,
        takeProfit,
        currentPrice: entryPrice,
        setupType,
        mode: this.mode
      };
      
      const created = await window.API.createPosition(positionData);
      this.positions.push(created);
      await this.saveAllData();
      this.renderPositions();
      document.getElementById('tradeEntryForm').reset();
      this.updateRiskCalculator();
    } catch (error) {
      console.error('Error creating position:', error);
      alert('Failed to create position. Please try again.');
    }
  },

  // ===== CLOSE POSITION =====
  async openClosePositionModal(positionId) {
    const position = this.positions.find(p => p.id == positionId);
    if (!position) return;

    document.getElementById('closePositionId').value = positionId;
    document.getElementById('closeExitPrice').value = position.current_price || position.entry_price;
    document.getElementById('closePositionModal').classList.add('active');
    this.updateClosePL();
  },

  closePositionModal() {
    document.getElementById('closePositionModal').classList.remove('active');
  },

  updateClosePL() {
    const positionId = document.getElementById('closePositionId').value;
    const exitPrice = parseFloat(document.getElementById('closeExitPrice').value) || 0;
    const position = this.positions.find(p => p.id == positionId);
    
    if (!position || !exitPrice) return;

    const pl = this.calculatePL({
      symbol: position.symbol,
      direction: position.direction,
      entryPrice: parseFloat(position.entry_price),
      exitPrice: exitPrice,
      contracts: position.size,
      shares: position.size
    });

    const plDisplay = document.getElementById('closePLDisplay');
    if (plDisplay) {
      plDisplay.textContent = `P&L: ${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}`;
      plDisplay.style.color = pl >= 0 ? '#00ff00' : '#ff4444';
    }
  },

  async closePosition() {
    const positionId = document.getElementById('closePositionId').value;
    const exitPrice = parseFloat(document.getElementById('closeExitPrice').value);
    const reason = document.getElementById('closeReason').value;
    const notes = document.getElementById('closeNotes').value;

    const position = this.positions.find(p => p.id == positionId);
    if (!position) return;

    // Calculate P&L
    const pl = this.calculatePL({
      symbol: position.symbol,
      direction: position.direction,
      entryPrice: parseFloat(position.entry_price),
      exitPrice: exitPrice,
      contracts: position.size,
      shares: position.size
    });

    // Create trade record
    const trade = {
      symbol: position.symbol,
      direction: position.direction,
      entryPrice: parseFloat(position.entry_price),
      exitPrice: exitPrice,
      contracts: (position.mode || this.mode) === 'futures' ? position.size : null,
      shares: (position.mode || this.mode) === 'stocks' ? position.size : null,
      stopLoss: position.stop_loss ? parseFloat(position.stop_loss) : null,
      takeProfit: position.take_profit ? parseFloat(position.take_profit) : null,
      setupType: position.setup_type,
      exitReason: reason,
      notes: notes,
      pl: pl,
      exitDate: new Date().toISOString(),
      mode: position.mode || this.mode
    };

    try {
      // Create trade record
      const tradeData = {
        symbol: position.symbol,
        direction: position.direction,
        entryPrice: position.entry_price,
        exitPrice: exitPrice,
        contracts: this.mode === 'futures' ? position.size : null,
        shares: this.mode === 'stocks' ? position.size : null,
        stopLoss: position.stop_loss,
        takeProfit: position.take_profit,
        setupType: position.setup_type,
        exitReason: reason,
        notes: notes,
        pl: pl,
        exitDate: new Date().toISOString(),
        mode: position.mode
      };
      
      const createdTrade = await window.API.createTrade(tradeData);
      this.trades.push(createdTrade);

      // Remove position
      await window.API.deletePosition(positionId);
      this.positions = this.positions.filter(p => p.id !== positionId);

      // Update account balance
      if (this.mode === 'futures') {
        this.settings.futuresBalance += pl;
      } else {
        this.settings.stocksBalance += pl;
      }

      await this.saveAllData();
      this.renderPositions();
      this.renderJournal();
      this.updateAccountDisplay();
      this.updateRiskPanel();
      this.closePositionModal();
    } catch (error) {
      console.error('Error closing position:', error);
      alert('Failed to close position. Please try again.');
    }
  },

  // ===== RISK CALCULATOR =====
  updateRiskCalculator() {
    const entryPrice = parseFloat(document.getElementById('entryPrice')?.value) || 0;
    const stopLoss = parseFloat(document.getElementById('stopLoss')?.value) || 0;
    const size = parseInt(document.getElementById('tradeSize')?.value) || 0;
    const takeProfit = parseFloat(document.getElementById('takeProfit')?.value) || 0;
    const riskPercent = parseFloat(document.getElementById('riskPercent')?.value) || 1;
    const direction = document.getElementById('tradeDirection')?.value || 'long';

    if (!entryPrice) {
      this.clearRiskCalculator();
      return;
    }

    const accountBalance = this.mode === 'futures' ? this.settings.futuresBalance : this.settings.stocksBalance;
    const riskAmount = accountBalance * (riskPercent / 100);

    // Calculate position size if stop loss is provided
    let calculatedSize = size;
    if (stopLoss && stopLoss !== entryPrice) {
      calculatedSize = this.calculatePositionSize(riskAmount, entryPrice, stopLoss);
      if (calculatedSize > 0 && size !== calculatedSize) {
        document.getElementById('tradeSize').value = calculatedSize;
      }
    }

    // Calculate max loss
    let maxLoss = 0;
    if (stopLoss && stopLoss !== entryPrice) {
      maxLoss = this.calculateRiskAmount(entryPrice, stopLoss, calculatedSize, direction);
    }

    // Calculate max gain
    let maxGain = 0;
    if (takeProfit && takeProfit !== entryPrice) {
      const priceDiff = direction === 'long' 
        ? takeProfit - entryPrice
        : entryPrice - takeProfit;
      
      if (this.mode === 'futures') {
        const symbol = document.getElementById('tradeSymbol')?.value;
        const contract = this.contracts[symbol];
        if (contract) maxGain = priceDiff * contract.pointValue * calculatedSize;
      } else {
        maxGain = priceDiff * calculatedSize;
      }
    }

    // Update display
    document.getElementById('riskAmount').textContent = `$${riskAmount.toFixed(2)}`;
    document.getElementById('calcPositionSize').textContent = calculatedSize;
    document.getElementById('maxLoss').textContent = `$${maxLoss.toFixed(2)}`;
    document.getElementById('maxGain').textContent = `$${maxGain.toFixed(2)}`;
  },

  clearRiskCalculator() {
    document.getElementById('riskAmount').textContent = '$0.00';
    document.getElementById('calcPositionSize').textContent = '0';
    document.getElementById('maxLoss').textContent = '$0.00';
    document.getElementById('maxGain').textContent = '$0.00';
  },

  // ===== RISK PANEL =====
  updateRiskPanel() {
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = this.trades.filter(t => {
      const exitDate = t.exit_date || t.trade_date || t.date;
      return exitDate?.startsWith(today);
    });
    const todayPL = todayTrades.reduce((sum, t) => sum + parseFloat(t.pl || 0), 0);
    const dailyLimit = this.settings.dailyLossLimit;
    const remaining = dailyLimit + todayPL; // If PL is negative, remaining increases

    document.getElementById('dailyLimit').textContent = `$${dailyLimit.toFixed(2)}`;
    document.getElementById('dailyUsed').textContent = `$${Math.abs(Math.min(0, todayPL)).toFixed(2)}`;
    document.getElementById('dailyRemaining').textContent = `$${remaining.toFixed(2)}`;

    const statusEl = document.getElementById('riskStatus');
    if (remaining <= 0) {
      statusEl.textContent = '🔴 LOCKED';
      statusEl.style.color = '#ff4444';
    } else if (remaining < dailyLimit * 0.2) {
      statusEl.textContent = '🟡 WARNING';
      statusEl.style.color = '#ffaa00';
    } else {
      statusEl.textContent = '🟢 ACTIVE';
      statusEl.style.color = '#00ff00';
    }
  },

  // ===== ACCOUNT DISPLAY =====
  updateAccountDisplay() {
    const balance = this.mode === 'futures' ? this.settings.futuresBalance : this.settings.stocksBalance;
    const label = this.mode === 'futures' ? 'FUTURES' : 'STOCKS';
    
    document.getElementById('accountLabel').textContent = label;
    document.getElementById('accountBalance').textContent = `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  // ===== SETTINGS =====
  async openSettings() {
    document.getElementById('futuresBalance').value = this.settings.futuresBalance;
    document.getElementById('stocksBalance').value = this.settings.stocksBalance;
    document.getElementById('dailyLossLimit').value = this.settings.dailyLossLimit;
    document.getElementById('maxRiskPerTrade').value = this.settings.maxRiskPerTrade;
    this.renderWatchlist();
    document.getElementById('settingsModal').classList.add('active');
  },

  closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
  },

  async saveSettings() {
    this.settings.futuresBalance = parseFloat(document.getElementById('futuresBalance').value);
    this.settings.stocksBalance = parseFloat(document.getElementById('stocksBalance').value);
    this.settings.dailyLossLimit = parseFloat(document.getElementById('dailyLossLimit').value);
    this.settings.maxRiskPerTrade = parseFloat(document.getElementById('maxRiskPerTrade').value);
    
    await this.saveAllData();
    this.updateAccountDisplay();
    this.updateRiskPanel();
    this.closeSettings();
  },

  renderWatchlist() {
    const manager = document.getElementById('watchlistManager');
    if (!manager) return;

    manager.innerHTML = this.watchlist.map(symbol => `
      <div class="watchlist-tag">
        ${symbol}
        <span class="remove" onclick="TradingPlanner.removeFromWatchlist('${symbol}')">×</span>
      </div>
    `).join('');
  },

  async addToWatchlist() {
    const symbol = document.getElementById('newWatchlistSymbol').value.toUpperCase().trim();
    if (!symbol || this.watchlist.includes(symbol)) return;
    
    this.watchlist.push(symbol);
    await window.API.saveWatchlist(this.watchlist);
    this.renderWatchlist();
    document.getElementById('newWatchlistSymbol').value = '';
  },

  async removeFromWatchlist(symbol) {
    this.watchlist = this.watchlist.filter(s => s !== symbol);
    await window.API.saveWatchlist(this.watchlist);
    this.renderWatchlist();
  },

  // ===== JOURNAL =====
  renderJournal() {
    this.renderCalendar();
    this.renderJournalTrades();
  },

  renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('calendarMonth').textContent = 
      `${monthNames[this.currentCalendarMonth]} ${this.currentCalendarYear}`;

    const firstDay = new Date(this.currentCalendarYear, this.currentCalendarMonth, 1);
    const lastDay = new Date(this.currentCalendarYear, this.currentCalendarMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
      const header = document.createElement('div');
      header.style.color = '#888';
      header.style.fontWeight = 'bold';
      header.style.textAlign = 'center';
      header.textContent = day;
      grid.appendChild(header);
    });

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day';
      grid.appendChild(empty);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.currentCalendarYear}-${String(this.currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTrades = this.trades.filter(t => {
        const tradeDate = t.trade_date || t.date;
        const exitDate = t.exit_date;
        return tradeDate?.startsWith(dateStr) || exitDate?.startsWith(dateStr);
      });
      
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      if (dayTrades.length > 0) {
        dayEl.classList.add('has-trades');
        dayEl.onclick = () => this.filterJournalByDate(dateStr);
      }

      dayEl.innerHTML = `
        <div class="calendar-day-number">${day}</div>
        ${dayTrades.length > 0 ? `<div class="calendar-day-trades">${dayTrades.length} trade${dayTrades.length > 1 ? 's' : ''}</div>` : ''}
      `;

      grid.appendChild(dayEl);
    }
  },

  changeMonth(delta) {
    this.currentCalendarMonth += delta;
    if (this.currentCalendarMonth < 0) {
      this.currentCalendarMonth = 11;
      this.currentCalendarYear--;
    } else if (this.currentCalendarMonth > 11) {
      this.currentCalendarMonth = 0;
      this.currentCalendarYear++;
    }
    this.renderCalendar();
  },

  filterJournalByDate(date) {
    // Filter and highlight trades for selected date
    this.renderJournalTrades(date);
  },

  renderJournalTrades(filterDate = null) {
    const filter = document.getElementById('journalFilter')?.value || 'all';
    let filteredTrades = [...this.trades];

    // Apply filters
    if (filter === 'futures') filteredTrades = filteredTrades.filter(t => (t.mode || 'futures') === 'futures');
    else if (filter === 'stocks') filteredTrades = filteredTrades.filter(t => t.mode === 'stocks');
    else if (filter === 'winners') filteredTrades = filteredTrades.filter(t => parseFloat(t.pl) > 0);
    else if (filter === 'losers') filteredTrades = filteredTrades.filter(t => parseFloat(t.pl) < 0);

    // Date filter
    if (filterDate) {
      filteredTrades = filteredTrades.filter(t => {
        const tradeDate = t.trade_date || t.date;
        const exitDate = t.exit_date;
        return tradeDate?.startsWith(filterDate) || exitDate?.startsWith(filterDate);
      });
    }

    // Sort by date (newest first)
    filteredTrades.sort((a, b) => {
      const dateA = new Date(a.exit_date || a.trade_date || a.date);
      const dateB = new Date(b.exit_date || b.trade_date || b.date);
      return dateB - dateA;
    });

    const container = document.getElementById('journalTrades');
    if (!container) return;

    if (filteredTrades.length === 0) {
      container.innerHTML = '<div class="empty-state">No trades found</div>';
      return;
    }

    container.innerHTML = filteredTrades.map(trade => {
      const pl = parseFloat(trade.pl);
      const plClass = pl >= 0 ? 'profit' : 'loss';
      const plSign = pl >= 0 ? '+' : '';
      const date = new Date(trade.exit_date || trade.trade_date || trade.date);
      
      return `
        <div class="trade-journal-item ${plClass}">
          <div>
            <div style="font-weight: bold; color: #00ff00; font-size: 1.25rem;">${trade.symbol}</div>
            <div style="color: #888; font-size: 0.75rem; margin-top: 0.25rem;">
              ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
            </div>
          </div>
          <div style="flex: 1; padding: 0 1rem;">
            <div style="margin-bottom: 0.5rem;">
              <span style="color: #888;">Direction:</span> 
              <span style="color: #00ff00;">${trade.direction.toUpperCase()}</span>
            </div>
            <div style="margin-bottom: 0.5rem;">
              <span style="color: #888;">Entry:</span> 
              <span style="color: #00ff00;">$${parseFloat(trade.entry_price).toFixed(2)}</span>
              <span style="color: #888;"> → Exit:</span> 
              <span style="color: #00ff00;">$${parseFloat(trade.exit_price).toFixed(2)}</span>
            </div>
            <div style="margin-bottom: 0.5rem;">
              <span style="color: #888;">Size:</span> 
              <span style="color: #00ff00;">${trade.contracts || trade.shares} ${trade.contracts ? 'contracts' : 'shares'}</span>
            </div>
            ${trade.setup_type ? `<div style="margin-bottom: 0.5rem;"><span style="color: #888;">Setup:</span> <span style="color: #00ff00;">${trade.setup_type}</span></div>` : ''}
            ${trade.notes ? `<div style="margin-top: 0.5rem; color: #888; font-size: 0.875rem;">${trade.notes}</div>` : ''}
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.5rem; font-weight: bold; color: ${parseFloat(trade.pl) >= 0 ? '#00ff00' : '#ff4444'};">
              ${plSign}$${parseFloat(trade.pl).toFixed(2)}
            </div>
            <div style="color: #888; font-size: 0.75rem; margin-top: 0.25rem;">
              ${((parseFloat(trade.pl) / (parseFloat(trade.entry_price) * (trade.contracts || trade.shares))) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // ===== PLANNER =====
  renderPlanner() {
    this.renderPlannedTrades();
    this.renderKeyLevels();
  },

  renderPlannedTrades() {
    const list = document.getElementById('plannedTradesList');
    if (!list) return;

    if (this.plannedTrades.length === 0) {
      list.innerHTML = '<div class="empty-state">No planned trades</div>';
      return;
    }

    list.innerHTML = this.plannedTrades.map(trade => `
      <div class="planned-trade-item">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <strong style="color: #00ff00;">${trade.symbol}</strong>
          <button class="btn-terminal btn-sm" onclick="TradingPlanner.removePlannedTrade(${trade.id})">REMOVE</button>
        </div>
        <div style="color: #888; font-size: 0.875rem;">
          ${trade.direction.toUpperCase()} | Entry: $${parseFloat(trade.entry_price).toFixed(2)} | Stop: $${trade.stop_loss ? parseFloat(trade.stop_loss).toFixed(2) : 'N/A'} | Target: $${trade.target ? parseFloat(trade.target).toFixed(2) : 'N/A'}
        </div>
        ${trade.notes ? `<div style="color: #888; font-size: 0.875rem; margin-top: 0.5rem;">${trade.notes}</div>` : ''}
      </div>
    `).join('');
  },

  renderKeyLevels() {
    const list = document.getElementById('keyLevelsList');
    if (!list) return;

    if (this.keyLevels.length === 0) {
      list.innerHTML = '<div class="empty-state">No key levels</div>';
      return;
    }

    list.innerHTML = this.keyLevels.map(level => `
      <div class="key-level-item">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <strong style="color: #00ff00;">${level.symbol} - $${parseFloat(level.price).toFixed(2)}</strong>
          <button class="btn-terminal btn-sm" onclick="TradingPlanner.removeKeyLevel(${level.id})">REMOVE</button>
        </div>
        <div style="color: #888; font-size: 0.875rem;">
          ${level.type.toUpperCase()} | ${level.notes || ''}
        </div>
      </div>
    `).join('');
  },

  async addPlannedTrade() {
    const symbol = prompt('Symbol:');
    if (!symbol) return;
    
    const entryPrice = parseFloat(prompt('Entry Price:'));
    if (!entryPrice) return;
    
    const direction = prompt('Direction (long/short):') || 'long';
    const stopLoss = parseFloat(prompt('Stop Loss:') || '0') || null;
    const target = parseFloat(prompt('Target:') || '0') || null;
    const notes = prompt('Notes:') || '';

    try {
      const created = await window.API.createPlannedTrade({
        symbol: symbol.toUpperCase(),
        direction: direction.toLowerCase(),
        entryPrice,
        stopLoss,
        target,
        notes
      });
      this.plannedTrades.push(created);
      this.renderPlannedTrades();
    } catch (error) {
      console.error('Error creating planned trade:', error);
      alert('Failed to create planned trade.');
    }
  },

  async removePlannedTrade(id) {
    try {
      await window.API.deletePlannedTrade(id);
      this.plannedTrades = this.plannedTrades.filter(t => t.id !== id);
      this.renderPlannedTrades();
    } catch (error) {
      console.error('Error deleting planned trade:', error);
      alert('Failed to delete planned trade.');
    }
  },

  async addKeyLevel() {
    const symbol = prompt('Symbol:');
    if (!symbol) return;
    
    const price = parseFloat(prompt('Price:'));
    if (!price) return;
    
    const type = prompt('Type (support/resistance):') || 'support';
    const notes = prompt('Notes:') || '';

    try {
      const created = await window.API.createKeyLevel({
        symbol: symbol.toUpperCase(),
        price,
        type: type.toLowerCase(),
        notes
      });
      this.keyLevels.push(created);
      this.renderKeyLevels();
    } catch (error) {
      console.error('Error creating key level:', error);
      alert('Failed to create key level.');
    }
  },

  async removeKeyLevel(id) {
    try {
      await window.API.deleteKeyLevel(id);
      this.keyLevels = this.keyLevels.filter(l => l.id !== id);
      this.renderKeyLevels();
    } catch (error) {
      console.error('Error deleting key level:', error);
      alert('Failed to delete key level.');
    }
  },

  // ===== ANALYTICS =====
  renderAnalytics() {
    this.calculateAnalytics();
    this.renderEquityCurve();
    this.renderPerformanceTables();
  },

  calculateAnalytics() {
    if (this.trades.length === 0) {
      document.getElementById('analyticsTotalPL').textContent = '$0.00';
      document.getElementById('analyticsWinRate').textContent = '0%';
      document.getElementById('analyticsAvgWin').textContent = '$0.00';
      document.getElementById('analyticsAvgLoss').textContent = '$0.00';
      document.getElementById('analyticsProfitFactor').textContent = '0.00';
      document.getElementById('analyticsMaxDD').textContent = '$0.00';
      return;
    }

    const totalPL = this.trades.reduce((sum, t) => sum + parseFloat(t.pl || 0), 0);
    const winners = this.trades.filter(t => parseFloat(t.pl || 0) > 0);
    const losers = this.trades.filter(t => parseFloat(t.pl || 0) < 0);
    const winRate = (winners.length / this.trades.length) * 100;
    const avgWin = winners.length > 0 ? winners.reduce((sum, t) => sum + parseFloat(t.pl || 0), 0) / winners.length : 0;
    const avgLoss = losers.length > 0 ? Math.abs(losers.reduce((sum, t) => sum + parseFloat(t.pl || 0), 0) / losers.length) : 0;
    const totalWins = winners.reduce((sum, t) => sum + parseFloat(t.pl || 0), 0);
    const totalLosses = Math.abs(losers.reduce((sum, t) => sum + parseFloat(t.pl || 0), 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

    // Calculate max drawdown
    let maxDD = 0;
    let peak = 0;
    let runningPL = 0;
    const sortedTrades = [...this.trades].sort((a, b) => {
      const dateA = new Date(a.exit_date || a.trade_date || a.date);
      const dateB = new Date(b.exit_date || b.trade_date || b.date);
      return dateA - dateB;
    });
    sortedTrades.forEach(trade => {
      runningPL += parseFloat(trade.pl || 0);
      if (runningPL > peak) peak = runningPL;
      const drawdown = peak - runningPL;
      if (drawdown > maxDD) maxDD = drawdown;
    });

    document.getElementById('analyticsTotalPL').textContent = `$${totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}`;
    document.getElementById('analyticsTotalPL').style.color = totalPL >= 0 ? '#00ff00' : '#ff4444';
    document.getElementById('analyticsWinRate').textContent = `${winRate.toFixed(1)}%`;
    document.getElementById('analyticsAvgWin').textContent = `$${avgWin.toFixed(2)}`;
    document.getElementById('analyticsAvgLoss').textContent = `$${avgLoss.toFixed(2)}`;
    document.getElementById('analyticsProfitFactor').textContent = profitFactor.toFixed(2);
    document.getElementById('analyticsMaxDD').textContent = `$${maxDD.toFixed(2)}`;
  },

  renderEquityCurve() {
    const canvas = document.getElementById('equityCurveChart');
    if (!canvas || this.trades.length === 0) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;

    // Sort trades by date
    const sortedTrades = [...this.trades].sort((a, b) => {
      const dateA = new Date(a.exit_date || a.trade_date || a.date);
      const dateB = new Date(b.exit_date || b.trade_date || b.date);
      return dateA - dateB;
    });

    // Calculate equity curve
    let runningPL = 0;
    const equityPoints = sortedTrades.map(trade => {
      runningPL += parseFloat(trade.pl || 0);
      return runningPL;
    });

    if (equityPoints.length === 0) return;

    const maxPL = Math.max(...equityPoints, 0);
    const minPL = Math.min(...equityPoints, 0);
    const range = maxPL - minPL || 1;
    const padding = 20;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw equity curve
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    equityPoints.forEach((pl, index) => {
      const x = padding + (width / (equityPoints.length - 1 || 1)) * index;
      const y = padding + height - ((pl - minPL) / range) * height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw zero line
    if (minPL < 0 && maxPL > 0) {
      const zeroY = padding + height - ((0 - minPL) / range) * height;
      ctx.strokeStyle = '#888';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, zeroY);
      ctx.lineTo(canvas.width - padding, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  },

  renderPerformanceTables() {
    // Setup performance
    const setupStats = {};
    this.trades.forEach(trade => {
      const setup = trade.setup_type || 'Other';
      const pl = parseFloat(trade.pl || 0);
      if (!setupStats[setup]) {
        setupStats[setup] = { count: 0, totalPL: 0, wins: 0 };
      }
      setupStats[setup].count++;
      setupStats[setup].totalPL += pl;
      if (pl > 0) setupStats[setup].wins++;
    });

    const setupTable = document.getElementById('setupPerformanceTable');
    if (setupTable) {
      setupTable.innerHTML = `
        <thead>
          <tr>
            <th>Setup</th>
            <th>Trades</th>
            <th>Win Rate</th>
            <th>P&L</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(setupStats).map(([setup, stats]) => `
            <tr>
              <td>${setup}</td>
              <td>${stats.count}</td>
              <td>${((stats.wins / stats.count) * 100).toFixed(1)}%</td>
              <td style="color: ${stats.totalPL >= 0 ? '#00ff00' : '#ff4444'}">
                ${stats.totalPL >= 0 ? '+' : ''}$${stats.totalPL.toFixed(2)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      `;
    }

    // Symbol performance
    const symbolStats = {};
    this.trades.forEach(trade => {
      const symbol = trade.symbol;
      const pl = parseFloat(trade.pl || 0);
      if (!symbolStats[symbol]) {
        symbolStats[symbol] = { count: 0, totalPL: 0, wins: 0 };
      }
      symbolStats[symbol].count++;
      symbolStats[symbol].totalPL += pl;
      if (pl > 0) symbolStats[symbol].wins++;
    });

    const symbolTable = document.getElementById('symbolPerformanceTable');
    if (symbolTable) {
      symbolTable.innerHTML = `
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Trades</th>
            <th>Win Rate</th>
            <th>P&L</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(symbolStats).map(([symbol, stats]) => `
            <tr>
              <td>${symbol}</td>
              <td>${stats.count}</td>
              <td>${((stats.wins / stats.count) * 100).toFixed(1)}%</td>
              <td style="color: ${stats.totalPL >= 0 ? '#00ff00' : '#ff4444'}">
                ${stats.totalPL >= 0 ? '+' : ''}$${stats.totalPL.toFixed(2)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      `;
    }
  },

  // ===== PLAYBOOK =====
  renderPlaybook() {
    this.renderExecutionStages();
    this.renderPsychology();
  },

  renderExecutionStages() {
    const stages = ['pre-market', 'setup', 'entry', 'management', 'exit', 'review'];
    stages.forEach(stage => {
      const checkbox = document.getElementById(`stage${stages.indexOf(stage) + 1}`);
      if (checkbox) {
        checkbox.checked = this.executionStages[stage] || false;
        checkbox.addEventListener('change', async (e) => {
          const stage = e.target.dataset.stage;
          this.executionStages[stage] = e.target.checked;
          await window.API.saveExecutionStages(this.executionStages);
        });
      }
    });
  },

  renderPsychology() {
    const container = document.getElementById('psychologyHistory');
    if (!container) return;

    if (this.psychology.length === 0) {
      container.innerHTML = '<div class="empty-state">No psychology entries</div>';
      return;
    }

    container.innerHTML = this.psychology.slice(-10).reverse().map(entry => {
      const date = new Date(entry.date || entry.created_at);
      return `
        <div class="psychology-entry">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <strong style="color: #00ff00;">${entry.state}</strong>
            <span style="color: #888; font-size: 0.75rem;">${date.toLocaleString()}</span>
          </div>
          ${entry.notes ? `<div style="color: #888;">${entry.notes}</div>` : ''}
        </div>
      `;
    }).join('');
  },

  async savePsychology() {
    const state = document.getElementById('emotionalState').value;
    const notes = document.getElementById('psychologyNotes').value;

    if (!state) return;

    try {
      const created = await window.API.createPsychologyEntry({ state, notes });
      this.psychology.push(created);
      document.getElementById('psychologyNotes').value = '';
      this.renderPsychology();
    } catch (error) {
      console.error('Error saving psychology entry:', error);
      alert('Failed to save psychology entry.');
    }
  },

  // ===== TRADINGVIEW =====
  initTradingView() {
    this.updateTradingView();
  },

  updateTradingView() {
    const symbol = document.getElementById('chartSymbol')?.value || 'MES';
    const timeframe = document.getElementById('chartTimeframe')?.value || '60';
    
    // Map symbols to TradingView format
    const symbolMap = {
      'MES': 'CME_MINI:ES1!',
      'MNQ': 'CME_MINI:NQ1!',
      'PL': 'NYMEX:PL1!',
      'SIL': 'COMEX:SI1!'
    };

    const tvSymbol = symbolMap[symbol] || symbolMap['MES'];
    const container = document.getElementById('tradingview-chart');
    if (!container) return;

    container.innerHTML = '';

    new TradingView.widget({
      autosize: true,
      symbol: tvSymbol,
      interval: timeframe,
      timezone: 'America/New_York',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#000000',
      enable_publishing: false,
      hide_top_toolbar: true,
      hide_legend: false,
      save_image: false,
      container_id: 'tradingview-chart',
      studies: []
    });
  },

  // ===== UTILITY =====
  focusTradeEntry() {
    this.switchTab('terminal');
    document.getElementById('tradeSymbol')?.focus();
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  const savedTheme = localStorage.getItem('hubTheme') || 'cosmic';
  document.body.setAttribute('data-theme', savedTheme);
  
  // Check if user is authenticated
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '../../login.html';
    return;
  }
  
  await TradingPlanner.init();
});
