let KEY_SPACE = false;
let KEY_UP = false;
let KEY_DOWN = false;
let canvas;
let ctx;
let backgroundImage = new Image();
let score = 0;
let gameOver = false;
let ufoSpeed = 5;
let soundEnabled = true;

let rocket = {
  x: 50,
  y: 200,
  width: 130,
  height: 50,
  src: "img/rocket.png",
  img: new Image(),
};

let ufos = [];
let shots = [];
let ufosDestroyed = 0;

let shootSound = null;
let hitSound = null;
let gameSound = null;
let gameOverSound = null;

// Audio
try {
  shootSound = new Audio("sounds/shoot.mp3");
  hitSound = new Audio("sounds/hit.mp3");
  gameSound = new Audio("sounds/gamesound.mp3");
  gameOverSound = new Audio("sounds/gameover.mp3");

  gameSound.volume = 0.1;
} catch (error) {
  console.error("Fehler beim Laden der Audiodateien: ", error);
}

// scores laden
function loadHighscores() {
  const highscores = JSON.parse(localStorage.getItem("highscores")) || [];
  highscores.sort((a, b) => b.score - a.score);
  highscores.slice(0, 10).forEach((scoreEntry) => {
    updateHighscores(scoreEntry.name, scoreEntry.score);
  });
}

// scores aktualisieren
function updateHighscores(playerName, score) {
  const highscoreList = document.getElementById("highscoreList");
  const newScoreItem = document.createElement("li");
  newScoreItem.textContent = `${playerName}: ${score}`;
  highscoreList.appendChild(newScoreItem);
}

// Spiel neu laden
function submitScore() {
  const playerName = document.getElementById("playerName").value;
  if (playerName) {
    const highscores = JSON.parse(localStorage.getItem("highscores")) || [];
    highscores.push({ name: playerName, score: score });

    highscores.sort((a, b) => b.score - a.score);
    const topHighscores = highscores.slice(0, 10);
    localStorage.setItem("highscores", JSON.stringify(topHighscores));

    updateHighscores(playerName, score);
    document.getElementById("playerName").value = "";
    location.reload();
  } else {
    alert("Bitte geben Sie einen Namen ein.");
  }
}

// Hochscores zurücksetzen
function resetHighscores() {
  localStorage.removeItem("highscores");
  document.getElementById("highscoreList").innerHTML = "";
}

// Tasten
function handleKeyDown(e) {
  let state = true;
  switch (e.keyCode) {
    case 32:
      KEY_SPACE = state;
      break;
    case 38:
      KEY_UP = state;
      break;
    case 40:
      KEY_DOWN = state;
      break;
  }
}

function handleKeyUp(e) {
  let state = false;
  switch (e.keyCode) {
    case 32:
      KEY_SPACE = state;
      break;
    case 38:
      KEY_UP = state;
      break;
    case 40:
      KEY_DOWN = state;
      break;
  }
}

// handy
function handleTouchStart(e) {
  e.preventDefault();
  let touch = e.touches;

  if (touch.length === 1) {
    if (touch[0].clientY < canvas.height / 2) {
      KEY_UP = true;
    } else {
      KEY_DOWN = true;
    }
  }
}

function handleTouchEnd(e) {
  KEY_UP = false;
  KEY_DOWN = false;
}

// Schießbutton-Event
function shootButtonPress() {
  KEY_SPACE = true;
}

function shootButtonRelease() {
  KEY_SPACE = false;
}

// Spiel starten
function startGame() {
  resetGame();
  document.getElementById("startScreen").style.display = "none";

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  canvas.style.display = "block";

  loadImages();

  if (soundEnabled) {
    gameSound.play();
  }

  loadHighscores();

  // Event Listeners
  canvas.addEventListener("touchstart", handleTouchStart);
  canvas.addEventListener("touchend", handleTouchEnd);
  document
    .getElementById("shootButton")
    .addEventListener("touchstart", shootButtonPress);
  document
    .getElementById("shootButton")
    .addEventListener("touchend", shootButtonRelease);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  setInterval(update, 1000 / 25);
  setInterval(createUfos, 3000);
  setInterval(increaseUfoSpeed, 10000);
  setInterval(checkForCollision, 1000 / 25);
  setInterval(checkForShoot, 1000 / 10);

  draw();
}

// Spiel zurücksetzen
function resetGame() {
  score = 0;
  gameOver = false;
  ufoSpeed = 5;
  ufos = [];
  shots = [];
  ufosDestroyed = 0;
  document.getElementById("score").innerText = score;
  document.getElementById("gameOverScreen").style.display = "none";
}

// Spiel beenden

let gameOverSoundPlayed = false;

function endGame() {
  gameOver = true;
  document.getElementById("finalScore").innerText = score;
  document.getElementById("gameOverScreen").style.display = "flex";

  if (soundEnabled) {
    gameSound.pause();

    if (!gameOverSoundPlayed) {
      gameOverSound.play();
      gameOverSoundPlayed = true;
    }

    gameSound.currentTime = 0;
  }
}
function checkForCollision() {
  ufos.forEach((ufo) => {
    if (
      rocket.x + rocket.width > ufo.x &&
      rocket.y + rocket.height > ufo.y &&
      rocket.x < ufo.x + ufo.width &&
      rocket.y < ufo.y + ufo.height
    ) {
      rocket.img.src = "img/boom.png";
      endGame();
    }

    if (!ufo.hit) {
      shots.forEach((shot) => {
        if (
          shot.x + shot.width > ufo.x &&
          shot.y + shot.height > ufo.y &&
          shot.x < ufo.x + ufo.width &&
          shot.y < ufo.y + ufo.height
        ) {
          ufo.hit = true;
          ufo.img.src = "img/boom.png";

          score += 10;
          document.getElementById("score").innerText = score;

          ufosDestroyed++;

          if (soundEnabled && hitSound) hitSound.play();

          setTimeout(() => {
            ufos = ufos.filter((u) => u !== ufo);
          }, 2000);

          shots = shots.filter((s) => s !== shot);
        }
      });
    }
  });
}

// UFOs erstellen
function createUfos() {
  let ufo = {
    x: canvas.width,
    y: Math.random() * (canvas.height - 60),
    width: 60,
    height: 40,
    src: "img/ufo.png",
    img: new Image(),
    hit: false,
  };
  ufo.img.src = ufo.src;
  ufos.push(ufo);
}

// Schießen
function checkForShoot() {
  if (KEY_SPACE) {
    let shot = {
      x: rocket.x + 110,
      y: rocket.y + 22,
      width: 20,
      height: 4,
      src: "img/shot.png",
      img: new Image(),
    };
    shot.img.src = shot.src;
    shots.push(shot);

    if (soundEnabled && shootSound) shootSound.play();
  }
}

// Geschwindigkeit von UFOs erhöhen
function increaseUfoSpeed() {
  ufoSpeed += 1;
}

// Spiel aktualisieren
function update() {
  if (KEY_UP) {
    rocket.y -= 5;
    if (rocket.y < 0) rocket.y = 0;
  }

  if (KEY_DOWN) {
    rocket.y += 5;
    if (rocket.y > canvas.height - rocket.height)
      rocket.y = canvas.height - rocket.height;
  }

  ufos.forEach((ufo) => {
    if (!ufo.hit) {
      ufo.x -= ufoSpeed;
    }
  });

  shots.forEach((shot) => {
    shot.x += 15;
    if (shot.x > canvas.width) {
      shots = shots.filter((s) => s !== shot);
    }
  });

  checkForCollision();
}

function loadImages() {
  backgroundImage.src = "img/hintergrund.jpg";
  rocket.img.src = rocket.src;
}

function draw() {
  try {
    ctx.drawImage(backgroundImage, 0, 0);
    ctx.drawImage(rocket.img, rocket.x, rocket.y, rocket.width, rocket.height);

    ufos.forEach((ufo) => {
      ctx.drawImage(ufo.img, ufo.x, ufo.y, ufo.width, ufo.height);
    });

    shots.forEach((shot) => {
      ctx.drawImage(shot.img, shot.x, shot.y, shot.width, shot.height);
    });

    if (!gameOver) requestAnimationFrame(draw);
  } catch (error) {
    console.error("Fehler beim Zeichnen: ", error);
  }
}

// Sound an und aus
function toggleSound() {
  soundEnabled = !soundEnabled;
  if (!soundEnabled) {
    gameSound.pause();
  } else {
    gameSound.play();
  }
  document.getElementById("soundButton").innerText = soundEnabled
    ? "Sound aus"
    : "Sound an";
}
