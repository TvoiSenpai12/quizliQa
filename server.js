const bcrypt = require("bcrypt");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const db = new sqlite3.Database("./db/quiz.db");
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "quizli-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

// Регистрация
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashed],
    function (err) {
      if (err)
        return res.status(500).json({ error: "Пользователь уже существует" });
      db.run("INSERT INTO stats (user_id, correct_answers) VALUES (?, 0)", [
        this.lastID,
      ]);
      res.json({ message: "Регистрация успешна" });
    }
  );
});

// Логин
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (!user)
        return res.status(400).json({ error: "Пользователь не найден" });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ error: "Неверный пароль" });
      req.session.user = {
        id: user.id,
        username: user.username,
        is_admin: user.is_admin,
      };
      res.json({ message: "Вход выполнен", user });
    }
  );
});

// Получить карточки
app.get("/cards", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Требуется вход" });
  db.all("SELECT * FROM cards", (err, rows) => {
    res.json(rows);
  });
});

// добавить карточку админом
app.post("/add-card", (req, res) => {
  const user = req.session.user;
  const { question, answer } = req.body;

  if (!user || !user.is_admin) {
    return res.status(403).json({ error: "Доступ запрещен" });
  }

  db.run(
    "INSERT INTO cards (question, answer) VALUES (?, ?)",
    [question, answer],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Обновить статистику
app.post("/answer", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Не авторизован" });
  db.run(
    "UPDATE stats SET correct_answers = correct_answers + 1 WHERE user_id = ?",
    [req.session.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Сервер работает на http://localhost:${PORT}`);
});

// Для админа: Получить все карточки
app.get("/all-cards", (req, res) => {
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).json({ error: "Доступ запрещен" });
  }

  db.all("SELECT * FROM cards", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Для админа: Обновить карточку
app.post("/update-card", (req, res) => {
  const { id, question, answer } = req.body;
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).json({ error: "Доступ запрещен" });
  }

  db.run(
    "UPDATE cards SET question = ?, answer = ? WHERE id = ?",
    [question, answer, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Для админа: Удалить карточку
app.post("/delete-card", (req, res) => {
  const { id } = req.body;
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).json({ error: "Доступ запрещен" });
  }

  db.run("DELETE FROM cards WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
