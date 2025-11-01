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
                { name: "Мясо", ingredients: ["Говядина", "Курица", "Свинина", "Специи"] }
            ] 
        },
        { 
            name: "Ужин", 
            subButtons: [
                { name: "Рыба", ingredients: ["Филе рыбы", "Лимон", "Специи", "Зелень"] },
                { name: "Овощи", ingredients: ["Свежие овощи", "Масло", "Соль", "Травы"] },
                { name: "Курица", ingredients: ["Куриное филе", "Специи", "Масло", "Чеснок"] }
            ] 
        }
    ],
    allergy: [
        { 
            name: "Пищевая", 
            subButtons: [
                { name: "Орехи", ingredients: ["Арахис", "Грецкий орех", "Миндаль", "Фундук"] },
                { name: "Молоко", ingredients: ["Лактоза", "Казеин", "Сыворотка"] },
                { name: "Яйца", ingredients: ["Белок", "Желток"] }
            ] 
        }
    ],
    sleep: [
        { 
            name: "Качество", 
            subButtons: [
                { name: "Хорошее", ingredients: ["Глубокий сон", "Быстрое засыпание"] },
                { name: "Плохое", ingredients: ["Бессонница", "Пробуждения"] }
            ] 
        }
    ],
    other: [
        { 
            name: "Настроение", 
            subButtons: [
                { name: "Хорошее", ingredients: ["Радость", "Энергия", "Спокойствие"] },
                { name: "Плохое", ingredients: ["Грусть", "Раздражительность", "Усталость"] }
            ] 
        }
    ]
};

class HealthApp {
    constructor() {
        this.navigationStack = [];
        this.selectedIngredients = new Set();
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
    }

    showMainCategories() {
        this.navigationStack = [];
        this.selectedIngredients.clear();
        this.hideActionPanel();

        const leftPanel = document.getElementById('left-buttons');
        const middlePanel = document.getElementById('middle-buttons');
        const rightPanel = document.getElementById('right-buttons');

        // Очищаем все панели
        leftPanel.innerHTML = '';
        middlePanel.innerHTML = '';
        rightPanel.innerHTML = '';

        // Показываем основные категории в левой панели
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

        // Левая панель - основная категория (пустая, так как мы на первом уровне)
        leftPanel.innerHTML = '';

        // Средняя панель - подкатегории (Завтрак, Обед, Ужин)
        middlePanel.innerHTML = '';
        buttonData[category].forEach(item => {
            const button = this.createButton(item.name, () => {
                this.showItems(category, item);
            });
            middlePanel.appendChild(button);
        });

        // Правая панель пустая
        rightPanel.innerHTML = '';

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

        // Левая панель - подкатегории
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

        // Средняя панель - элементы (Овсянка, Яйца, Тост)
        middlePanel.innerHTML = '';
        subCategory.subButtons.forEach(item => {
            const button = this.createButton(item.name, () => {
                this.showIngredients(category, subCategory, item);
            });
            middlePanel.appendChild(button);
        });

        // Правая панель пустая
        rightPanel.innerHTML = '';

        this.updateCentering();
    }

    showIngredients(category, subCategory, item) {
        this.navigationStack = [
            { type: 'category', name: category },
            { type: 'subCategory', name: subCategory.name },
            { type: 'item', name: item.name }
        ];
        this.showActionPanel();

        const leftPanel = document.getElementById('left-buttons');
        const middlePanel = document.getElementById('middle-buttons');
        const rightPanel = document.getElementById('right-buttons');

        // Левая панель - элементы (Овсянка, Яйца, Тост)
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

        // Средняя панель - выбранный элемент
        middlePanel.innerHTML = '';
        const mainButton = this.createButton(item.name, () => {}, true);
        middlePanel.appendChild(mainButton);

        // Правая панель - ингредиенты
        rightPanel.innerHTML = '';
        item.ingredients.forEach(ingredient => {
            const button = this.createButton(ingredient, () => {
                this.toggleIngredient(ingredient, button);
            });
            if (this.selectedIngredients.has(ingredient)) {
                button.classList.add('selected');
            }
            rightPanel.appendChild(button);
        });

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

    createButton(text, onClick, isMain = false) {
        const button = document.createElement('button');
        button.className = isMain ? 'button active' : 'button';
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
