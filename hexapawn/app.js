(() => {
  "use strict";

  const HUMAN = "W";
  const AI = "B";
  const START_BOARD = [AI, AI, AI, null, null, null, HUMAN, HUMAN, HUMAN];
  const MEMORY_KEY = "hexapawn-learning-v1";
  const PRACTICE_GAMES = 20;
  const AI_SPIN_DURATION_MS = 4000;
  const IS_HEBREW = document.documentElement.lang === "he";
  const t = IS_HEBREW ? {
    files: ["א", "ב", "ג"],
    move: (from, to) => `מ־${from} ל־${to}`,
    square: (coordinate, piece) => `${coordinate}${piece ? `, כלי ${piece === HUMAN ? "לבן" : "שחור"}` : ", משבצת פנויה"}`,
    chooseSquare: "בחרו משבצת",
    moveHints: "נקודה מסמנת מהלך פנוי. טבעת מסמנת אכילה.",
    yourMove: "המהלך שלכם",
    choosePawn: "בחרו כלי לבן, ואז בחרו משבצת מודגשת.",
    machineTurn: "תור המכונה",
    machineChoosing: "המכונה בוחרת",
    weighing: "היא משווה בין המהלכים החוקיים שהיא זוכרת.",
    yourTurn: "התור שלך",
    blackChose: (move) => `השחור בחר ${move}. מה תנסו עכשיו?`,
    youWon: "ניצחתם",
    machineWon: "המכונה ניצחה",
    foundWeakness: "מצאתם נקודת חולשה",
    lossFeedback: "המכונה הורידה את משקל כל המהלכים שביצעה. התחילו משחק חדש כדי לבדוק מה השתנה.",
    machineWins: "המכונה ניצחה",
    winFeedback: "המכונה העלתה את משקל המהלכים שהובילו לכאן. מעכשיו היא תעדיף אותם.",
    penaltyHtml: '<span class="lesson-icon">−</span><p><strong>הופעל עונש.</strong> הסיכוי למהלכים השחורים שהובילו להפסד ירד.</p>',
    rewardHtml: '<span class="lesson-icon">+</span><p><strong>ניתן פרס.</strong> הסיכוי למהלכים השחורים שהובילו לניצחון עלה.</p>',
    noDecision: "עוד לא התקבלה החלטה",
    emptyMemoryHtml: '<div class="empty-memory"><span class="empty-mark">?</span><p>האפשרויות של השחור יופיעו כאן אחרי המהלך הראשון שלכם.</p></div>',
    updated: "הזיכרון עודכן אחרי המשחק",
    lastDecision: "ההחלטה האחרונה של השחור",
    choosingNow: "הרולטה בוחרת מהלך",
    wheelLabel: "גלגל הסתברויות המהלכים",
    wheelSpinning: "הבחירה נקבעת לפי גודל הפרוסות",
    rouletteResult: "תוצאת ההגרלה",
    wheelStopped: (move) => `הרולטה נעצרה על ${move}`,
    capture: "אכילה",
    forward: "קדימה",
    picked: " · נבחר",
    brainLearned: "הפסים מייצגים את ההעדפות שהמכונה למדה עבור מצב לוח מסוים.",
    brainInitial: "כאשר לשחור יש כמה אפשרויות, המכונה מתחילה עם סיכוי שווה לכל מהלך חוקי.",
    defaultLessonHtml: '<span class="lesson-icon">↳</span><p><strong>לא תוכנתה שום אסטרטגיה.</strong> המכונה מכירה רק את החוקים ומתאימה את הבחירות שלה לאחר כל משחק.</p>',
    practiceDone: (wins) => `${PRACTICE_GAMES} משחקי אימון הסתיימו · המכונה ניצחה ב־${wins}`,
    memoryErased: "הזיכרון נמחק · כל המהלכים שוב שווים",
  } : {
    files: ["A", "B", "C"],
    move: (from, to) => `${from} → ${to}`,
    square: (coordinate, piece) => `${coordinate}${piece ? `, ${piece === HUMAN ? "white" : "black"} pawn` : ", empty"}`,
    chooseSquare: "Choose a square",
    moveHints: "Dots are open moves. Rings are captures.",
    yourMove: "Your move",
    choosePawn: "Choose a white pawn. Then choose a highlighted square.",
    machineTurn: "Machine's turn",
    machineChoosing: "The machine is choosing",
    weighing: "It weighs the legal moves it remembers.",
    yourTurn: "Your turn",
    blackChose: (move) => `Black chose ${move}. What will you try next?`,
    youWon: "You won",
    machineWon: "Machine won",
    foundWeakness: "You found a weakness",
    lossFeedback: "The machine lowered the weight of every move it used. Start again to test what changed.",
    machineWins: "The machine wins",
    winFeedback: "It raised the weight of the moves that led here. Those choices are now more likely.",
    penaltyHtml: '<span class="lesson-icon">−</span><p><strong>Penalty applied.</strong> The black moves used in this loss are now less likely.</p>',
    rewardHtml: '<span class="lesson-icon">+</span><p><strong>Reward applied.</strong> The black moves used in this win are now more likely.</p>',
    noDecision: "No decision yet",
    emptyMemoryHtml: '<div class="empty-memory"><span class="empty-mark">?</span><p>Black\'s choices will appear here after your first move.</p></div>',
    updated: "Updated after the game",
    lastDecision: "Black's last decision",
    choosingNow: "The move roulette is spinning",
    wheelLabel: "Move probability wheel",
    wheelSpinning: "The slice sizes determine the odds",
    rouletteResult: "Roulette result",
    wheelStopped: (move) => `The roulette stopped on ${move}`,
    capture: "capture",
    forward: "forward",
    picked: " · picked",
    brainLearned: "The bars are the machine's learned preferences for one exact board situation.",
    brainInitial: "When black has a choice, it gives every legal move an equal chance.",
    defaultLessonHtml: '<span class="lesson-icon">↳</span><p><strong>No strategy is programmed.</strong> Black only knows the rules and adjusts its choices after each game.</p>',
    practiceDone: (wins) => `${PRACTICE_GAMES} practice games complete · machine won ${wins}`,
    memoryErased: "Memory erased · every move is equal again",
  };

  const boardEl = document.getElementById("board");
  const thinkingEl = document.getElementById("thinking");
  const turnTextEl = document.getElementById("turnText");
  const statusTitleEl = document.getElementById("statusTitle");
  const statusBodyEl = document.getElementById("statusBody");
  const statusNumberEl = document.querySelector(".status-number");
  const memoryMovesEl = document.getElementById("memoryMoves");
  const memoryLabelEl = document.getElementById("memoryLabel");
  const brainIntroEl = document.getElementById("brainIntro");
  const lessonEl = document.getElementById("lesson");
  const toastEl = document.getElementById("toast");

  let board = [...START_BOARD];
  let turn = HUMAN;
  let selected = null;
  let gameOver = false;
  let aiTrail = [];
  let lastDecision = null;
  let pendingDecision = null;
  let timer = null;
  let data = loadMemory();

  function loadMemory() {
    try {
      const saved = JSON.parse(localStorage.getItem(MEMORY_KEY));
      if (saved && saved.policy && saved.stats) return saved;
    } catch (_) {}
    return { policy: {}, stats: { games: 0, human: 0, ai: 0 } };
  }

  function saveMemory() {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(data));
  }

  function rc(index) { return [Math.floor(index / 3), index % 3]; }
  function indexOf(row, col) { return row * 3 + col; }
  function inside(row, col) { return row >= 0 && row < 3 && col >= 0 && col < 3; }
  function opponent(player) { return player === HUMAN ? AI : HUMAN; }
  function boardKey(position) { return position.map((cell) => cell || "-").join(""); }
  function moveKey(move) { return `${move.from}-${move.to}`; }
  function moveName(move) {
    const [fromRow, fromCol] = rc(move.from);
    const [toRow, toCol] = rc(move.to);
    return t.move(`${t.files[fromCol]}${3 - fromRow}`, `${t.files[toCol]}${3 - toRow}`);
  }

  function legalMoves(position, player) {
    const direction = player === HUMAN ? -1 : 1;
    const moves = [];
    position.forEach((piece, from) => {
      if (piece !== player) return;
      const [row, col] = rc(from);
      const nextRow = row + direction;
      if (inside(nextRow, col)) {
        const forward = indexOf(nextRow, col);
        if (!position[forward]) moves.push({ from, to: forward, capture: false });
      }
      [-1, 1].forEach((dc) => {
        const captureCol = col + dc;
        if (!inside(nextRow, captureCol)) return;
        const target = indexOf(nextRow, captureCol);
        if (position[target] === opponent(player)) moves.push({ from, to: target, capture: true });
      });
    });
    return moves;
  }

  function applyMove(position, move) {
    const next = [...position];
    next[move.to] = next[move.from];
    next[move.from] = null;
    return next;
  }

  function winnerAfter(position, playerWhoMoved) {
    const humanReached = position.slice(0, 3).includes(HUMAN);
    const aiReached = position.slice(6, 9).includes(AI);
    if (humanReached) return HUMAN;
    if (aiReached) return AI;
    if (!position.includes(opponent(playerWhoMoved))) return playerWhoMoved;
    if (legalMoves(position, opponent(playerWhoMoved)).length === 0) return playerWhoMoved;
    return null;
  }

  function ensureState(position, moves) {
    const key = boardKey(position);
    if (!data.policy[key]) data.policy[key] = {};
    moves.forEach((move) => {
      const keyMove = moveKey(move);
      if (typeof data.policy[key][keyMove] !== "number") data.policy[key][keyMove] = 4;
    });
    return key;
  }

  function weightedChoice(position, moves, random = Math.random) {
    const state = ensureState(position, moves);
    const weights = moves.map((move) => Math.max(0.25, data.policy[state][moveKey(move)]));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let cursor = random() * total;
    for (let i = 0; i < moves.length; i += 1) {
      cursor -= weights[i];
      if (cursor <= 0) return { move: moves[i], state, moves, weights };
    }
    return { move: moves[moves.length - 1], state, moves, weights };
  }

  function learn(winner, trail = aiTrail) {
    const won = winner === AI;
    trail.forEach(({ state, action }) => {
      const current = data.policy[state][action] || 4;
      data.policy[state][action] = won ? Math.min(12, current + 0.7) : Math.max(0.25, current - 1);
    });
  }

  function render() {
    const humanMoves = turn === HUMAN && !gameOver ? legalMoves(board, HUMAN) : [];
    const legalTargets = selected === null ? [] : humanMoves.filter((move) => move.from === selected);
    boardEl.innerHTML = "";
    board.forEach((piece, index) => {
      const [row, col] = rc(index);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.testid = `cell-${row}-${col}`;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", t.square(`${t.files[col]}${3 - row}`, piece));

      if (piece === HUMAN && humanMoves.some((move) => move.from === index)) cell.classList.add("can-select");
      if (selected === index) cell.classList.add("selected");
      const targetMove = legalTargets.find((move) => move.to === index);
      if (targetMove) {
        cell.classList.add("legal");
        if (targetMove.capture) cell.classList.add("capture");
      }

      if (piece) {
        cell.innerHTML = `<span class="pawn ${piece === HUMAN ? "white" : "black"}" aria-hidden="true"><i class="head"></i><i class="body"></i><i class="base"></i></span>`;
      }
      cell.addEventListener("click", () => handleCell(index));
      boardEl.appendChild(cell);
    });

    document.getElementById("statesCount").textContent = Object.keys(data.policy).length;
    document.getElementById("gamesStat").textContent = data.stats.games;
    document.getElementById("humanStat").textContent = data.stats.human;
    document.getElementById("aiStat").textContent = data.stats.ai;
    renderMemory();
  }

  function handleCell(index) {
    if (turn !== HUMAN || gameOver) return;
    const allMoves = legalMoves(board, HUMAN);
    if (selected !== null) {
      const chosen = allMoves.find((move) => move.from === selected && move.to === index);
      if (chosen) {
        selected = null;
        makeHumanMove(chosen);
        return;
      }
    }
    if (board[index] === HUMAN && allMoves.some((move) => move.from === index)) {
      selected = selected === index ? null : index;
      setStatus(t.chooseSquare, t.moveHints, "02");
    } else {
      selected = null;
      setStatus(t.yourMove, t.choosePawn, "01");
    }
    render();
  }

  function makeHumanMove(move) {
    board = applyMove(board, move);
    render();
    const winner = winnerAfter(board, HUMAN);
    if (winner) return finishGame(winner);
    turn = AI;
    turnTextEl.textContent = t.machineTurn;
    setStatus(t.machineChoosing, t.weighing, "03");
    thinkingEl.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(startAiSelection, 120);
  }

  function startAiSelection() {
    const moves = legalMoves(board, AI);
    const decision = weightedChoice(board, moves);
    const action = moveKey(decision.move);
    pendingDecision = { ...decision, action };
    render();
    spinPendingWheel();
    clearTimeout(timer);
    timer = setTimeout(commitAiMove, AI_SPIN_DURATION_MS);
  }

  function spinPendingWheel() {
    const wheel = document.getElementById("rouletteWheel");
    if (!wheel || !pendingDecision) return;
    const finalRotation = wheelRotation(pendingDecision);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      wheel.classList.add("spinning");
      wheel.style.transform = `rotate(${finalRotation}deg)`;
    }));
  }

  function wheelRotation(decision) {
    const weights = decision.moves.map((move) => Math.max(0.25, data.policy[decision.state][moveKey(move)]));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const selectedIndex = decision.moves.findIndex((move) => moveKey(move) === decision.action);
    const before = weights.slice(0, selectedIndex).reduce((sum, weight) => sum + weight, 0);
    const selectedCenter = ((before + weights[selectedIndex] / 2) / total) * 360;
    return (360 * 5) + ((360 - selectedCenter) % 360);
  }

  function commitAiMove() {
    if (!pendingDecision || turn !== AI || gameOver) return;
    const decision = pendingDecision;
    aiTrail.push({ state: decision.state, action: decision.action });
    lastDecision = decision;
    pendingDecision = null;
    board = applyMove(board, decision.move);
    thinkingEl.classList.remove("show");
    const winner = winnerAfter(board, AI);
    if (winner) {
      render();
      finishGame(winner);
      return;
    }
    turn = HUMAN;
    turnTextEl.textContent = t.yourTurn;
    setStatus(t.yourMove, t.blackChose(moveName(decision.move)), "04");
    render();
  }

  function finishGame(winner) {
    gameOver = true;
    turn = null;
    clearTimeout(timer);
    thinkingEl.classList.remove("show");
    learn(winner);
    data.stats.games += 1;
    if (winner === HUMAN) data.stats.human += 1;
    else data.stats.ai += 1;
    saveMemory();
    turnTextEl.textContent = winner === HUMAN ? t.youWon : t.machineWon;
    if (winner === HUMAN) {
      setStatus(t.foundWeakness, t.lossFeedback, "✓");
      lessonEl.innerHTML = t.penaltyHtml;
    } else {
      setStatus(t.machineWins, t.winFeedback, "+");
      lessonEl.innerHTML = t.rewardHtml;
    }
    render();
  }

  function renderMemory() {
    const decision = pendingDecision || lastDecision;
    const isPending = Boolean(pendingDecision);
    if (!decision) {
      memoryLabelEl.textContent = t.noDecision;
      memoryMovesEl.innerHTML = t.emptyMemoryHtml;
      return;
    }
    const stateWeights = decision.moves.map((move) => Math.max(0.25, data.policy[decision.state][moveKey(move)]));
    const total = stateWeights.reduce((sum, weight) => sum + weight, 0);
    memoryLabelEl.textContent = isPending ? t.choosingNow : (gameOver ? t.updated : t.lastDecision);
    memoryMovesEl.innerHTML = "";
    let cursor = 0;
    const colors = ["#171713", "#77736b", "#b4ada2", "#f8f5ed", "#4b4944"];
    const slices = stateWeights.map((weight, index) => {
      const start = (cursor / total) * 100;
      cursor += weight;
      const end = (cursor / total) * 100;
      return `${colors[index % colors.length]} ${start}% ${end}%`;
    }).join(", ");
    const roulette = document.createElement("div");
    const wheelClass = `roulette-wheel${isPending ? "" : " settled"}`;
    const wheelTransform = isPending ? "" : `;transform:rotate(${wheelRotation(decision)}deg)`;
    const rouletteTitle = isPending ? t.choosingNow : t.rouletteResult;
    const rouletteDetail = isPending ? t.wheelSpinning : t.wheelStopped(moveName(decision.move));
    roulette.className = "roulette-stage";
    roulette.innerHTML = `<div class="roulette-visual"><span class="roulette-pointer" aria-hidden="true"></span><div class="${wheelClass}" id="rouletteWheel" data-testid="roulette-wheel" role="img" aria-label="${t.wheelLabel}" style="background:conic-gradient(${slices})${wheelTransform}"><i>${decision.moves.length}</i></div></div><div class="roulette-copy"><strong>${rouletteTitle}</strong><small>${rouletteDetail}</small></div>`;
    memoryMovesEl.appendChild(roulette);
    decision.moves.forEach((move, index) => {
      const percent = Math.round((stateWeights[index] / total) * 100);
      const row = document.createElement("div");
      const isChosen = !isPending && moveKey(move) === decision.action;
      row.className = `memory-row${isChosen ? " chosen" : ""}`;
      row.innerHTML = `<span class="move-name">${moveName(move)}<small>${move.capture ? t.capture : t.forward}${isChosen ? t.picked : ""}</small></span><span class="bar-track"><i class="bar" style="width:${percent}%"></i></span><span class="chance">${percent}%</span>`;
      memoryMovesEl.appendChild(row);
    });
    brainIntroEl.textContent = t.brainLearned;
  }

  function setStatus(title, body, number) {
    statusTitleEl.textContent = title;
    statusBodyEl.textContent = body;
    statusNumberEl.textContent = number;
  }

  function resetGame() {
    clearTimeout(timer);
    board = [...START_BOARD];
    turn = HUMAN;
    selected = null;
    gameOver = false;
    aiTrail = [];
    lastDecision = null;
    pendingDecision = null;
    thinkingEl.classList.remove("show");
    turnTextEl.textContent = t.yourTurn;
    setStatus(t.yourMove, t.choosePawn, "01");
    brainIntroEl.textContent = t.brainInitial;
    lessonEl.innerHTML = t.defaultLessonHtml;
    render();
  }

  function randomHumanChoice(position, moves) {
    // Biased toward captures and promotion, so practice provides a useful opponent.
    const scored = moves.map((move) => {
      const [toRow] = rc(move.to);
      return { move, score: 1 + (move.capture ? 1.3 : 0) + (toRow === 0 ? 4 : 0) };
    });
    const total = scored.reduce((sum, item) => sum + item.score, 0);
    let cursor = Math.random() * total;
    for (const item of scored) {
      cursor -= item.score;
      if (cursor <= 0) return item.move;
    }
    return scored[scored.length - 1].move;
  }

  function simulateOneGame() {
    let simBoard = [...START_BOARD];
    let simTurn = HUMAN;
    const trail = [];
    while (true) {
      const moves = legalMoves(simBoard, simTurn);
      let move;
      if (simTurn === AI) {
        const decision = weightedChoice(simBoard, moves);
        move = decision.move;
        trail.push({ state: decision.state, action: moveKey(move) });
      } else {
        move = randomHumanChoice(simBoard, moves);
      }
      simBoard = applyMove(simBoard, move);
      const winner = winnerAfter(simBoard, simTurn);
      if (winner) {
        learn(winner, trail);
        data.stats.games += 1;
        if (winner === HUMAN) data.stats.human += 1;
        else data.stats.ai += 1;
        return winner;
      }
      simTurn = opponent(simTurn);
    }
  }

  function fastPractice() {
    const beforeWins = data.stats.ai;
    for (let i = 0; i < PRACTICE_GAMES; i += 1) simulateOneGame();
    saveMemory();
    resetGame();
    const wins = data.stats.ai - beforeWins;
    showToast(t.practiceDone(wins));
  }

  function eraseMemory() {
    data = { policy: {}, stats: { games: 0, human: 0, ai: 0 } };
    saveMemory();
    resetGame();
    showToast(t.memoryErased);
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  document.getElementById("newGameButton").addEventListener("click", resetGame);
  document.getElementById("practiceButton").addEventListener("click", fastPractice);
  document.getElementById("resetBrainButton").addEventListener("click", eraseMemory);

  render();
})();
