/* ===============================
   GLOBAL STATE (LOCAL STORAGE)
================================ */
let user = JSON.parse(localStorage.getItem("user")) || null;
let balance = Number(localStorage.getItem("balance")) || 0;
let deposits = JSON.parse(localStorage.getItem("deposits")) || [];
let withdrawals = JSON.parse(localStorage.getItem("withdrawals")) || [];

/* ===============================
   UTIL
================================ */
function saveState() {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("balance", balance);
  localStorage.setItem("deposits", JSON.stringify(deposits));
  localStorage.setItem("withdrawals", JSON.stringify(withdrawals));
}

function generatePlayerId() {
  return "HHB-" + Math.floor(100000 + Math.random() * 900000);
}

function updateTopBar() {
  const balanceEl = document.getElementById("balanceDisplay");
  const playerEl = document.getElementById("playerIdDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const depositBtn = document.getElementById("depositBtn");
  const sideMenu = document.getElementById("sideMenu");

  if (user) {
    if (balanceEl) balanceEl.innerText = `Balance: ${balance} Birr`;
    if (playerEl) playerEl.innerText = `ID: ${user.playerId}`;
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (depositBtn) depositBtn.style.display = "inline-block";
    if (sideMenu) sideMenu.style.display = "block";
  } else {
    if (balanceEl) balanceEl.innerText = "";
    if (playerEl) playerEl.innerText = "";
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (registerBtn) registerBtn.style.display = "inline-block";
    if (depositBtn) depositBtn.style.display = "none";
    if (sideMenu) sideMenu.style.display = "none";
  }
}

/* ===============================
   REGISTRATION
================================ */
function registerUser(e) {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  if (!name || !phone || !password) {
    alert("All fields required");
    return;
  }

  user = {
    name,
    phone,
    password,
    playerId: generatePlayerId()
  };

  balance = 0; // NO AUTO MONEY
  saveState();
  updateTopBar();
  alert("Registration successful");
  window.location.href = "index.html";
}

/* ===============================
   LOGIN
================================ */
function loginUser(e) {
  e.preventDefault();
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!user || phone !== user.phone || password !== user.password) {
    alert("Invalid phone or password");
    return;
  }

  updateTopBar();
  alert("Login successful");
  window.location.href = "index.html";
}

/* ===============================
   LOGOUT
================================ */
function logoutUser() {
  user = null;
  saveState();
  updateTopBar();
  window.location.href = "index.html";
}

/* ===============================
   DEPOSIT (PENDING)
================================ */
function submitDeposit(e) {
  e.preventDefault();
  const method = document.getElementById("depMethod").value;
  const senderName = document.getElementById("depSenderName").value.trim();
  const senderPhone = document.getElementById("depSenderPhone").value.trim();
  const amount = Number(document.getElementById("depAmount").value);

  if (amount < 100) {
    alert("Minimum deposit is 100 Birr");
    return;
  }

  deposits.push({
    id: Date.now(),
    playerId: user.playerId,
    name: user.name,
    phone: user.phone,
    method,
    senderName,
    senderPhone,
    amount,
    status: "PENDING"
  });

  saveState();
  alert("Deposit submitted for approval");
}

/* ===============================
   WITHDRAWAL (INSTANT HOLD)
================================ */
function submitWithdrawal(e) {
  e.preventDefault();
  const method = document.getElementById("withMethod").value;
  const receiverName = document.getElementById("withName").value.trim();
  const receiverPhone = document.getElementById("withPhone").value.trim();
  const amount = Number(document.getElementById("withAmount").value);

  if (amount < 100 || amount > 10000) {
    alert("Withdrawal must be 100 – 10,000 Birr");
    return;
  }
  if (amount > balance) {
    alert("Insufficient balance");
    return;
  }

  balance -= amount; // HOLD AMOUNT
  withdrawals.push({
    id: Date.now(),
    playerId: user.playerId,
    method,
    receiverName,
    receiverPhone,
    amount,
    status: "PENDING"
  });

  saveState();
  updateTopBar();
  alert("Withdrawal request submitted");
}

/* ===============================
   ADMIN ACTIONS (TEMP)
================================ */
function adminApproveDeposit(id) {
  const d = deposits.find(x => x.id === id);
  if (!d || d.status !== "PENDING") return;
  d.status = "APPROVED";
  balance += d.amount;
  saveState();
}

function adminRejectDeposit(id) {
  const d = deposits.find(x => x.id === id);
  if (!d) return;
  d.status = "REJECTED";
  saveState();
}

function adminApproveWithdrawal(id) {
  const w = withdrawals.find(x => x.id === id);
  if (!w) return;
  w.status = "APPROVED";
  saveState();
}

function adminRejectWithdrawal(id) {
  const w = withdrawals.find(x => x.id === id);
  if (!w || w.status !== "PENDING") return;
  w.status = "REJECTED";
  balance += w.amount; // RETURN MONEY
  saveState();
}

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", updateTopBar);
