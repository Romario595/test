// Данные для кнопок
const buttonData = {
    nutrition: [
        { name: "Завтрак", subButtons: ["Овсянка", "Яйца", "Тост"] },
        { name: "Обед", subButtons: ["Суп", "Салат", "Мясо"] },
        { name: "Ужин", subButtons: ["Рыба", "Овощи", "Курица"] },
        { name: "Перекус", subButtons: ["Фрукты", "Орехи", "Йогурт"] },
        { name: "Напитки", subButtons: ["Вода", "Сок", "Чай"] }
    ],
    allergy: [
        { name: "Пищевая", subButtons: ["Орехи", "Молоко", "Яйца"] },
        { name: "Сезонная", subButtons: ["Пыльца", "Трава", "Деревья"] },
        { name: "Лекарства", subButtons: ["Антибиотики", "Аспирин", "Пенициллин"] }
    ],
    sleep: [
        { name: "Качество", subButtons: ["Хорошее", "Плохое", "Прерывистый"] },
        { name: "Продолжительность", subButtons: ["<6ч", "6-8ч", ">8ч"] },
        { name: "Проблемы", subButtons: ["Бессонница", "Храп", "Апноэ"] }
    ],
    other: [
        { name: "Настроение", subButtons: ["Хорошее", "Нормальное", "Плохое"] },
        { name: "Активность", subButtons: ["Высокая", "Средняя", "Низкая"] },
        { name: "Симптомы", subButtons: ["Головная боль", "Температура", "Слабость"] }
    ]
};

class HealthApp {
    constructor() {
        this.currentCategory = 'nutrition';
        this.currentMiddleButton = null;
        this.init();
    }

    init() {
        this.initTelegramApp();
        this.bindEvents();
        this.loadCategoryButtons(this.currentCategory);
        this.updateCentering();
    }

    initTelegramApp() {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            Telegram.WebApp.setHeaderColor('#007bff');
            Telegram.WebApp.setBackgroundColor('#ffffff');
        }
    }

    bindEvents() {
        // Обработчики для категорий
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.selectCategory(category);
            });
        });

        // Обработчик изменения размера окна
        window.addEventListener('resize', () => {
            this.updateCentering();
        });
    }

    selectCategory(category) {
        // Обновляем активную категорию
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.currentCategory = category;
        this.currentMiddleButton = null;
        
        // Загружаем кнопки для выбранной категории
        this.loadCategoryButtons(category);
        
        // Очищаем правую панель
        this.clearRightPanel();
    }

    loadCategoryButtons(category) {
        const middlePanel = document.getElementById('middle-buttons');
        middlePanel.innerHTML = '';

        const buttons = buttonData[category] || [];
        
        buttons.forEach((button, index) => {
            const buttonElement = document.createElement('button');
            buttonElement.className = 'button';
            buttonElement.textContent = button.name;
            buttonElement.dataset.index = index;
            
            buttonElement.addEventListener('click', (e) => {
                this.selectMiddleButton(button, e.target);
            });
            
            middlePanel.appendChild(buttonElement);
        });

        this.updateCentering();
    }

    selectMiddleButton(buttonData, buttonElement) {
        // Снимаем выделение со всех кнопок средней панели
        document.querySelectorAll('#middle-buttons .button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Выделяем выбранную кнопку
        buttonElement.classList.add('active');
        
        this.currentMiddleButton = buttonData;
        this.loadRightPanel(buttonData.subButtons);
    }

    loadRightPanel(subButtons) {
        const rightPanel = document.getElementById('right-buttons');
        rightPanel.innerHTML = '';

        subButtons.forEach((subButton, index) => {
            const buttonElement = document.createElement('button');
            buttonElement.className = 'button';
            buttonElement.textContent = subButton;
            
            buttonElement.addEventListener('click', () => {
                this.handleRightButtonClick(subButton);
            });
            
            rightPanel.appendChild(buttonElement);
        });

        this.updateCentering();
    }

    clearRightPanel() {
        const rightPanel = document.getElementById('right-buttons');
        rightPanel.innerHTML = '';
        this.updateCentering();
    }

    handleRightButtonClick(buttonName) {
        // Здесь можно добавить логику обработки нажатия на кнопку правой панели
        console.log(`Выбрано: ${this.currentCategory} -> ${this.currentMiddleButton?.name} -> ${buttonName}`);
        
        // Пример показа уведомления в Telegram
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.showPopup({
                title: 'Выбор сохранен',
                message: `Вы выбрали: ${buttonName}`,
                buttons: [{ type: 'ok' }]
            });
        }
    }

    updateCentering() {
        const containers = document.querySelectorAll('.buttons-container');
        
        containers.forEach(container => {
            const buttons = container.querySelectorAll('.button, .category-btn');
            const containerHeight = container.clientHeight;
            const buttonsHeight = Array.from(buttons).reduce((total, btn) => {
                return total + btn.offsetHeight + 10; // 10px - gap
            }, 0);
            
            if (buttonsHeight < containerHeight) {
                container.classList.add('centered');
            } else {
                container.classList.remove('centered');
            }
        });
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new HealthApp();
});