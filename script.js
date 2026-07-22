/* ---------- Scroll reveal animations (GSAP + ScrollTrigger) ---------- */
/* Guarded: if either library failed to load (blocked CDN, ad-blocker, no
   network, etc.) fall back to showing everything immediately instead of
   leaving every .reveal element (which wraps all the images/videos) stuck
   at opacity:0 forever. */
if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
  document.documentElement.classList.add("no-js-fallback");
} else {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll(".reveal").forEach(function (el) {
    gsap.fromTo(
      el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  document.querySelectorAll(".featured-grid, .skills-board").forEach(function (grid) {
    gsap.fromTo(
      grid.children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: grid,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });
}

/* ---------- Mobile nav toggle ---------- */
var navToggle = document.querySelector(".nav-toggle");
var navRight = document.querySelector(".nav-right");

if (navToggle && navRight) {
  navToggle.addEventListener("click", function () {
    var isOpen = navRight.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navRight.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navRight.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Draggable floating windows ---------- */
function makeDraggable(windowEl, handleEl) {
  var offsetX = 0, offsetY = 0, isDragging = false;

  handleEl.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".window-dot")) return;
    isDragging = true;
    var rect = windowEl.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    windowEl.style.left = rect.left + "px";
    windowEl.style.top = rect.top + "px";
    windowEl.style.transform = "none";
    handleEl.setPointerCapture(e.pointerId);
  });

  handleEl.addEventListener("pointermove", function (e) {
    if (!isDragging) return;
    var maxX = window.innerWidth - windowEl.offsetWidth - 8;
    var maxY = window.innerHeight - windowEl.offsetHeight - 8;
    var x = Math.min(Math.max(8, e.clientX - offsetX), maxX);
    var y = Math.min(Math.max(8, e.clientY - offsetY), maxY);
    windowEl.style.left = x + "px";
    windowEl.style.top = y + "px";
  });

  handleEl.addEventListener("pointerup", function () { isDragging = false; });
  handleEl.addEventListener("pointercancel", function () { isDragging = false; });
}

function setupFloatingApp(fabId, windowId) {
  var fab = document.getElementById(fabId);
  var win = document.getElementById(windowId);
  if (!fab || !win) return;

  var titlebar = win.querySelector(".window-titlebar");
  var closeBtn = win.querySelector(".window-dot.red");

  makeDraggable(win, titlebar);

  fab.addEventListener("click", function () {
    win.classList.toggle("open");
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      win.classList.remove("open");
    });
  }
}

setupFloatingApp("fab-snake", "snake-window");

/* ---------- Snake game ---------- */
(function () {
  var canvas = document.getElementById("snake-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var scoreEl = document.getElementById("snake-score");

  var cell = 15;
  var cols = canvas.width / cell;
  var rows = canvas.height / cell;

  var snake, direction, nextDirection, food, score, running;

  function randomFood() {
    var pos;
    do {
      pos = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows)
      };
    } while (snake.some(function (s) { return s.x === pos.x && s.y === pos.y; }));
    return pos;
  }

  function resetGame() {
    snake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    if (scoreEl) scoreEl.textContent = score;
    food = randomFood();
    running = true;
  }

  function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
  }

  function tick() {
    if (!running) return;
    direction = nextDirection;
    var head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    var hitsWall = head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;
    var hitsSelf = snake.some(function (s) { return s.x === head.x && s.y === head.y; });

    if (hitsWall || hitsSelf) {
      running = false;
      ctx.fillStyle = "rgba(20,52,3,0.85)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#FFF3E7";
      ctx.font = "bold 16px Montserrat, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Game over, press F", canvas.width / 2, canvas.height / 2);
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 1;
      if (scoreEl) scoreEl.textContent = score;
      food = randomFood();
    } else {
      snake.pop();
    }

    ctx.fillStyle = "#BCDBF0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCell(food.x, food.y, "#143403");
    snake.forEach(function (segment, i) {
      drawCell(segment.x, segment.y, i === 0 ? "#143403" : "#A8D0AE");
    });
  }

  document.addEventListener("keydown", function (e) {
    var snakeWindow = document.getElementById("snake-window");
    if (!snakeWindow || !snakeWindow.classList.contains("open")) return;

    if (e.key === "f" || e.key === "F") {
      resetGame();
      return;
    }
    if (e.key === "ArrowUp" && direction.y === 0) nextDirection = { x: 0, y: -1 };
    if (e.key === "ArrowDown" && direction.y === 0) nextDirection = { x: 0, y: 1 };
    if (e.key === "ArrowLeft" && direction.x === 0) nextDirection = { x: -1, y: 0 };
    if (e.key === "ArrowRight" && direction.x === 0) nextDirection = { x: 1, y: 0 };
  });

  resetGame();
  setInterval(tick, 130);
})();

/* ---------- Gallery lightbox ---------- */
(function () {
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var closeBtn = document.getElementById("lightbox-close");
  var items = document.querySelectorAll(".expandable");
  if (!lightbox || !lightboxImg || !items.length) return;

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("open");
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightboxImg.src = "";
  }

  items.forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      var img = item.querySelector("img");
      openLightbox(item.getAttribute("href"), img ? img.alt : "");
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
  });
})();
