// Расширенные данные для кнопок
const buttonData = {
    nutrition: [
        { 
            name: "Завтрак", 
            subButtons: [
                { name: "Овсянка", ingredients: ["Овсяные хлопья", "Молоко", "Мед", "Фрукты"] },
                { name: "Яйца", ingredients: ["Яйца куриные", "Масло", "Соль", "Перец"] },
                { name: "Тост", ingredients: ["Хлеб", "Масло", "Варенье", "Сыр"] }
            ] 
        },
        { 
            name: "Обед", 
            subButtons: [
                { name: "Суп", ingredients: ["Куриный бульон", "Картофель", "Морковь", "Лук", "Лапша", "Зелень"] },
                { name: "Салат", ingredients: ["Помидоры", "Огурцы", "Лук", "Масло", "Соль"] },
                { name: "Мясо", ingredients: ["Говядина", "Специи", "Масло", "Чеснок"] }
            ] 
        },
        { 
            name: "Ужин", 
            subButtons: [
                { name: "Рыба", ingredients: ["Филе рыбы", "Лимон", "Специи", "Овощи"] },
                { name: "Овощи", ingredients: ["Брокколи", "Морковь", "Цветная капуста", "Специи"] },
                { name: "Курица", ingredients: ["Куриное филе", "Специи", "Оливковое масло"] }
            ] 
        }
    ],
    allergy: [
        { 
            name: "Пищевая", 
            subButtons: [
                { name: "Орехи", ingredients: ["Арахис", "Грецкие орехи", "Миндаль", "Фундук"] },
                { name: "Молоко", ingredients: ["Лактоза", "Казеин"] },
                { name: "Яйца", ingredients: ["Белок", "Желток"] }
            ] 
        }
    ],
    sleep: [
        { 
            name: "Качество", 
            subButtons: [
                { name: "Хорошее", ingredients: ["Быстрое засыпание", "Глубокий сон", "Легкое пробуждение"] },
                { name: "Плохое", ingredients: ["Бессонница", "Поверхностный сон", "Частые пробуждения"] }
            ] 
        }
    ],
    other: [
        { 
            name: "Настроение", 
            subButtons: [
                { name: "Хорошее", ingredients: ["Энергия", "Улыбка", "Оптимизм"] },
                { name: "Плохое", ingredients: ["Усталость", "Раздражительность", "Апатия"] }
            ] 
        }
    ]
};

class HealthApp {
    constructor() {
        this.currentState = {
            category: null,
            middleButton: null,
            selectedIngredients: new Set(),
            history: []
        };
        this.init();
    }

    init() {
        this.initTelegramApp();
        this.bindEvents();
        this.showMainCategories();
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
        document.getElementById('start-over-btn').addEventListener('click', () => {
            this.startOver();
        });

        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveSelection();
        });
    }

    showMainCategories() {
        const leftPanel = document.getElementById('left-buttons');
        leftPanel.innerHTML = '';

        Object.keys(buttonData).forEach(category => {
            const button = document.createElement('button');
            button.className = 'button';
            button.textContent = this.getCategoryName(category);
            button.dataset.category = category;
            
            button.addEventListener('click', (e) => {
                this.selectCategory(category);
            });
            
            leftPanel.appendChild(button);
        });

        // Очищаем остальные панели
        document.getElementById('middle-buttons').innerHTML = '';
        document.getElementById('right-buttons').innerHTML = '';
        
        // Показываем все панели
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('hidden');
        });
        
        // Скрываем нижние кнопки
        document.getElementById('bottom-buttons').classList.add('hidden');
        
        this.currentState = {
            category: null,
            middleButton: null,
            selectedIngredients: new Set(),
            history: []
        };
        
        this.updateCentering();
    }

    getCategoryName(category) {
        const names = {
            nutrition: 'Питание',
            allergy: 'Аллергия',
            sleep: 'Сон',
            other: 'Другое'
        };
        return names[category] || category;
    }

    selectCategory(category) {
        this.currentState.category = category;
        this.currentState.history.push({ type: 'category', value: category });
        
        this.loadMiddleButtons(category);
        this.updateCentering();
    }

    loadMiddleButtons(category) {
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

        // Очищаем правую панель
        document.getElementById('right-buttons').innerHTML = '';
        this.updateCentering();
    }

    selectMiddleButton(buttonData, buttonElement) {
        this.currentState.middleButton = buttonData;
        this.currentState.history.push({ type: 'middle', value: buttonData.name });
        
        // Сдвигаем панели
        this.shiftPanels();
        this.loadRightPanel(buttonData.subButtons);
    }

    shiftPanels() {
        const panels = document.querySelectorAll('.panel');
        
        // Левая панель скрывается
        panels[0].classList.add('hidden');
        
        // Средняя панель становится левой (показываем выбранную кнопку)
        const middleButtons = document.getElementById('middle-buttons');
        const selectedButton = middleButtons.querySelector('.button.active');
        if (selectedButton) {
            selectedButton.classList.remove('active');
        }
        
        // Загружаем под-кнопки в среднюю панель
        this.loadSubButtonsInMiddle();
        
        // Показываем нижние кнопки
        document.getElementById('bottom-buttons').classList.remove('hidden');
    }

    loadSubButtonsInMiddle() {
        const middlePanel = document.getElementById('middle-buttons');
        middlePanel.innerHTML = '';

        if (this.currentState.middleButton && this.currentState.middleButton.subButtons) {
            this.currentState.middleButton.subButtons.forEach((subButton, index) => {
                const buttonElement = document.createElement('button');
                buttonElement.className = 'button';
                buttonElement.textContent = subButton.name;
                buttonElement.dataset.index = index;
                
                buttonElement.addEventListener('click', (e) => {
                    this.selectSubButton(subButton, e.target);
                });
                
                middlePanel.appendChild(buttonElement);
            });
        }
    }

    selectSubButton(subButtonData, buttonElement) {
        // Помечаем кнопку как активную
        document.querySelectorAll('#middle-buttons .button').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');
        
        this.currentState.history.push({ type: 'subButton', value: subButtonData.name });
        this.loadIngredients(subButtonData.ingredients);
    }

    loadIngredients(ingredients) {
        const rightPanel = document.getElementById('right-buttons');
        rightPanel.innerHTML = '';

        ingredients.forEach((ingredient, index) => {
            const buttonElement = document.createElement('button');
            buttonElement.className = `button checkbox-button ${this.currentState.selectedIngredients.has(ingredient) ? 'selected' : ''}`;
            buttonElement.innerHTML = `
                <span>${ingredient}</span>
                <div class="checkmark"></div>
            `;
            
            buttonElement.addEventListener('click', () => {
                this.toggleIngredient(ingredient, buttonElement);
            });
            
            rightPanel.appendChild(buttonElement);
        });

        this.updateCentering();
    }

    toggleIngredient(ingredient, buttonElement) {
        if (this.currentState.selectedIngredients.has(ingredient)) {
            this.currentState.selectedIngredients.delete(ingredient);
            buttonElement.classList.remove('selected');
        } else {
            this.currentState.selectedIngredients.add(ingredient);
            buttonElement.classList.add('selected');
        }
    }

    startOver() {
        this.showMainCategories();
    }

    saveSelection() {
        const selection = {
            category: this.currentState.category,
            middleButton: this.currentState.middleButton?.name,
            selectedIngredients: Array.from(this.currentState.selectedIngredients)
        };

        console.log('Сохраненная выборка:', selection);
        
        // Показываем уведомление в Telegram
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.showPopup({
                title: 'Успешно сохранено!',
                message: `Выбрано ${selection.selectedIngredients.length} ингредиентов`,
                buttons: [{ type: 'ok' }]
            });
        }

        // Возвращаемся в начало
        this.startOver();
    }

    updateCentering() {
        const containers = document.querySelectorAll('.buttons-container');
        
        containers.forEach(container => {
            const buttons = container.querySelectorAll('.button');
            const containerHeight = container.clientHeight;
            const buttonsHeight = Array.from(buttons).reduce((total, btn) => {
                return total + btn.offsetHeight + 10; // 10px - gap
            }, 0);
            
            if (buttonsHeight < containerHeight && buttons.length > 0) {
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
