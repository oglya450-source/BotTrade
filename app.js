class TradingApp {
    constructor() {
        this.init();
        this.bindEvents();
        this.loadUserData();
    }

    init() {
        this.tg = window.Telegram.WebApp;
        this.tg.expand();
        this.tg.enableClosingConfirmation();
        
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

        // Trade buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.classList.contains('buy-btn')) {
                    this.executeTrade('buy');
                } else if (e.target.classList.contains('sell-btn')) {
                    this.executeTrade('sell');
                }
            });
        });

        // Telegram events
        this.tg.onEvent('viewportChanged', this.onViewportChanged.bind(this));
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

    async loadUserData() {
        try {
            // Simulate API call
            this.userData = {
                username: this.tg.initDataUnsafe.user?.username || 'trader',
                balance: 5247.89,
                assets: [
                    { symbol: 'BTC', amount: 0.1254, value: 8245.67 },
                    { symbol: 'ETH', amount: 5.21, value: 18542.10 },
                    { symbol: 'USDT', amount: 1245.75, value: 1245.75 }
                ],
                trades: [
                    { type: 'buy', symbol: 'BTC', amount: 0.005, price: 32500 },
                    { type: 'sell', symbol: 'ETH', amount: 2.1, price: 2100 }
                ]
            };

            this.updateUI();
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showError('Ошибка загрузки данных');
        }
    }

    updateUI() {
        if (!this.userData) return;

        // Update user info
        const usernameEl = document.querySelector('.username');
        const balanceEl = document.querySelector('.balance');
        
        if (usernameEl) usernameEl.textContent = '@' + this.userData.username;
        if (balanceEl) balanceEl.textContent = '$' + this.userData.balance.toLocaleString();

        // Update balance card
        const balanceAmount = document.querySelector('.balance-amount');
        if (balanceAmount) balanceAmount.textContent = '$' + this.userData.balance.toLocaleString();

        // Update asset list
        this.updateAssetList();
        
        // Update trade history
        this.updateTradeHistory();
    }

    updateAssetList() {
        const assetList = document.querySelector('.asset-list');
        if (!assetList) return;

        assetList.innerHTML = this.userData.assets.map(asset => `
            <div class="asset-item">
                <span>${asset.symbol}</span>
                <span>${asset.amount}</span>
                <span>$${asset.value.toLocaleString()}</span>
            </div>
        `).join('');
    }

    updateTradeHistory() {
        const tradeList = document.querySelector('.trade-list');
        if (!tradeList) return;

        tradeList.innerHTML = this.userData.trades.map(trade => `
            <div class="trade-item ${trade.type}">
                <span>${trade.type.toUpperCase()} ${trade.symbol}</span>
                <span>${trade.type === 'buy' ? '+' : '-'}${trade.amount} ${trade.symbol}</span>
                <span>$${(trade.amount * trade.price).toLocaleString()}</span>
            </div>
        `).join('');
    }

    async executeTrade(type) {
        const amountInput = document.querySelector('.input');
        const amount = parseFloat(amountInput.value);
        
        if (!amount || amount <= 0) {
            this.showError('Введите корректную сумму');
            return;
        }

        try {
            this.showLoader('Выполнение сделки...');
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Add to trade history
            this.userData.trades.unshift({
                type: type,
                symbol: 'BTC', // Get from select
                amount: amount,
                price: type === 'buy' ? 50000 : 49000
            });
            
            this.updateTradeHistory();
            this.showSuccess(`Сделка ${type.toUpperCase()} выполнена!`);
            amountInput.value = '';
            
        } catch (error) {
            this.showError('Ошибка выполнения сделки');
        } finally {
            this.hide
    } catch (error) {
        this.showError('Ошибка выполнения сделки');
    } finally {
        this.hideLoader();
    }
}

showLoader(message = 'Загрузка...') {
    // Создаем loader если его нет
    if (!document.getElementById('loader')) {
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.innerHTML = `
            <div class="loader-overlay">
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <div class="loader-text">${message}</div>
                </div>
            </div>
        `;
        document.body.appendChild(loader);
    } else {
        document.querySelector('.loader-text').textContent = message;
        document.getElementById('loader').style.display = 'flex';
    }
}

hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

showError(message) {
    this.showNotification(message, 'error');
}

showSuccess(message) {
    this.showNotification(message, 'success');
}

showNotification(message, type = 'info') {
    // Удаляем предыдущие уведомления
    const existingNotice = document.getElementById('notification');
    if (existingNotice) {
        existingNotice.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
            <span class="notification-text">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Показываем с анимацией
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

onViewportChanged(event) {
    console.log('Viewport changed:', event);
    // Можно добавить адаптацию под изменение размера окна
}

// Методы для работы с API бота
async callBotMethod(method, data = {}) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${this.getBotToken()}/${method}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (!result.ok) {
            throw new Error(result.description);
        }

        return result.result;
    } catch (error) {
        console.error('API Error:', error);
        this.showError('Ошибка соединения с сервером');
        throw error;
    }
}

getBotToken() {
    // Токен должен быть защищен - лучше хранить на сервере
    return '8364374297:AAGKiibo2m-3296Shh3KnWL8o7WZ08m0JY0';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, что мы в Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        window.tradingApp = new TradingApp();
        
        // Отправляем данные о запуске в бот
        const initData = window.Telegram.WebApp.initData;
        if (initData) {
            fetch('/api/webapp-init', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ initData })
            }).catch(console.error);
        }
    } else {
        // Режим разработки - симулируем Telegram WebApp
        console.log('Development mode: Simulating Telegram WebApp');
        window.Telegram = {
            WebApp: {
                initDataUnsafe: {
                    user: {
                        username: 'test_user',
                        first_name: 'Test',
                        last_name: 'User'
                    }
                },
                expand: () => console.log('App expanded'),
                enableClosingConfirmation: () => console.log('Closing confirmation enabled'),
                onEvent: (event, callback) => console.log('Event listener added:', event)
            }
        };
        
        window.tradingApp = new TradingApp();
    }
});

// Глобальные функции для взаимодействия с Telegram
function closeWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.close();
    }
}

function showAlert(message) {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showAlert(message);
    } else {
        alert(message);
    }
}

function showConfirm(message, callback) {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showConfirm(message, callback);
    } else {
        const result = confirm(message);
        callback(result);
    }
}