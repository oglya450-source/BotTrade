import os
import json
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackContext, MessageHandler, filters

# Настройка логирования
logger = logging.getLogger(__name__)

class MiniAppManager:
    def __init__(self, bot_token: str):
        self.bot_token = bot_token
        # Замените на ваш реальный URL после размещения файлов
        self.web_app_url = "https://yourdomain.com/mini_app/index.html"
    
    async def start_with_webapp(self, update: Update, context: CallbackContext):
        """Команда для запуска Mini App"""
        try:
            user = update.effective_user
            username = f"@{user.username}" if user.username else user.first_name
            
            keyboard = [
                [InlineKeyboardButton("🚀 Открыть Trading App", web_app={"url": self.web_app_url})]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(
                f"📱 *Добро пожаловать, {username}!*\n\n"
                "Нажмите кнопку ниже чтобы открыть современный торговый интерфейс:",
                parse_mode='Markdown',
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"Error in start_with_webapp: {e}")
            await update.message.reply_text("❌ Ошибка при открытии приложения")

    async def handle_webapp_data(self, update: Update, context: CallbackContext):
        """Обработка данных из Web App"""
        try:
            if not update.message or not update.message.web_app_data:
                await update.message.reply_text("❌ Нет данных от WebApp")
                return
            
            data = json.loads(update.message.web_app_data.data)
            user_id = update.effective_user.id
            
            logger.info(f"Received WebApp data from user {user_id}: {data}")
            
            # Обработка различных типов данных из Mini App
            action_type = data.get('type', 'unknown')
            
            if action_type == 'trade':
                await self.process_trade(user_id, data)
            elif action_type == 'get_balance':
                await self.send_balance(user_id, update)
            elif action_type == 'get_portfolio':
                await self.send_portfolio(user_id, update)
            else:
                logger.warning(f"Unknown WebApp action type: {action_type}")
                await update.message.reply_text("⚠️ Неизвестный тип запроса")
            
            await update.message.reply_text("✅ Запрос обработан успешно")
            
        except json.JSONDecodeError:
            await update.message.reply_text("❌ Ошибка формата данных")
        except Exception as e:
            logger.error(f"Error processing webapp data: {e}")
            await update.message.reply_text("❌ Ошибка обработки данных")

    async def process_trade(self, user_id: int, data: dict):
        """Обработка торговой операции из Mini App"""
        try:
            symbol = data.get('symbol', 'BTC/USDT')
            side = data.get('side', 'buy')
            amount = float(data.get('amount', 0))
            
            logger.info(f"Processing trade: User {user_id} {side} {amount} {symbol}")
            
            # Здесь ваша логика обработки сделки
            # Например, вызов методов из основного бота
            
            # Временная заглушка - имитация успешной сделки
            if amount <= 0:
                raise ValueError("Неверная сумма")
                
            # Ваша реальная логика торговли здесь
            
        except ValueError as e:
            logger.error(f"Trade validation error: {e}")
            raise
        except Exception as e:
            logger.error(f"Trade processing error: {e}")
            raise

    async def send_balance(self, user_id: int, update: Update):
        """Отправка баланса пользователю"""
        try:
            # Здесь получение реального баланса из вашей системы
            # Это пример - замените на вашу логику
            
            balance_data = {
                'total': 5247.89,
                'available': 1245.75,
                'locked': 0.0,
                'currencies': [
                    {'symbol': 'USDT', 'amount': 1245.75, 'value': 1245.75},
                    {'symbol': 'BTC', 'amount': 0.1254, 'value': 8245.67},
                    {'symbol': 'ETH', 'amount': 5.21, 'value': 18542.10}
                ]
            }
            
            # Форматируем сообщение
            message = (
                "💰 *Ваш баланс:*\n\n"
                f"• Общий: ${balance_data['total']:,.2f}\n"
                f"• Доступно: ${balance_data['available']:,.2f}\n"
                f"• Заблокировано: ${balance_data['locked']:,.2f}\n\n"
                "📊 *Активы:*\n"
            )
            
            for currency in balance_data['currencies']:
                message += f"• {currency['symbol']}: {currency['amount']} (${currency['value']:,.2f})\n"
            
            await update.message.reply_text(message, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"Error sending balance: {e}")
            await update.message.reply_text("❌ Ошибка получения баланса")

    async def send_portfolio(self, user_id: int, update: Update):
        """Отправка информации о портфеле"""
        try:
            # Здесь получение реального портфеля из вашей системы
            portfolio_data = {
                'total_value': 28733.52,
                'daily_change': +2.3,
                'assets': [
                    {'symbol': 'BTC', 'amount': 0.1254, 'value': 8245.67, 'percent': 28.7},
                    {'symbol': 'ETH', 'amount': 5.21, 'value': 18542.10, 'percent': 64.5},
                    {'symbol': 'USDT', 'amount': 1245.75, 'value': 1245.75, 'percent': 4.3}
                ]
            }
            
            message = (
                "📈 *Ваш портфель:*\n\n"
                f"• Общая стоимость: ${portfolio_data['total_value']:,.2f}\n"
                f"• Изменение за день: {portfolio_data['daily_change']:+.1f}%\n\n"
                "📋 *Распределение:*\n"
            )
            
            for asset in portfolio_data['assets']:
                change_emoji = "📈" if asset['percent'] > 5 else "📊"
                message += f"• {asset['symbol']}: {asset['amount']} (${asset['value']:,.2f}) {change_emoji}\n"
            
            await update.message.reply_text(message, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"Error sending portfolio: {e}")
            await update.message.reply_text("❌ Ошибка получения портфеля")

async def test_mini_app(update: Update, context: CallbackContext):
    """Тестовая команда для проверки Mini App"""
    try:
        await update.message.reply_text(
            "✅ *Mini App интеграция активна!*\n\n"
            "Доступные команды:\n"
            "• /app - Открыть веб-приложение\n"
            "• /balance - Показать баланс\n"
            "• /portfolio - Показать портфель\n\n"
            "⚡ *Приложение включает:*\n"
            "• Современный интерфейс\n"
            "• Графики и аналитику\n"
            "• Быструю торговлю\n"
            "• Управление портфелем",
            parse_mode='Markdown'
        )
    except Exception as e:
        logger.error(f"Test command error: {e}")
        await update.message.reply_text("❌ Ошибка тестовой команды")

async def quick_balance(update: Update, context: CallbackContext):
    """Быстрая команда для проверки баланса"""
    try:
        # Временная реализация - замените на вашу логику
        balance_info = (
            "💰 *Баланс:* $5,247.89\n"
            "💵 *Доступно:* $1,245.75\n"
            "🔒 *В ордерах:* $4,002.14\n\n"
            "📊 *Активы:*\n"
            "• BTC: 0.1254 ($8,245.67)\n"
            "• ETH: 5.21 ($18,542.10)\n"
            "• USDT: 1,245.75 ($1,245.75)"
        )
        
        await update.message.reply_text(balance_info, parse_mode='Markdown')
        
    except Exception as e:
        logger.error(f"Quick balance error: {e}")
        await update.message.reply_text("❌ Ошибка получения баланса")

def setup_mini_app_handlers(application: Application):
    """Добавление обработчиков для Mini App"""
    try:
        mini_app_manager = MiniAppManager(application.bot.token)
        
        # Основные команды
        application.add_handler(CommandHandler("app", mini_app_manager.start_with_webapp))
        application.add_handler(CommandHandler("test_app", test_mini_app))
        application.add_handler(CommandHandler("balance", quick_balance))
        
        # Обработчик данных из WebApp
        async def safe_webapp_handler(update: Update, context: CallbackContext):
            try:
                return await mini_app_manager.handle_webapp_data(update, context)
            except Exception as e:
                logger.error(f"WebApp handler error: {e}")
                await update.message.reply_text("❌ Ошибка обработки запроса от приложения")
        
        # Добавляем обработчик WebApp данных
        application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, safe_webapp_handler))
        
        logger.info("✅ Mini App handlers registered successfully")
        
    except Exception as e:
        logger.error(f"Failed to setup Mini App handlers: {e}")
        raise

# Функция для проверки доступности Mini App
def is_mini_app_available():
    """Проверка, доступен ли модуль Mini App"""
    try:
        from mini_app.config import setup_mini_app_handlers
        return True
    except ImportError:
        return False