type Card = {
  id: number;
  question: string;
  answer: string;
};

let cards: Card[] = [];
let currentCardIndex = 0;

const questionEl = document.getElementById("question") as HTMLElement;
const answerEl = document.getElementById("answer") as HTMLElement;
const cardEl = document.getElementById("card") as HTMLElement;

// Загружаем карточки
async function loadCards(): Promise<void> {
  const res = await fetch("/cards");
  if (!res.ok) {
    alert("Войдите в аккаунт");
    return;
  }

  cards = await res.json();
  shuffle(cards);
  currentCardIndex = 0;
  showCard();
}

// Перемешиваем
function shuffle(array: Card[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Показ карточки
function showCard(): void {
  if (cards.length === 0) return;

  if (currentCardIndex >= cards.length) {
    shuffle(cards);
    currentCardIndex = 0;
  }

  const card = cards[currentCardIndex];
  questionEl.innerText = card.question;
  answerEl.innerText = "";
  cardEl.classList.remove("flipped");

  updateProgress();
}

// Кнопки
(document.getElementById("answered") as HTMLButtonElement).addEventListener(
  "click",
  async () => {
    await fetch("/answer", { method: "POST" });
    currentCardIndex++;
    showCard();
  }
);

(document.getElementById("not-answered") as HTMLButtonElement).addEventListener(
  "click",
  () => {
    const card = cards[currentCardIndex];
    answerEl.innerText = `${card.question}: ${card.answer}`;
    cardEl.classList.add("flipped");
  }
);

// Прогресс
function updateProgress(): void {
  const total = cards.length;
  const current = currentCardIndex < total ? currentCardIndex + 1 : total;

  const textEl = document.getElementById("progress-text");
  const barEl = document.getElementById("progress-bar");

  if (textEl && barEl) {
    textEl.innerText = `Прогресс: ${current} из ${total}`;
    const percent = total === 0 ? 0 : Math.round((current / total) * 100);
    (barEl as HTMLElement).style.width = `${percent}%`;
    barEl.setAttribute("aria-valuenow", percent.toString());
  }
}
