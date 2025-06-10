# 🧠 Quizli — Учим по карточкам

**Quizli** — это веб-приложение для изучения информации по карточкам. С поддержкой регистрации, авторизации и административного управления карточками.

---

## 📦 Стек технологий

-TypeScript

-Express.js

-SQLite

-express-session

-bcrypt

-Bootstrap 5

## 🚀 Возможности

- Регистрация и вход пользователей
- Прохождение квиза с прогрессом
- Поддержка админов (добавление, редактирование, удаление карточек)
- Простой интерфейс с анимацией

---

## 📦 Установка и запуск (для новичков)

### 1. Клонировать проект

```bash
git clone https://github.com/your-username/quizli.git
cd quizli

### 2. Клонировать проект
Убедитесь, что у вас установлен Node.js (версии 18+ желательно):

npm install
```

### 3. Создать базу данных

Создайте папку db в корне проекта и внутри неё файл quiz.db.

mkdir db
touch db/quiz.db

Выполните миграцию с помощью любого SQLite-редактора или используйте этот SQL-запрос:
CREATE TABLE users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE NOT NULL,
password TEXT NOT NULL,
is_admin BOOLEAN DEFAULT 0
);

CREATE TABLE cards (
id INTEGER PRIMARY KEY AUTOINCREMENT,
question TEXT NOT NULL,
answer TEXT NOT NULL
);

CREATE TABLE stats (
user_id INTEGER PRIMARY KEY,
correct_answers INTEGER DEFAULT 0,
FOREIGN KEY (user_id) REFERENCES users (id)
);

### 4. Запустить сервер

npm run dev

Сервер будет доступен по адресу http://localhost:3000

### 🔐 Роли

Обычный пользователь — может проходить карточки

Админ — может управлять карточками (добавлять/удалять)

Чтобы назначить админа вручную, можно обновить users таблицу через SQLite GUI или командой:
UPDATE users SET is_admin = 1 WHERE username = 'your-username';

### 📁 Структура проекта

quizli/
├── db/
│ └── quiz.db # SQLite база
├── public/
│ ├── index.html # Интерфейс
│ ├── style.css
│ └── js/
│ └── script.js # Вся логика клиента
├── src-server/
│ └── server.ts # Сервер на Express
├── tsconfig.json
├── package.json
└── README.md

### 💡 Идеи для доработки

Таймер и ограничение времени

Поддержка тем/категорий карточек

Рейтинг пользователей

Статистика прохождений

### 💡 Подсказки

При запуске убедись, что у тебя стоит Node.js 18+.

Не забудь установить TypeScript глобально (если нужно): npm install -g typescript.
