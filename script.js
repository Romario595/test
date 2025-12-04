// Код для Google Apps Script, развертывается как веб-приложение

// Конфигурация
const CONFIG = {
  ALLOWED_USER_IDS: [167488008, 331575942],
  SHEET_NAME: 'Меню'
};

/**
 * Обрабатывает GET запросы
 */
function doGet(e) {
  try {
    // Проверяем user_id
    const userId = e.parameter.user_id || e.parameter.userId;
    
    if (!userId || !CONFIG.ALLOWED_USER_IDS.includes(parseInt(userId))) {
      return createFuckYouResponse();
    }
    
    // Определяем тип запроса
    const action = e.parameter.action;
    
    switch(action) {
      case 'menu':
        return getMenuData();
      case 'stats':
        return getStatistics();
      default:
        return createSuccessResponse('Unknown action');
    }
    
  } catch (error) {
    return createErrorResponse(error.toString());
  }
}

/**
 * Получает данные меню из таблицы
 */
function getMenuData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // Пропускаем заголовок если есть
  const menuData = data.slice(1).filter(row => row.some(cell => cell !== ''));
  
  return createSuccessResponse(menuData);
}

/**
 * Получает статистику (заглушка)
 */
function getStatistics() {
  // Здесь можно реализовать сбор статистики
  const stats = {
    totalItems: 0,
    lastUpdate: new Date().toISOString()
  };
  
  return createSuccessResponse(stats);
}

/**
 * Создает ответ с изображением "фака"
 */
function createFuckYouResponse() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            background: black;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: Arial, sans-serif;
          }
          .message {
            color: white;
            font-size: 24px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="message">🚫 Access Denied</div>
      </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

/**
 * Создает успешный JSON ответ
 */
function createSuccessResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      data: data,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
}

/**
 * Создает ответ с ошибкой
 */
function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'error',
      message: message,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Тестовая функция для проверки данных
 */
function testGetMenuData() {
  const result = getMenuData();
  Logger.log(result.getContent());
}
