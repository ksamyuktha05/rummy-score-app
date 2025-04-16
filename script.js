let players = [];
let activePlayers = [];
let round = 1;
let scores = [];
let scoreLimit = null;

function startGame() {
  const input = document.getElementById("player-names").value;
  players = input.split(",").map(p => p.trim()).filter(p => p !== "");
  activePlayers = [...players];

  const limitInput = document.getElementById("score-limit").value;
  scoreLimit = limitInput ? parseInt(limitInput) : null;

  if (players.length < 2 || players.length > 6) {
    alert("Please enter between 2 and 6 players.");
    return;
  }

  const headerRow = document.getElementById("score-header");
  headerRow.innerHTML = "<th>Round</th>";
  players.forEach(player => {
    headerRow.innerHTML += `<th>${player}</th>`;
  });

  const inputDiv = document.getElementById("score-inputs");
  inputDiv.innerHTML = "";

  players.forEach((player, i) => {
    inputDiv.innerHTML += `
      <div class="player-input" id="input-row-${i}">
        <label>${player}:</label>
        <input type="text" id="score-${i}" placeholder="Score / W / D / MD" oninput="handleShortcuts(${i})" />
        <button type="button" class="w-btn" onclick="setShortcut(${i}, 'W')">W</button>
        <button type="button" class="d-btn" onclick="setShortcut(${i}, 'D')">D</button>
        <button type="button" class="md-btn" onclick="setShortcut(${i}, 'MD')">MD</button>
      </div>
    `;
  });

  document.getElementById("score-section").style.display = "block";
}

function handleShortcuts(index) {
  const input = document.getElementById(`score-${index}`);
  const value = input.value.trim().toUpperCase();
  if (value === "W") {
    input.value = 0;
  } else if (value === "D") {
    input.value = 20;
  } else if (value === "MD") {
    input.value = 40;
  }
}

function setShortcut(index, type) {
  const input = document.getElementById(`score-${index}`);
  if (type === "W") input.value = 0;
  if (type === "D") input.value = 20;
  if (type === "MD") input.value = 40;
  input.focus();
}

function addRound() {
  const scoreRow = document.createElement("tr");
  scoreRow.innerHTML = `<td>${round}</td>`;
  let roundScores = [];

  for (let i = 0; i < players.length; i++) {
    if (!activePlayers.includes(players[i])) {
      roundScores.push("-");
      scoreRow.innerHTML += `<td>-</td>`;
      continue;
    }
    const input = document.getElementById(`score-${i}`);
    const val = parseInt(input.value);
    if (isNaN(val)) {
      alert(`Please enter a score for ${players[i]}`);
      return;
    }
    roundScores.push(val);
    scoreRow.innerHTML += `<td>${val}</td>`;
    input.value = "";
  }

  scores.push(roundScores);

  const body = document.getElementById("score-body");
  const totalRow = document.getElementById("total-row");
  if (totalRow) {
    body.insertBefore(scoreRow, totalRow);
  } else {
    body.appendChild(scoreRow);
  }

  round++;
  updateTotals();
}

function updateTotals() {
  const existingTotal = document.getElementById("total-row");
  if (existingTotal) existingTotal.remove();

  const totalRow = document.createElement("tr");
  totalRow.id = "total-row";
  totalRow.style.fontWeight = "bold";
  totalRow.innerHTML = "<td>Total</td>";

  let highest = -1;
  let leaderIndex = -1;

  for (let i = 0; i < players.length; i++) {
    let total = 0;
    for (let r = 0; r < scores.length; r++) {
      const score = scores[r][i];
      if (typeof score === 'number') {
        total += score;
      }
    }
    if (total > highest && activePlayers.includes(players[i])) {
      highest = total;
      leaderIndex = i;
    }
    totalRow.innerHTML += `<td id="total-${i}">${activePlayers.includes(players[i]) ? total : '-'}</td>`;

    if (scoreLimit && total >= scoreLimit && activePlayers.includes(players[i])) {
      alert(`${players[i]} has been eliminated for reaching ${scoreLimit} points.`);
      activePlayers = activePlayers.filter(p => p !== players[i]);
      document.getElementById(`input-row-${i}`).style.display = "none";
    }
  }

  document.getElementById("score-body").appendChild(totalRow);

  for (let i = 0; i < players.length; i++) {
    const cell = document.getElementById(`total-${i}`);
    if (cell && activePlayers.includes(players[i])) {
      cell.style.color = i === leaderIndex ? "green" : "#333";
      cell.style.fontWeight = i === leaderIndex ? "bold" : "normal";
    }
  }
}

function undoLastRound() {
  if (scores.length === 0) {
    alert("No round to undo!");
    return;
  }

  scores.pop();
  round--;

  const body = document.getElementById("score-body");
  const totalRow = document.getElementById("total-row");
  if (totalRow && totalRow.previousSibling) {
    body.removeChild(totalRow.previousSibling);
  }

  activePlayers = [...players];
  document.querySelectorAll(".player-input").forEach(div => div.style.display = "block");
  updateTotals();
}

function resetGame() {
  players = [];
  activePlayers = [];
  round = 1;
  scores = [];
  scoreLimit = null;
  document.getElementById("score-body").innerHTML = "";
  document.getElementById("score-section").style.display = "none";
}
