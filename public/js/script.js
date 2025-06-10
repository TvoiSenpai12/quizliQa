"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let cards = [];
let currentCardIndex = 0;
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const cardEl = document.getElementById("card");
// Загружаем карточки
function loadCards() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch("/cards");
        if (!res.ok) {
            alert("Войдите в аккаунт");
            return;
        }
        cards = yield res.json();
        shuffle(cards);
        currentCardIndex = 0;
        showCard();
    });
}
// Перемешиваем
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
// Показ карточки
function showCard() {
    if (cards.length === 0)
        return;
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
document.getElementById("answered").addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    yield fetch("/answer", { method: "POST" });
    currentCardIndex++;
    showCard();
}));
document.getElementById("not-answered").addEventListener("click", () => {
    const card = cards[currentCardIndex];
    answerEl.innerText = `${card.question}: ${card.answer}`;
    cardEl.classList.add("flipped");
});
// Прогресс
function updateProgress() {
    const total = cards.length;
    const current = currentCardIndex < total ? currentCardIndex + 1 : total;
    const textEl = document.getElementById("progress-text");
    const barEl = document.getElementById("progress-bar");
    if (textEl && barEl) {
        textEl.innerText = `Прогресс: ${current} из ${total}`;
        const percent = total === 0 ? 0 : Math.round((current / total) * 100);
        barEl.style.width = `${percent}%`;
        barEl.setAttribute("aria-valuenow", percent.toString());
    }
}
