const player = {
  el: document.getElementById("player"),
  sprites: {
    idle: "images/player_idle.png",
    fiddle: "images/player_fiddle.png"
  }
};

const bosses = [
  { el: document.getElementById("boss1"), sprites: {
      idle: "images/boss1_idle.png",
      warning: "images/boss1_warning.png",
      looking: "images/boss1_looking.png",
      caught: "images/boss1_caught.png"
  }},
  { el: document.getElementById("boss2"), sprites: {
      idle: "images/boss2_idle.png",
      warning: "images/boss2_warning.png",
      looking: "images/boss2_looking.png",
      caught: "images/boss2_caught.png"
  }}
];

const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");

let fiddle = false;
let gameOver = false;
let score = 0;
let activeTimeouts = [];

// Helpers to manage timeouts
function safeTimeout(fn, time) {
  const id = setTimeout(fn, time);
  activeTimeouts.push(id);
  return id;
}
function clearAllTimeouts() {
  activeTimeouts.forEach(id => clearTimeout(id));
  activeTimeouts = [];
}

// player logic 
document.body.addEventListener("mousedown", () => {
  if (!gameOver) {
    fiddle = true;
    player.el.src = player.sprites.fiddle;
  }
});
document.body.addEventListener("mouseup", () => {
  fiddle = false;
  player.el.src = player.sprites.idle;
});

// boss logic
function bossCycle(boss) {
  if (gameOver) return;

  const waitTime = Math.random() * 6000 + 2000; // 2–7s
  safeTimeout(() => {
    if (gameOver) return;

    boss.el.src = boss.sprites.warning; // change sprite to warning

    const warningTime = 1000;
    safeTimeout(() => {
      if (gameOver) return;

      const turnNow = Math.random() < 0.7; // 70% chance to turn around
      if (turnNow) {
        boss.el.src = boss.sprites.looking;

        if (fiddle) {
          endGame("OOOKAYYYY");
          return;
        }

        const lookTime = Math.random() * 1500 + 1000;
        safeTimeout(() => {
          if (gameOver) return;
          boss.el.src = boss.sprites.idle;
          bossCycle(boss);
        }, lookTime);
      } else {
        boss.el.src = boss.sprites.idle;
        bossCycle(boss);
      }
    }, warningTime);
  }, waitTime);
}

// add score when bosses arent looking and holding down mouse
let scoreInterval = setInterval(() => {
  if (!gameOver && fiddle) {
    const anyBossLooking = bosses.some(b => b.el.src.includes("_looking"));
    if (!anyBossLooking) {
      score++;
      scoreEl.textContent = score;
    } else if (anyBossLooking && fiddle) {
      endGame("OOOKAYYYY");
    }
  }
}, 500);

// game over, make reset button appear
function endGame(message) {
  statusEl.textContent = message;
  gameOver = true;
  restartBtn.style.display = "inline-block";
  clearAllTimeouts();

  // change both bosses to catch player
  bosses.forEach(boss => {
    boss.el.src = boss.sprites.caught;
  });
}

// reset
restartBtn.addEventListener("click", () => {
  fiddle = false;
  gameOver = false;
  score = 0;
  scoreEl.textContent = "0";
  statusEl.textContent = "Edge your boyfriend without his family seeing! Dodge the prying eyes of his brother and his mum! Save the realtionship!";
  player.el.src = player.sprites.idle;

  bosses.forEach(boss => {
    boss.el.src = boss.sprites.idle;
  });

  restartBtn.style.display = "none";
  clearAllTimeouts();
  bosses.forEach(bossCycle);
});

// start
bosses.forEach(bossCycle);
