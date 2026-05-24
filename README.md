# SmartLight Admin Panel

Frontend-панель управления для магазина SmartLight.

## Запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

## Настройка

Скопируйте `.env.example` в `.env` и укажите URL вашего бэкенда:

```
VITE_API_URL=http://localhost:3003/api/v1
```

## Стек

- React 18 + Vite
- React Router DOM v6
- Axios (с автоматическим refresh токена)
- Zustand (state management)
- Lucide React (иконки)

## Структура

```
src/
├── api/           # HTTP-клиент и методы для каждого ресурса
├── components/
│   ├── layout/    # Sidebar, AppLayout (защищённый роут)
│   └── ui/        # StatusBadge, Pagination
├── pages/         # LoginPage, DashboardPage, ProductsPage, ...
└── store/         # Zustand стор (auth)
```

## Функциональность

- Вход / Выход (JWT + refresh)
- Дашборд с KPI и последними заказами
- Список товаров с поиском и фильтрами
- Создание и редактирование товаров
- Список заказов с фильтрацией по статусу
- Детальная страница заказа с изменением статуса
