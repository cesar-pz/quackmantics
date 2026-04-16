const VIGENERE_KEY = 'QUACK';
const HOT_THRESHOLD = 0.9;
const WARM_THRESHOLD = 0.72;
const MS_PER_DAY = 86400000;

const WORD_VECTORS = {
  duck: [0.98, 0.91, 0.84, 0.25, 0.21],
  bird: [0.94, 0.88, 0.79, 0.24, 0.22],
  goose: [0.95, 0.86, 0.82, 0.23, 0.19],
  swan: [0.93, 0.87, 0.85, 0.22, 0.21],
  feather: [0.89, 0.84, 0.8, 0.19, 0.2],
  beak: [0.86, 0.82, 0.73, 0.2, 0.18],
  wing: [0.9, 0.85, 0.78, 0.21, 0.17],
  pond: [0.27, 0.26, 0.21, 0.96, 0.84],
  lake: [0.25, 0.22, 0.18, 0.93, 0.88],
  water: [0.31, 0.28, 0.24, 0.95, 0.92],
  river: [0.24, 0.23, 0.17, 0.92, 0.9],
  paddle: [0.48, 0.42, 0.39, 0.84, 0.76],
  splash: [0.52, 0.45, 0.41, 0.87, 0.81],
  nest: [0.68, 0.63, 0.58, 0.35, 0.24],
  flock: [0.84, 0.79, 0.72, 0.26, 0.23],
  quack: [0.88, 0.83, 0.76, 0.31, 0.25],
  bread: [0.35, 0.29, 0.24, 0.48, 0.33],
  sky: [0.55, 0.58, 0.49, 0.22, 0.28],
  cloud: [0.57, 0.56, 0.47, 0.21, 0.29],
  rain: [0.49, 0.46, 0.4, 0.61, 0.67]
};

const words = Object.keys(WORD_VECTORS);
const statusEl = document.getElementById('status');
const guessForm = document.getElementById('guessForm');
const guessInput = document.getElementById('guessInput');
const guessTableBody = document.getElementById('guessTableBody');
const winBurst = document.getElementById('winBurst');
const themeToggle = document.getElementById('themeToggle');

let secretWord = getSecretWord();
let guessCount = 0;
let gameWon = false;

function vigenereDecode(cipherText, key) {
  const text = cipherText.toUpperCase().replace(/[^A-Z]/g, '');
  if (!text) return '';
  let output = '';

  for (let i = 0; i < text.length; i += 1) {
    const charCode = text.charCodeAt(i) - 65;
    const keyCode = key.charCodeAt(i % key.length) - 65;
    const decodedCode = (charCode - keyCode + 26) % 26;
    output += String.fromCharCode(decodedCode + 65);
  }

  return output.toLowerCase();
}

function getDailyIndex(seedDate) {
  const date = new Date(seedDate);
  const utcTimestamp = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayIndex = Math.floor(utcTimestamp / MS_PER_DAY);
  return ((dayIndex % words.length) + words.length) % words.length;
}

function getSecretWord() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('secret');

  if (encoded) {
    const decoded = vigenereDecode(encoded, VIGENERE_KEY);
    if (WORD_VECTORS[decoded]) {
      statusEl.textContent = 'Custom duck challenge loaded.';
      return decoded;
    }
    statusEl.textContent = 'Custom secret could not be decoded, using daily word.';
  }

  return words[getDailyIndex(new Date())];
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function proximityMessage(score) {
  if (score >= HOT_THRESHOLD) return 'Birds of a feather!';
  if (score >= WARM_THRESHOLD) return 'Paddling closer';
  return 'In a different pond';
}

function animateWin() {
  winBurst.classList.remove('show');
  void winBurst.offsetWidth;
  winBurst.classList.add('show');
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('quackmantics-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

const savedTheme = localStorage.getItem('quackmantics-theme');
if (savedTheme === 'dark' || savedTheme === 'light') {
  setTheme(savedTheme);
} else {
  setTheme('light');
}

themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
});

guessForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (gameWon) return;

  const guess = guessInput.value.trim().toLowerCase();
  guessInput.value = '';

  if (!guess) return;

  const guessVector = WORD_VECTORS[guess];
  if (!guessVector) {
    statusEl.textContent = `"${guess}" is not in this duck dictionary. Try another word.`;
    return;
  }

  guessCount += 1;

  const similarity = cosineSimilarity(guessVector, WORD_VECTORS[secretWord]);
  const scorePct = similarity * 100;
  const proximity = proximityMessage(similarity);

  const row = document.createElement('tr');
  const guessNumberCell = document.createElement('td');
  const wordCell = document.createElement('td');
  const scoreCell = document.createElement('td');
  const proximityCell = document.createElement('td');

  guessNumberCell.textContent = String(guessCount);
  wordCell.textContent = guess;
  scoreCell.textContent = `${scorePct.toFixed(2)}%`;
  proximityCell.textContent = proximity;

  row.append(guessNumberCell, wordCell, scoreCell, proximityCell);
  guessTableBody.prepend(row);

  if (guess === secretWord) {
    gameWon = true;
    statusEl.textContent = `You got it! The word was "${secretWord}".`;
    animateWin();
    return;
  }

  statusEl.textContent = `${proximity} — Duck Distance: ${(100 - scorePct).toFixed(2)}%`;
});
