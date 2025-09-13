class TradingApp {
    constructor() {
        this.init();
        this.bindEvents();
        this.loadUserData();
    }

    init() {
        // Проверяем, что мы в Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.initData = this.tg.initDataUnsafe;
        } else {
            // Режим разработки
            console.log('Development mode: Simulating Telegram WebApp');
            this.initData = {
                user: {
                    id: 123456789,
                    first_name: 'Test',
                    last_name: 'User',
                    username: 'test_user',
                    photo_url: 'https://via.placeholder.com/40'
                }
            };
        }
        
        this.currentTab = 'dashboard';
        this.userData = null;
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Order type buttons
        document.querySelectorAll('[data-type]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    async loadUserData() {
        this.showLoader('Загрузка данных...');
        
        try {
            // Симуляция загрузки данных
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.userData = {
                user: this.initData.user,
                balance: 5247.89,
                assets: [
                    { symbol: 'BTC', amount: 0.1254, value: 8245.67 },
                    { symbol: 'ETH', amount: 5.21, value: 18542.10 },
                    { symbol: 'USDT', amount: 1245.75, value: 1245.75 }
                ],
                trades: [
                    { type: 'buy', symbol: 'BTC', amount: 0.005, price: 32500, time: '10:30' },
                    { type: 'sell', symbol: 'ETH', amount: 2.1, price: 2100, time: '09:15' }
                ]
            };

            this.updateUI();
            this.hideLoader();
            
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showError('Ошибка загрузки данных');
            this.hideLoader();
        }
    }

    updateUI() {
        if (!this.userData) return;

        // Update user info
        const user = this.userData.user;
        document.getElementById('user-name').textContent = 
            user.username ? `@${user.username}` : `${user.first_name} ${user.last_name || ''}`;
        
        document.getElementById('user-balance').textContent = 
            `$${this.userData.balance.toLocaleString()}`;

        // Update balance
        document.getElementById('total-balance').textContent = 
            `$${this.userData.balance.toLocaleString()}`;

        // Update portfolio
        this.updatePortfolio();
        this.updateTradeHistory();
    }

    updatePortfolio() {
        const container = document.getElementById('portfolio-assets');
        if (!container) return;

        container.innerHTML = this.userData.assets.map(asset => `
            <div class="asset-item">
                <span>${asset.symbol}</span>
                <span>${asset.amount}</span>
                <span>$${asset.value.toLocaleString()}</span>
            </div>
        `).join('');
    }

    updateTradeHistory() {
        const container = document.getElementById('trade-history');
        if (!container) return;

        container.innerHTML = this.userData.trades.map(trade => `
            <div class="trade-item ${trade.type}">
                <span>${trade.type.toUpperCase()} ${trade.symbol}</span>
                <span>${trade.type === 'buy' ? '+' : '-'}${trade.amount}</span>
                <span>$${(trade.amount * trade.price).toLocaleString()}</span>
            </div>
        `).join('');
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.currentTab = tabName;
    }

    showLoader(message) {
        const loader = document.getElementById('loader');
        const loaderText = document.querySelector('.loader-text');
        
        loaderText.textContent = message;
        loader.style.display = 'flex';
    }

    hideLoader() {
        document.getElementById('loader').style.display = 'none';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = document.querySelector('.notification-text');
        const notificationIcon = document.querySelector('.notification-icon');
        
        notification.className = `notification ${type}`;
        notificationText.textContent = message;
        notificationIcon.textContent = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        
        notification.style.display = 'block';
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
    }
}

// Global functions
function executeTrade(side) {
    const amount = document.getElementById('trade-amount').value;
    const symbol = document.getElementById('trade-symbol').value;
    
    if (!amount || amount <= 0) {
        window.tradingApp.showError('Введите корректную сумму');
        return;
    }
    
    window.tradingApp.showLoader('Выполнение сделки...');
    
    // Симуляция торговли
    setTimeout(() => {
        window.tradingApp.showSuccess(`${side.toUpperCase()} ${amount} ${symbol} выполнено!`);
        window.tradingApp.hideLoader();
        document.getElementById('trade-amount').value = '';
    }, 1500);
}

function closeApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.close();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.tradingApp = new TradingApp();
});