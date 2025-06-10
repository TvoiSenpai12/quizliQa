document.addEventListener("DOMContentLoaded", () => {
  let currentCardIndex = 0;
  let cards = [];

  async function loadCards() {
    const res = await fetch("/cards", { credentials: "include" });
    if (res.status !== 200) {
      alert("Войдите в аккаунт");
      return;
    }

    cards = await res.json();
    shuffle(cards);
    currentCardIndex = 0;
    showCard();
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function showCard() {
    if (cards.length === 0) return;

    if (currentCardIndex >= cards.length) {
      shuffle(cards);
      currentCardIndex = 0;
    }

    const card = cards[currentCardIndex];
    if (!card) return;

    document.getElementById("question").innerText = card.question;
    document.getElementById("answer").innerText = "";
    document.getElementById("card").classList.remove("flipped");
    updateProgress();
  }

  document.getElementById("answered").addEventListener("click", async () => {
    await fetch("/answer", {
      method: "POST",
      credentials: "include",
    });
    currentCardIndex++;
    showCard();
  });

  document.getElementById("not-answered").addEventListener("click", () => {
    const question = cards[currentCardIndex]?.question || "";
    const answer = cards[currentCardIndex]?.answer || "";
    document.getElementById("answer").innerText = `${question}: ${answer}`;
    document.getElementById("card").classList.add("flipped");
  });

  document.getElementById("register").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) return alert("Введите имя и пароль");

    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const data = await res.json();
    alert(data.message || data.error);
  });

  document.getElementById("login").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) return alert("Введите имя и пароль");

    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const data = await res.json();

    if (data.user) {
      document.getElementById("auth").style.display = "none";

      if (data.user.is_admin) {
        document.getElementById("admin-panel").style.display = "block";
        document.getElementById("card-manager").style.display = "block";
        loadCardManager();
      }

      loadCards();
    } else {
      alert(data.error);
    }
  });

  document.getElementById("add-card").addEventListener("click", async () => {
    const question = document.getElementById("new-question").value.trim();
    const answer = document.getElementById("new-answer").value.trim();

    if (!question || !answer) return alert("Введите вопрос и ответ");

    const res = await fetch("/add-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
      credentials: "include",
    });

    const data = await res.json();

    if (data.success) {
      alert("Карточка добавлена!");
      document.getElementById("new-question").value = "";
      document.getElementById("new-answer").value = "";
      loadCards();
      loadCardManager();
    } else {
      alert(data.error);
    }
  });

  async function loadCardManager() {
    const res = await fetch("/all-cards", { credentials: "include" });
    const allCards = await res.json();
    const tbody = document.querySelector("#card-table tbody");
    tbody.innerHTML = "";

    allCards.forEach((card) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${card.id}</td>
        <td><input class="form-control form-control-sm" value="${card.question}" data-id="${card.id}" data-field="question"></td>
        <td><input class="form-control form-control-sm" value="${card.answer}" data-id="${card.id}" data-field="answer"></td>
        <td>
          <button class="btn btn-sm btn-success me-2 save-btn" data-id="${card.id}">Сохранить</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${card.id}">Удалить</button>
        </td>
      `;

      tbody.appendChild(row);
    });

    document.querySelectorAll(".save-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const question = document.querySelector(
          `input[data-id="${id}"][data-field="question"]`
        ).value;
        const answer = document.querySelector(
          `input[data-id="${id}"][data-field="answer"]`
        ).value;

        const res = await fetch("/update-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, question, answer }),
          credentials: "include",
        });

        const data = await res.json();
        if (data.success) {
          alert("Карточка обновлена");
          loadCards();
        } else {
          alert(data.error);
        }
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;

        if (!confirm("Удалить карточку?")) return;

        const res = await fetch("/delete-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
          credentials: "include",
        });

        const data = await res.json();
        if (data.success) {
          alert("Карточка удалена");
          loadCardManager();
          loadCards();
        } else {
          alert(data.error);
        }
      });
    });
  }

  function updateProgress() {
    const total = cards.length;
    const current = currentCardIndex < total ? currentCardIndex + 1 : total;

    document.getElementById(
      "progress-text"
    ).innerText = `Прогресс: ${current} из ${total}`;

    const percent = total === 0 ? 0 : Math.round((current / total) * 100);
    document.getElementById("progress-bar").style.width = `${percent}%`;
    document
      .getElementById("progress-bar")
      .setAttribute("aria-valuenow", percent);
  }
});
