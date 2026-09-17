const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const ZODIACS = [
  { id: "capricorn", name: "염소자리", emoji: "♑", from: [12, 22], to: [1, 19] },
  { id: "aquarius", name: "물병자리", emoji: "♒", from: [1, 20], to: [2, 18] },
  { id: "pisces", name: "물고기자리", emoji: "♓", from: [2, 19], to: [3, 20] },
  { id: "aries", name: "양자리", emoji: "♈", from: [3, 21], to: [4, 19] },
  { id: "taurus", name: "황소자리", emoji: "♉", from: [4, 20], to: [5, 20] },
  { id: "gemini", name: "쌍둥이자리", emoji: "♊", from: [5, 21], to: [6, 20] },
  { id: "cancer", name: "게자리", emoji: "♋", from: [6, 21], to: [7, 22] },
  { id: "leo", name: "사자자리", emoji: "♌", from: [7, 23], to: [8, 22] },
  { id: "virgo", name: "처녀자리", emoji: "♍", from: [8, 23], to: [9, 22] },
  { id: "libra", name: "천칭자리", emoji: "♎", from: [9, 23], to: [10, 22] },
  { id: "scorpio", name: "전갈자리", emoji: "♏", from: [10, 23], to: [11, 21] },
  { id: "sagittarius", name: "사수자리", emoji: "♐", from: [11, 22], to: [12, 21] },
];

const BADGES = ["설렘주의 💗", "매력치 상승 중 ✨", "답장운 들어오는 중 💌", "집중력 상승 중 📚"];

const COLOR_HEX = {
  "BABY PINK": "#f8b9d0",
  "BABY BLUE": "#adddf4",
  LAVENDER: "#cdbaf1",
  "BUTTER YELLOW": "#f5dc8a",
  "MINT CREAM": "#bfe5d6",
  "PEACH GLOW": "#f6b69d",
  "LILAC MIST": "#d8c5e8",
  "ROSE QUARTZ": "#e7a9b8",
  "SKY MILK": "#cbe7f0",
  "COTTON CANDY": "#efbddd",
  CHAMPAGNE: "#e8cfaa",
  "SOFT CORAL": "#ef9c99",
  "ICE BLUE": "#b9deea",
  "PEARL WHITE": "#f1edf0",
  "CHERRY MILK": "#e995ae",
};

const homeScreen = document.getElementById("home");
const resultScreen = document.getElementById("result");
const form = document.getElementById("birthday-form");
const formError = document.getElementById("form-error");
const yearInput = document.getElementById("year");
const monthInput = document.getElementById("month");
const dayInput = document.getElementById("day");

let fortuneData = null;

function inRange(month, day, from, to) {
  const value = month * 100 + day;
  const start = from[0] * 100 + from[1];
  const end = to[0] * 100 + to[1];
  if (start <= end) return value >= start && value <= end;
  return value >= start || value <= end;
}

function getZodiac(month, day) {
  return ZODIACS.find((zodiac) => inRange(month, day, zodiac.from, zodiac.to));
}

function hashString(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick(list, seed, salt) {
  return list[(seed + salt * 97) % list.length];
}

function stars(count) {
  return "★".repeat(count) + "☆".repeat(5 - count);
}

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatToday() {
  const now = new Date();
  return `${MONTHS[now.getMonth()]} ${now.getDate()}`;
}

function parseBirthday() {
  const year = Number(yearInput.value.trim());
  const month = Number(monthInput.value.trim());
  const day = Number(dayInput.value.trim());
  const currentYear = new Date().getFullYear();

  if (!year || !month || !day) {
    return { error: "생년월일을 모두 입력해줘!" };
  }
  if (year < 1950 || year > currentYear) {
    return { error: "태어난 해를 다시 확인해줘." };
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { error: "날짜가 조금 이상한 것 같아." };
  }

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { error: "존재하지 않는 날짜야." };
  }
  if (date > new Date()) {
    return { error: "미래의 생일은 아직 못 봐 🫧" };
  }

  return { year, month, day };
}

function buildFortune(zodiac) {
  const seed = hashString(`${todayKey()}-${zodiac.id}`);
  return {
    zodiac,
    score: 62 + (seed % 37),
    badge: pick(BADGES, seed, 8),
    affectionStars: 3 + ((seed >>> 11) % 3),
    contactStars: 3 + ((seed >>> 3) % 3),
    studyStars: 3 + ((seed >>> 7) % 3),
    quote: pick(fortuneData.oneLiners, seed, 1),
    affection: pick(fortuneData.affection, seed, 5),
    contact: pick(fortuneData.contact, seed, 6),
    study: pick(fortuneData.study, seed, 7),
    color: pick(fortuneData.colors, seed, 2),
    item: pick(fortuneData.items, seed, 3),
  };
}

function renderCard(fortune) {
  document.getElementById("card-emoji").textContent = `${fortune.zodiac.emoji}\uFE0E`;
  document.getElementById("card-sign").textContent = fortune.zodiac.name;
  document.getElementById("card-date").textContent = formatToday();
  document.getElementById("card-badge").textContent = fortune.badge;
  document.getElementById("card-score").textContent = `${fortune.score}°`;
  document.getElementById("temperature-fill").style.width = `${fortune.score}%`;
  document.getElementById("card-affection-stars").textContent = stars(fortune.affectionStars);
  document.getElementById("card-contact").textContent = stars(fortune.contactStars);
  document.getElementById("card-study-stars").textContent = stars(fortune.studyStars);
  document.getElementById("card-quote").textContent = fortune.quote;
  document.getElementById("card-affection").textContent = fortune.affection;
  document.getElementById("card-contact-text").textContent = fortune.contact;
  document.getElementById("card-study-text").textContent = fortune.study;
  document.getElementById("card-color").textContent = fortune.color;
  document.getElementById("card-color-chip").style.backgroundColor =
    COLOR_HEX[fortune.color] || "#f8b9d0";
  document.getElementById("card-item").textContent = fortune.item;
}

function showError(message) {
  formError.hidden = false;
  formError.textContent = message;
}

function clearError() {
  formError.hidden = true;
  formError.textContent = "";
}

function showResult() {
  homeScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome() {
  resultScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function captureCard() {
  const card = document.getElementById("fortune-card");
  return html2canvas(card, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
  });
}

async function saveCard() {
  if (typeof html2canvas !== "function") {
    alert("이미지 저장 기능을 아직 불러오지 못했어. 잠시 후 다시 눌러줘!");
    return;
  }

  const canvas = await captureCard();
  const dataUrl = canvas.toDataURL("image/png");
  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);

  if (isIOS) {
    const preview = window.open("");
    if (preview) {
      preview.document.write(
        `<p style="font-family:sans-serif;text-align:center;">이미지를 길게 눌러 저장해줘 💗</p><img src="${dataUrl}" alt="today-zodiac" style="width:100%">`
      );
      return;
    }
  }

  const link = document.createElement("a");
  link.download = "today-zodiac.png";
  link.href = dataUrl;
  link.click();
}

async function shareCard() {
  const canvas = await captureCard();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], "today-zodiac.png", { type: "image/png" });
  const payload = {
    title: "오늘의 별자리 운세 ✨",
    text: "오늘 나의 운세는 어떨까? 💗",
    files: [file],
  };

  if (navigator.canShare && navigator.canShare(payload)) {
    await navigator.share(payload);
    return;
  }
  if (navigator.share) {
    await navigator.share({
      title: "오늘의 별자리 운세 ✨",
      text: "오늘 나의 운세는 어떨까? 💗",
    });
    return;
  }

  alert("이 브라우저에서는 공유가 안 돼서, 결과 저장하기를 눌러줘!");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  if (!fortuneData) {
    showError("운세 데이터를 아직 못 불러왔어. 잠시 후 다시 눌러줘!");
    return;
  }

  const birthday = parseBirthday();
  if (birthday.error) {
    showError(birthday.error);
    return;
  }

  const zodiac = getZodiac(birthday.month, birthday.day);
  renderCard(buildFortune(zodiac));
  showResult();
});

document.getElementById("retry-btn").addEventListener("click", showHome);
document.getElementById("save-btn").addEventListener("click", async () => {
  try {
    await saveCard();
  } catch (error) {
    alert("이미지 저장에 실패했어. 다시 한번 눌러줘!");
  }
});
document.getElementById("share-btn").addEventListener("click", async () => {
  try {
    await shareCard();
  } catch (error) {
    if (error && error.name === "AbortError") return;
    alert("이 브라우저에서는 공유가 안 돼서, 결과 저장하기를 눌러줘!");
  }
});

["year", "month", "day"].forEach((id, index) => {
  const input = document.getElementById(id);
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");
    const limit = id === "year" ? 4 : 2;
    if (input.value.length >= limit && index < 2) {
      document.getElementById(["year", "month", "day"][index + 1]).focus();
    }
  });
});

fetch("./data/fortune.json")
  .then((response) => response.json())
  .then((data) => {
    fortuneData = data;
  })
  .catch(() => {
    fortuneData = {
      oneLiners: ["오늘은 네가 생각한 것보다 꽤 매력적인 날."],
      affection: ["오늘은 밀당보다 다정한 한마디가 더 잘 통해. 마음이 가는 사람이 있다면 너무 깊게 해석하지 말고, 네 페이스를 지켜봐."],
      contact: ["늦은 오후에 반가운 톡이 올 가능성이 있어. 알림 하나에 너무 조급해하지 말고, 대화의 온도만 느껴봐."],
      study: ["집중이 잘 붙는 날이야. 오래 붙잡기보다 짧은 세션으로 나누면 성적 운이 더 예쁘게 따라올 거야."],
      colors: ["BABY PINK"],
      items: ["립밤"],
    };
  });
