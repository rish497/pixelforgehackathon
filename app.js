const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".primary-nav");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

const revealElements = [...document.querySelectorAll(".reveal")];

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        activeObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px",
    },
  );

  revealElements.forEach((element) => observer.observe(element));
}

const journeySection = document.querySelector(".journey-section");

if (journeySection && !reducedMotion) {
  const rowCount = 28;
  const bricksPerRow = 24;
  const collapseAt = 6 + Math.floor(Math.random() * 2);
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hammerCursor = document.createElement("span");
  const journeyWall = document.createElement("span");
  let cursorFrame;
  let pointerX = 0;
  let pointerY = 0;
  let strikeTimer;
  let hitCount = 0;
  let collapseScheduled = false;
  let wallCollapsed = false;

  hammerCursor.className = "hammer-cursor";
  hammerCursor.setAttribute("aria-hidden", "true");
  document.body.append(hammerCursor);

  journeyWall.className = "journey-wall";
  journeyWall.setAttribute("aria-hidden", "true");
  journeySection.prepend(journeyWall);
  journeySection.classList.add("hammer-enabled");

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = document.createElement("span");
    row.className = "journey-brick-row";

    for (let brickIndex = 0; brickIndex < bricksPerRow; brickIndex += 1) {
      const brick = document.createElement("span");
      brick.className = "journey-brick";
      brick.dataset.row = String(rowIndex);
      brick.dataset.column = String(brickIndex);
      row.append(brick);
    }

    journeyWall.append(row);
  }

  const placeCursor = () => {
    hammerCursor.style.left = `${pointerX}px`;
    hammerCursor.style.top = `${pointerY}px`;
    cursorFrame = undefined;
  };

  const setBrickFall = (brick, options = {}) => {
    if (brick.classList.contains("falling")) return;

    const horizontal = options.horizontal ?? Math.random() * 150 - 75;
    const vertical = options.vertical ?? 190 + Math.random() * 280;
    const delay = options.delay ?? Math.random() * 70;
    const duration = options.duration ?? 1050 + Math.random() * 500;
    const rotation = options.rotation ?? Math.random() * 80 - 40;

    brick.style.setProperty("--fall-x", `${horizontal}px`);
    brick.style.setProperty("--fall-y", `${vertical}px`);
    brick.style.setProperty("--fall-delay", `${delay}ms`);
    brick.style.setProperty("--fall-duration", `${duration}ms`);
    brick.style.setProperty("--fade-delay", `${duration * 0.58}ms`);
    brick.style.setProperty("--rotation", `${rotation}deg`);

    requestAnimationFrame(() => brick.classList.add("falling"));
  };

  const knockOutNearbyBricks = (clientX, clientY) => {
    const amount = 8 + Math.floor(Math.random() * 4);
    const wallBounds = journeyWall.getBoundingClientRect();
    const approximateRow = Math.floor(
      ((clientY - wallBounds.top) / wallBounds.height) * rowCount,
    );
    const approximateColumn = Math.floor(
      ((clientX - wallBounds.left) / wallBounds.width) * bricksPerRow,
    );
    const candidates = [];

    for (let rowOffset = -2; rowOffset <= 2; rowOffset += 1) {
      const row = approximateRow + rowOffset;
      if (row < 0 || row >= rowCount) continue;

      for (let columnOffset = -3; columnOffset <= 3; columnOffset += 1) {
        const column = approximateColumn + columnOffset;
        if (column < 0 || column >= bricksPerRow) continue;

        const brick = journeyWall.querySelector(
          `.journey-brick[data-row="${row}"][data-column="${column}"]:not(.falling)`,
        );
        if (brick) candidates.push(brick);
      }
    }

    const nearest = candidates
      .map((brick) => {
        const bounds = brick.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        return {
          brick,
          distance: Math.hypot(centerX - clientX, centerY - clientY),
        };
      })
      .sort((first, second) => first.distance - second.distance)
      .slice(0, amount);

    nearest.forEach(({ brick, distance }, index) => {
      const bounds = brick.getBoundingClientRect();
      const direction = bounds.left + bounds.width / 2 < clientX ? -1 : 1;
      setBrickFall(brick, {
        horizontal: direction * (24 + Math.random() * 85),
        vertical: 170 + Math.random() * 240 + distance * 0.15,
        delay: index * 22 + Math.random() * 24,
        duration: 1050 + Math.random() * 420,
        rotation: direction * (18 + Math.random() * 52),
      });
    });
  };

  const collapseWall = () => {
    const rows = [...journeyWall.querySelectorAll(".journey-brick-row")];
    const rowInterval = 165;
    const maximumBrickDelay = 260;
    const maximumFallDuration = 1950;

    wallCollapsed = true;
    hammerCursor.classList.remove("visible", "striking");
    journeySection.classList.remove("hammer-enabled");

    [...rows].reverse().forEach((row, sequenceIndex) => {
      setTimeout(() => {
        const bricks = [...row.querySelectorAll(".journey-brick:not(.falling)")];

        bricks.forEach((brick) => {
          const column = Number(brick.dataset.column);
          const direction = column < bricksPerRow / 2 ? -1 : 1;

          setBrickFall(brick, {
            horizontal: direction * (20 + Math.random() * 145),
            vertical: journeySection.offsetHeight + 180 + Math.random() * 280,
            delay: Math.random() * maximumBrickDelay,
            duration: 1300 + Math.random() * 650,
            rotation: direction * (24 + Math.random() * 115),
          });
        });
      }, sequenceIndex * rowInterval);
    });

    const collapseDuration =
      (rows.length - 1) * rowInterval + maximumBrickDelay + maximumFallDuration;
    setTimeout(
      () => journeySection.classList.add("wall-revealed"),
      collapseDuration + 120,
    );
  };

  journeySection.addEventListener("pointerenter", (event) => {
    if (!finePointer || wallCollapsed) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    placeCursor();
    hammerCursor.classList.add("visible");
  });

  journeySection.addEventListener("pointermove", (event) => {
    if (!finePointer || wallCollapsed) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!cursorFrame) cursorFrame = requestAnimationFrame(placeCursor);
  });

  journeySection.addEventListener("pointerleave", () => {
    hammerCursor.classList.remove("visible", "striking");
  });

  journeySection.addEventListener("click", (event) => {
    if (wallCollapsed || collapseScheduled) return;

    knockOutNearbyBricks(event.clientX, event.clientY);
    hitCount += 1;

    if (finePointer) {
      clearTimeout(strikeTimer);
      hammerCursor.classList.add("striking");
      strikeTimer = setTimeout(() => hammerCursor.classList.remove("striking"), 150);
    }

    if (hitCount >= collapseAt) {
      collapseScheduled = true;
      setTimeout(collapseWall, 260);
    }
  });
}
