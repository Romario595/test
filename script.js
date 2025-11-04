// Расширенные данные для кнопок
const buttonData = {
    nutrition: [
        { 
            name: "Завтрак", 
            subButtons: [
                { name: "Овсянка", ingredients: ["Овсяные хлопья", "Молоко", "Мед", "Фрукты"] },
                { name: "Яйца", ingredients: ["Куриные яйца", "Масло", "Соль", "Перец"] },
                { name: "Тост", ingredients: ["Хлеб", "Масло", "Варенье", "Сыр"] }
            ] 
        },
        { 
            name: "Обед", 
            subButtons: [
                { name: "Суп", ingredients: ["Бульон", "Овощи", "Мясо", "Специи"] },
                { name: "Салат", ingredients: ["Овощи", "Заправка", "Зелень", "Специи"] },
                { name: "Мясо", ingredients: ["Говядина", "Курина", "Свинина", "Специи"] }
            ] 
        }
    ]
};

class HealthApp {
    constructor() {
        this.navigationStack = [];
        this.selectedIngredients = new Set();
        this.customIngredients = this.loadCustomIngredients();
        this.currentContext = null; // Текущий контекст для добавления кнопок
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
        // Обработчики для кнопок действий
        document.getElementById('start-over-btn').addEventListener('click', () => {
            this.startOver();
        });

        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveSelection();
        });

        document.getElementById('add-custom-btn').addEventListener('click', () => {
            this.showAddModal();
        });

        // Модальное окно
        document.getElementById('cancel-add').addEventListener('click', () => {
            this.hideAddModal();
        });

        document.getElementById('confirm-add').addEventListener('click', () => {
            this.addCustomItem();
        });

        document.getElementById('new-item-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addCustomItem();
            }
        });

        // Закрытие модального окна по клику вне его
        document.getElementById('add-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-modal') {
                this.hideAddModal();
            }
        });
    }

    // Сохранение в localStorage
    saveCustomIngredients() {
        localStorage.setItem('customIngredients', JSON.stringify(this.customIngredients));
    }

    loadCustomIngredients() {
        const saved = localStorage.getItem('customIngredients');
        return saved ? JSON.parse(saved) : {};
    }

    showMainCategories() {
        this.navigationStack = [];
        this.selectedIngredients.clear();
        this.hideActionPanel();

        const leftPanel = document.getElementById('left-buttons');
        const middlePanel = document.getElementById('middle-buttons');
        const rightPanel = document.getElementById('right-buttons');

        leftPanel.innerHTML = '';
        middlePanel.innerHTML = '';
        rightPanel.innerHTML = '';

        Object.keys(buttonData).forEach(category => {
            const button = this.createButton(category, () => {
                this.showSubCategories(category);
            });
            leftPanel.appendChild(button);
        });

        this.updateCentering();
    }

    showSubCategories(category) {
        this.navigationStack = [{ type: 'category', name: category }];
        this.hideActionPanel();

        const leftPanel = document.getElementById('left-buttons');
        const middlePanel = document.getElementById('middle-buttons');
        const rightPanel = document.getElementById('right-buttons');

        leftPanel.innerHTML = '';
        middlePanel.innerHTML = '';
        rightPanel.innerHTML = '';

        buttonData[category].forEach(item => {
            const button = this.createButton(item.name, () => {
                this.showItems(category, item);
            });
            middlePanel.appendChild(button);
        });

        this.updateCentering();
    }

    showItems(category, subCategory) {
        this.navigationStack = [
            { type: 'category', name: category },
            { type: 'subCategory', name: subCategory.name }
        ];
        this.hideActionPanel();

        const leftPanel = document.getElementById('left-buttons');
        const middlePanel = document.getElementById('middle-buttons');
        const rightPanel = document.getElementById('right-buttons');

        leftPanel.innerHTML = '';
        buttonData[category].forEach(item => {
            const button = this.createButton(item.name, () => {
                this.showItems(category, item);
            });
            if (item.name === subCategory.name) {
                button.classList.add('active');
            }
            leftPanel.appendChild(button);
        });

        middlePanel.innerHTML = '';
        subCategory.subButtons.forEach(item => {
            const button = this.createButton(item.name, () => {
                this.showIngredients(category, subCategory, item);
            });
            middlePanel.appendChild(button);
        });

        rightPanel.innerHTML = '';
        this.updateCentering();
    }

    showIngredients(category, subCategory, item) {
        this.navigationStack = [
            { type: 'category', name: category },
            { type: 'subCategory', name: subCategory.name },
            { type: 'item', name: item.name }
        ];
        
        this.currentContext = { category, subCategory: subCategory.name, item: item.name };
        this.showActionPanel();

        const leftPanel = document.getElementById('left-buttons');
        const middlePanel = document.getElementById('middle-buttons');
        const rightPanel = document.getElementById('right-buttons');

        leftPanel.innerHTML = '';
        subCategory.subButtons.forEach(subItem => {
            const button = this.createButton(subItem.name, () => {
                this.showIngredients(category, subCategory, subItem);
            });
            if (subItem.name === item.name) {
                button.classList.add('active');
            }
            leftPanel.appendChild(button);
        });

        middlePanel.innerHTML = '';
        const mainButton = this.createButton(item.name, () => {}, true);
        middlePanel.appendChild(mainButton);

        rightPanel.innerHTML = '';
        
        // Показываем стандартные ингредиенты
        item.ingredients.forEach(ingredient => {
            const button = this.createButton(ingredient, () => {
                this.toggleIngredient(ingredient, button);
            });
            if (this.selectedIngredients.has(ingredient)) {
                button.classList.add('selected');
            }
            rightPanel.appendChild(button);
        });

        // Показываем пользовательские ингредиенты для этого блюда
        const customKey = `${category}_${subCategory.name}_${item.name}`;
        if (this.customIngredients[customKey]) {
            this.customIngredients[customKey].forEach(ingredient => {
                const button = this.createButton(ingredient, () => {
                    this.toggleIngredient(ingredient, button);
                }, false, true); // true - это пользовательская кнопка
                if (this.selectedIngredients.has(ingredient)) {
                    button.classList.add('selected');
                }
                rightPanel.appendChild(button);
            });
        }

        // Добавляем кнопку для создания нового ингредиента
        const addButton = this.createButton("+ Добавить", () => {
            this.showAddModal();
        }, false, true);
        addButton.classList.add('custom');
        rightPanel.appendChild(addButton);

        this.updateCentering();
    }

    toggleIngredient(ingredient, buttonElement) {
        if (this.selectedIngredients.has(ingredient)) {
            this.selectedIngredients.delete(ingredient);
            buttonElement.classList.remove('selected');
        } else {
            this.selectedIngredients.add(ingredient);
            buttonElement.classList.add('selected');
        }
    }

    createButton(text, onClick, isMain = false, isCustom = false) {
        const button = document.createElement('button');
        button.className = isMain ? 'button active' : 'button';
        if (isCustom) {
            button.classList.add('custom');
        }
        button.textContent = text;
        button.addEventListener('click', onClick);
        return button;
    }

    showActionPanel() {
        document.getElementById('action-panel').style.display = 'flex';
    }

    hideActionPanel() {
        document.getElementById('action-panel').style.display = 'none';
    }

    showAddModal() {
        document.getElementById('add-modal').style.display = 'flex';
        document.getElementById('new-item-input').value = '';
        document.getElementById('new-item-input').focus();
    }

    hideAddModal() {
        document.getElementById('add-modal').style.display = 'none';
    }

    addCustomItem() {
        const input = document.getElementById('new-item-input');
        const newItem = input.value.trim();
        
        if (newItem && this.currentContext) {
            const { category, subCategory, item } = this.currentContext;
            const customKey = `${category}_${subCategory}_${item}`;
            
            // Инициализируем массив, если его нет
            if (!this.customIngredients[customKey]) {
                this.customIngredients[customKey] = [];
            }
            
            // Добавляем новый элемент, если его еще нет
            if (!this.customIngredients[customKey].includes(newItem)) {
                this.customIngredients[customKey].push(newItem);
                this.saveCustomIngredients();
                
                // Обновляем отображение
                this.showIngredients(
                    category,
                    buttonData[category].find(sc => sc.name === subCategory),
                    { name: item, ingredients: [] }
                );
            }
            
            this.hideAddModal();
        }
    }

    startOver() {
        this.showMainCategories();
    }

    saveSelection() {
        const selected = Array.from(this.selectedIngredients);
        console.log('Сохранен выбор:', {
            item: this.navigationStack[2]?.name,
            ingredients: selected
        });

        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.showPopup({
                title: 'Сохранено!',
                message: `Выбрано ингредиентов: ${selected.length}`,
                buttons: [{ type: 'ok' }]
            });
        }

        // После сохранения возвращаемся к выбору блюд
        const category = this.navigationStack[0].name;
        const subCategory = buttonData[category].find(item => 
            item.name === this.navigationStack[1].name
        );
        this.showItems(category, subCategory);
    }

    updateCentering() {
        const containers = document.querySelectorAll('.buttons-container');
        
        containers.forEach(container => {
            const buttons = container.querySelectorAll('.button');
            const containerHeight = container.clientHeight;
            const buttonsHeight = Array.from(buttons).reduce((total, btn) => {
                return total + btn.offsetHeight + 10;
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
