const ZODIACS = [
  { id: "capricorn", name: "염소자리", emoji: "♑", range: "12.22 – 1.19", from: [12, 22], to: [1, 19] },
  { id: "aquarius", name: "물병자리", emoji: "♒", range: "1.20 – 2.18", from: [1, 20], to: [2, 18] },
  { id: "pisces", name: "물고기자리", emoji: "♓", range: "2.19 – 3.20", from: [2, 19], to: [3, 20] },
  { id: "aries", name: "양자리", emoji: "♈", range: "3.21 – 4.19", from: [3, 21], to: [4, 19] },
  { id: "taurus", name: "황소자리", emoji: "♉", range: "4.20 – 5.20", from: [4, 20], to: [5, 20] },
  { id: "gemini", name: "쌍둥이자리", emoji: "♊", range: "5.21 – 6.20", from: [5, 21], to: [6, 20] },
  { id: "cancer", name: "게자리", emoji: "♋", range: "6.21 – 7.22", from: [6, 21], to: [7, 22] },
  { id: "leo", name: "사자자리", emoji: "♌", range: "7.23 – 8.22", from: [7, 23], to: [8, 22] },
  { id: "virgo", name: "처녀자리", emoji: "♍", range: "8.23 – 9.22", from: [8, 23], to: [9, 22] },
  { id: "libra", name: "천칭자리", emoji: "♎", range: "9.23 – 10.22", from: [9, 23], to: [10, 22] },
  { id: "scorpio", name: "전갈자리", emoji: "♏", range: "10.23 – 11.21", from: [10, 23], to: [11, 21] },
  { id: "sagittarius", name: "사수자리", emoji: "♐", range: "11.22 – 12.21", from: [11, 22], to: [12, 21] },
];

const SCREENS = ["home", "result", "compat-home", "compat-result"];

const form = document.getElementById("birthday-form");
const formError = document.getElementById("form-error");
const yearInput = document.getElementById("year");
const monthInput = document.getElementById("month");
const dayInput = document.getElementById("day");
const compatError = document.getElementById("compat-error");

let fortuneData = null;
let lastBirthday = null;

function showScreen(id) {
  SCREENS.forEach((screenId) => {
    document.getElementById(screenId).classList.toggle("hidden", screenId !== id);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

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

function parseBirthdayFrom(yearEl, monthEl, dayEl) {
  const year = Number(yearEl.value.trim());
  const month = Number(monthEl.value.trim());
  const day = Number(dayEl.value.trim());
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

function fillBirthday(yearEl, monthEl, dayEl, birthday) {
  if (!birthday) return;
  yearEl.value = birthday.year;
  monthEl.value = String(birthday.month).padStart(2, "0");
  dayEl.value = String(birthday.day).padStart(2, "0");
}

function buildFortune(zodiac) {
  const seed = hashString(`${todayKey()}-${zodiac.id}`);
  return {
    zodiac,
    score: 62 + (seed % 37),
    affectionStars: 3 + ((seed >>> 11) % 3),
    contactStars: 3 + ((seed >>> 3) % 3),
    quote: pick(fortuneData.oneLiners, seed, 1),
    affection: pick(fortuneData.affection, seed, 5),
    contact: pick(fortuneData.contact, seed, 7),
    zodiacLove: fortuneData.zodiacLove[zodiac.id],
  };
}

function renderCard(fortune) {
  document.getElementById("card-emoji").textContent = `${fortune.zodiac.emoji}\uFE0E`;
  document.getElementById("card-sign").textContent = fortune.zodiac.name;
  document.getElementById("card-range").textContent = fortune.zodiac.range;
  document.getElementById("card-score").textContent = `${fortune.score}°`;
  document.getElementById("temperature-fill").style.width = `${fortune.score}%`;
  document.getElementById("card-affection-stars").textContent = stars(fortune.affectionStars);
  document.getElementById("card-contact").textContent = stars(fortune.contactStars);
  document.getElementById("card-quote").textContent = fortune.quote;
  document.getElementById("card-affection").textContent = fortune.affection;
  document.getElementById("card-contact-text").textContent = fortune.contact;
  document.getElementById("card-zodiac-love").textContent = fortune.zodiacLove;
}

function buildCompat(meZodiac, youZodiac) {
  const seed = hashString(`${todayKey()}-${meZodiac.id}-${youZodiac.id}`);
  const card = pick(fortuneData.tarot, seed, 3);
  return {
    meZodiac,
    youZodiac,
    card,
    score: 58 + (seed % 41),
  };
}

function renderCompat(compat) {
  document.getElementById("compat-pair").textContent =
    `${compat.meZodiac.emoji} ${compat.meZodiac.name}  ×  ${compat.youZodiac.emoji} ${compat.youZodiac.name}`;
  document.getElementById("compat-verdict").textContent = compat.card.verdict;
  document.getElementById("compat-score").textContent = `${compat.score}°`;
  document.getElementById("compat-fill").style.width = `${compat.score}%`;
  const art = document.getElementById("tarot-art");
  art.src = `./images/tarot/tarot-${compat.card.id}.jpg`;
  art.alt = compat.card.en;
  document.getElementById("tarot-line-1").textContent = compat.card.lines[0];
  document.getElementById("tarot-line-2").textContent = compat.card.lines[1];
  document.getElementById("tarot-line-3").textContent = compat.card.lines[2];
}

function showError(node, message) {
  node.hidden = false;
  node.textContent = message;
}

function clearError(node) {
  node.hidden = true;
  node.textContent = "";
}

async function captureElement(id) {
  return html2canvas(document.getElementById(id), {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
  });
}

async function saveElement(id, filename) {
  if (typeof html2canvas !== "function") {
    alert("이미지 저장 기능을 아직 불러오지 못했어. 잠시 후 다시 눌러줘!");
    return;
  }

  const canvas = await captureElement(id);
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
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

async function shareElement(id, filename) {
  const canvas = await captureElement(id);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], filename, { type: "image/png" });
  const payload = {
    title: "오늘의 사랑 운세 💗",
    text: "오늘 내 사랑운은 어떨까?",
    files: [file],
  };

  if (navigator.canShare && navigator.canShare(payload)) {
    await navigator.share(payload);
    return;
  }
  if (navigator.share) {
    await navigator.share({
      title: "오늘의 사랑 운세 💗",
      text: "오늘 내 사랑운은 어떨까?",
    });
    return;
  }

  alert("이 브라우저에서는 공유가 안 돼서, 결과 저장하기를 눌러줘!");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError(formError);

  if (!fortuneData) {
    showError(formError, "운세 데이터를 아직 못 불러왔어. 잠시 후 다시 눌러줘!");
    return;
  }

  const birthday = parseBirthdayFrom(yearInput, monthInput, dayInput);
  if (birthday.error) {
    showError(formError, birthday.error);
    return;
  }

  lastBirthday = birthday;
  renderCard(buildFortune(getZodiac(birthday.month, birthday.day)));
  showScreen("result");
});

document.getElementById("result-back-btn").addEventListener("click", () => showScreen("home"));
document.getElementById("retry-btn").addEventListener("click", () => showScreen("home"));

document.getElementById("compat-open-btn").addEventListener("click", () => {
  fillBirthday(
    document.getElementById("me-year"),
    document.getElementById("me-month"),
    document.getElementById("me-day"),
    lastBirthday
  );
  clearError(compatError);
  showScreen("compat-home");
});

document.getElementById("compat-back-btn").addEventListener("click", () => showScreen("result"));
document.getElementById("compat-result-back-btn").addEventListener("click", () => showScreen("compat-home"));
document.getElementById("compat-again-btn").addEventListener("click", () => showScreen("compat-home"));

document.getElementById("compat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  clearError(compatError);

  if (!fortuneData) {
    showError(compatError, "운세 데이터를 아직 못 불러왔어. 잠시 후 다시 눌러줘!");
    return;
  }

  const me = parseBirthdayFrom(
    document.getElementById("me-year"),
    document.getElementById("me-month"),
    document.getElementById("me-day")
  );
  if (me.error) {
    showError(compatError, `나는: ${me.error}`);
    return;
  }

  const you = parseBirthdayFrom(
    document.getElementById("you-year"),
    document.getElementById("you-month"),
    document.getElementById("you-day")
  );
  if (you.error) {
    showError(compatError, `너는: ${you.error}`);
    return;
  }

  lastBirthday = me;
  renderCompat(buildCompat(getZodiac(me.month, me.day), getZodiac(you.month, you.day)));
  showScreen("compat-result");
});

document.getElementById("save-btn").addEventListener("click", async () => {
  try {
    await saveElement("fortune-card", "today-love.png");
  } catch (error) {
    alert("이미지 저장에 실패했어. 다시 한번 눌러줘!");
  }
});

document.getElementById("share-btn").addEventListener("click", async () => {
  try {
    await shareElement("fortune-card", "today-love.png");
  } catch (error) {
    if (error && error.name === "AbortError") return;
    alert("이 브라우저에서는 공유가 안 돼서, 결과 저장하기를 눌러줘!");
  }
});

document.getElementById("compat-save-btn").addEventListener("click", async () => {
  try {
    await saveElement("compat-card", "our-chemistry.png");
  } catch (error) {
    alert("이미지 저장에 실패했어. 다시 한번 눌러줘!");
  }
});

document.getElementById("compat-share-btn").addEventListener("click", async () => {
  try {
    await shareElement("compat-card", "our-chemistry.png");
  } catch (error) {
    if (error && error.name === "AbortError") return;
    alert("이 브라우저에서는 공유가 안 돼서, 결과 저장하기를 눌러줘!");
  }
});

function bindDateInputs(ids) {
  ids.forEach((id, index) => {
    const input = document.getElementById(id);
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "");
      const limit = id.includes("year") ? 4 : 2;
      if (input.value.length >= limit && index < ids.length - 1) {
        document.getElementById(ids[index + 1]).focus();
      }
    });
  });
}

bindDateInputs(["year", "month", "day"]);
bindDateInputs(["me-year", "me-month", "me-day"]);
bindDateInputs(["you-year", "you-month", "you-day"]);

fetch("./data/fortune.json")
  .then((response) => response.json())
  .then((data) => {
    fortuneData = data;
  })
  .catch(() => {
    fortuneData = {
      oneLiners: ["오늘은 그 애 생각이 더 선명해지는 날."],
      affection: ["마음이 가는 사람이 있다면 너무 깊게 해석하지 말고, 네 페이스를 지켜봐. 썸이든 연애든 오늘은 작은 신호가 더 선명해."],
      contact: ["늦은 오후에 그 애 톡이 올 가능성이 있어."],
      zodiacLove: Object.fromEntries(ZODIACS.map((zodiac) => [zodiac.id, "오늘은 네 별자리가 유난히 로맨틱해."])),
      tarot: [
        {
          id: "lovers",
          en: "LOVERS",
          name: "연인",
          symbol: "♡",
          verdict: "궁합 달아, 잘 맞음",
          lines: ["둘의 마음은 이미 같은 쪽으로 기울어 있어.", "손끝이 스치면 공기가 뜨거워질 수 있어.", "헤어질 운은 낮아."],
        },
      ],
    };
  });
