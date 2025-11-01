// Расширенные данные для кнопок с составом блюд
const buttonData = {
    nutrition: [
        { 
            name: "Завтрак", 
            subButtons: [
                { name: "Овсянка", ingredients: ["Овсяные хлопья", "Молоко", "Мед", "Фрукты", "Орехи"] },
                { name: "Яйца", ingredients: ["Яйца куриные", "Масло сливочное", "Соль", "Перец", "Зелень"] },
                { name: "Тост", ingredients: ["Хлеб", "Авокадо", "Помидор", "Сыр", "Специи"] }
            ] 
        },
        { 
            name: "Обед", 
            subButtons: [
                { 
                    name: "Суп", 
                    ingredients: [
                        { name: "Картофель", quantity: "200г" },
                        { name: "Морковь", quantity: "100г" },
                        { name: "Лук", quantity: "50г" },
                        { name: "Курица", quantity: "150г" },
                        { name: "Зелень", quantity: "20г" },
                        { name: "Специи", quantity: "по вкусу" }
                    ] 
                },
                { 
                    name: "Салат", 
                    ingredients: [
                        { name: "Помидоры", quantity: "150г" },
                        { name: "Огурцы", quantity: "100г" },
                        { name: "Лук", quantity: "30г" },
                        { name: "Масло оливковое", quantity: "20мл" },
                        { name: "Соль", quantity: "по вкусу" }
                    ] 
                },
                { 
                    name: "Мясо", 
                    ingredients: [
                        { name: "Говядина", quantity: "200г" },
                        { name: "Лук", quantity: "50г" },
                        { name: "Чеснок", quantity: "10г" },
                        { name: "Специи", quantity: "по вкусу" },
                        { name: "Масло растительное", quantity: "30мл" }
                    ] 
                }
            ] 
        },
        { 
            name: "Ужин", 
            subButtons: [
                { name: "Рыба", ingredients: ["Филе рыбы", "Лимон", "Специи", "Зелень", "Оливковое масло"] },
                { name: "Овощи", ingredients: ["Брокколи", "Морковь", "Цветная капуста", "Специи", "Масло"] },
                { name: "Курица", ingredients: ["Куриное филе", "Чеснок", "Соевый соус", "Мед", "Специи"] }
            ] 
        }
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
        this.currentDish = null;
        this.selectedIngredients = new Set();
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

        // Обработчики для кнопок навигации
        document.getElementById('back-to-start').addEventListener('click', () => {
            this.backToStart();
        });

        document.getElementById('save-dish').addEventListener('click', () => {
            this.saveDish();
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
        
        // Показываем все панели
        this.showAllPanels();
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
            
            // Проверяем, является ли subButton объектом или строкой
            if (typeof subButton === 'object') {
                buttonElement.textContent = subButton.name;
            } else {
                buttonElement.textContent = subButton;
            }
            
            buttonElement.addEventListener('click', () => {
                if (typeof subButton === 'object' && subButton.ingredients) {
                    this.showDishDetails(subButton);
                } else {
                    this.handleRightButtonClick(subButton);
                }
            });
            
            rightPanel.appendChild(buttonElement);
        });

        this.updateCentering();
    }

    showDishDetails(dish) {
        this.currentDish = dish;
        this.selectedIngredients.clear();
        
        // Скрываем основные панели
        this.hideMainPanels();
        
        // Показываем панель деталей блюда
        const detailsPanel = document.getElementById('dish-details-panel');
        detailsPanel.classList.add('active');
        
        // Устанавливаем название блюда
        document.getElementById('dish-name').textContent = dish.name;
        
        // Загружаем ингредиенты
        this.loadIngredients(dish.ingredients);
        
        // Обновляем кнопку сохранения
        this.updateSaveButton();
    }

    loadIngredients(ingredients) {
        const container = document.getElementById('ingredients-container');
        container.innerHTML = '';

        ingredients.forEach((ingredient, index) => {
            const ingredientItem = document.createElement('div');
            ingredientItem.className = 'ingredient-item';
            ingredientItem.dataset.index = index;
            
            // Проверяем формат ингредиента (объект или строка)
            const ingredientName = typeof ingredient === 'object' ? ingredient.name : ingredient;
            const ingredientQuantity = typeof ingredient === 'object' ? ingredient.quantity : '';
            
            ingredientItem.innerHTML = `
                <div class="ingredient-checkbox"></div>
                <span class="ingredient-name">${ingredientName}</span>
                ${ingredientQuantity ? `<span class="ingredient-quantity">${ingredientQuantity}</span>` : ''}
            `;
            
            ingredientItem.addEventListener('click', () => {
                this.toggleIngredient(ingredientName, ingredientItem);
            });
            
            container.appendChild(ingredientItem);
        });
    }

    toggleIngredient(ingredientName, ingredientElement) {
        if (this.selectedIngredients.has(ingredientName)) {
            this.selectedIngredients.delete(ingredientName);
            ingredientElement.classList.remove('selected');
        } else {
            this.selectedIngredients.add(ingredientName);
            ingredientElement.classList.add('selected');
        }
        
        this.updateSaveButton();
    }

    updateSaveButton() {
        const saveBtn = document.getElementById('save-dish');
        if (this.selectedIngredients.size > 0) {
            saveBtn.disabled = false;
        } else {
            saveBtn.disabled = true;
        }
    }

    backToStart() {
        // Скрываем панель деталей
        const detailsPanel = document.getElementById('dish-details-panel');
        detailsPanel.classList.remove('active');
        
        // Показываем основные панели
        this.showAllPanels();
        
        // Сбрасываем выбранные ингредиенты
        this.selectedIngredients.clear();
        this.currentDish = null;
    }

    saveDish() {
        if (this.selectedIngredients.size === 0) return;
        
        const selectedIngredientsArray = Array.from(this.selectedIngredients);
        
        // Здесь можно добавить логику сохранения данных
        console.log('Сохранено блюдо:', {
            dish: this.currentDish.name,
            selectedIngredients: selectedIngredientsArray
        });
        
        // Показываем уведомление в Telegram
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.showPopup({
                title: 'Сохранено!',
                message: `Блюдо "${this.currentDish.name}" сохранено с ${this.selectedIngredients.size} ингредиентами`,
                buttons: [{ type: 'ok' }]
            });
        }
        
        // Возвращаемся в начало
        this.backToStart();
    }

    hideMainPanels() {
        document.getElementById('left-panel').classList.add('hidden');
        document.getElementById('middle-panel').classList.add('hidden');
        document.getElementById('right-panel').classList.add('hidden');
    }

    showAllPanels() {
        document.getElementById('left-panel').classList.remove('hidden');
        document.getElementById('middle-panel').classList.remove('hidden');
        document.getElementById('right-panel').classList.remove('hidden');
    }

    clearRightPanel() {
        const rightPanel = document.getElementById('right-buttons');
        rightPanel.innerHTML = '';
        this.updateCentering();
    }

    handleRightButtonClick(buttonName) {
        console.log(`Выбрано: ${this.currentCategory} -> ${this.currentMiddleButton?.name} -> ${buttonName}`);
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
