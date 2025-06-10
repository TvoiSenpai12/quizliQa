import express from "express";
import session from "express-session";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import path from "path";
import type { Request, Response } from "express";

// Расширяем express-session
declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      is_admin: boolean;
    };
  }
}

const app = express();
const PORT = 3000;

const db = new sqlite3.Database("./db/quiz.db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "quizli-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, "../public")));

// ================= РЕГИСТРАЦИЯ =================
app.post("/register", async (req: Request, res: Response) => {
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

// ================= ЛОГИН =================
app.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user: any) => {
      if (err) return res.status(500).json({ error: "Ошибка сервера" });
      if (!user)
        return res.status(400).json({ error: "Пользователь не найден" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ error: "Неверный пароль" });

      req.session.user = {
        id: user.id,
        username: user.username,
        is_admin: user.is_admin,
      };

      res.json({ message: "Вход выполнен", user: req.session.user });
    }
  );
});

// ================= КАРТОЧКИ =================
app.get("/cards", (req: Request, res: Response) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Не авторизован" });

  db.all("SELECT * FROM cards", (err, rows) => {
    res.json(rows);
  });
});

app.post("/answer", (req: Request, res: Response) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Не авторизован" });

  db.run(
    "UPDATE stats SET correct_answers = correct_answers + 1 WHERE user_id = ?",
    [req.session.user.id]
  );
  res.json({ success: true });
});

// ================= АДМИН =================
app.post("/add-card", (req: Request, res: Response) => {
  if (!req.session.user?.is_admin)
    return res.status(403).json({ error: "Доступ запрещен" });

  const { question, answer } = req.body;

  db.run(
    "INSERT INTO cards (question, answer) VALUES (?, ?)",
    [question, answer],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get("/all-cards", (req: Request, res: Response) => {
  if (!req.session.user?.is_admin)
    return res.status(403).json({ error: "Доступ запрещен" });

  db.all("SELECT * FROM cards", (err, rows) => {
    res.json(rows);
  });
});

app.post("/update-card", (req: Request, res: Response) => {
  if (!req.session.user?.is_admin)
    return res.status(403).json({ error: "Доступ запрещен" });

  const { id, question, answer } = req.body;

  db.run(
    "UPDATE cards SET question = ?, answer = ? WHERE id = ?",
    [question, answer, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.post("/delete-card", (req: Request, res: Response) => {
  if (!req.session.user?.is_admin)
    return res.status(403).json({ error: "Доступ запрещен" });

  const { id } = req.body;

  db.run("DELETE FROM cards WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ================= СТАРТ =================
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
