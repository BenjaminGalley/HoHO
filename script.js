/* ===============================
   GLOBAL STATE (LOCAL STORAGE)
================================ */
let user = JSON.parse(localStorage.getItem("user")) || null;
let balance = Number(localStorage.getItem("balance")) || 0;
let deposits = JSON.parse(localStorage.getItem("deposits")) || [];
let withdrawals = JSON.parse(localStorage.getItem("withdrawals")) || [];

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxf_AZ6uJO5BuW9y0M9EuUjF1ZKphqcLG6SeE5DtOORxusuMosjbEvqUiv7tsd4JVfAdA/exec";

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

  balance = 0;
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
   DEPOSIT (GOOGLE SCRIPT)
================================ */
async function submitDeposit(e) {
  e.preventDefault();
  const method = document.getElementById("depMethod").value;
  const senderName = document.getElementById("depSenderName").value.trim();
  const senderPhone = document.getElementById("depSenderPhone").value.trim();
  const amount = Number(document.getElementById("depAmount").value);

  if (amount < 100) {
    alert("Minimum deposit is 100 Birr");
    return;
  }

  const payload = {
    type: "deposit",
    playerId: user.playerId,
    name: user.name,
    phone: user.phone,
    amount,
    method,
    senderName,
    senderPhone
  };

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    if (data.status === "success") {
      deposits.push({...payload, status:"PENDING"});
      saveState();
      alert("Deposit submitted for approval");
    }
  } catch(err){
    alert("Deposit failed: " + err);
  }
}

/* ===============================
   WITHDRAWAL (GOOGLE SCRIPT)
================================ */
async function submitWithdrawal(e) {
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

  balance -= amount; // hold instantly
  saveState();
  updateTopBar();

  const payload = {
    type: "withdrawal",
    playerId: user.playerId,
    name: user.name,
    phone: user.phone,
    amount,
    method,
    receiverName,
    receiverPhone
  };

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    if(data.status==="success"){
      withdrawals.push({...payload, status:"PENDING"});
      saveState();
      alert("Withdrawal request submitted");
    }
  } catch(err){
    alert("Withdrawal failed: " + err);
    balance += amount; // rollback
    saveState();
    updateTopBar();
  }
}

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", updateTopBar);
