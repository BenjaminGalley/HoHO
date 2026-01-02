/* ===============================
   HoHoHo Bet – Frontend Script
   (No backend yet)
   =============================== */

/* ---------- Utilities ---------- */
function generatePlayerId() {
  return "HHB-" + Math.floor(100000 + Math.random() * 900000);
}

/* ---------- Registration ---------- */
function registerPlayer() {
  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;

  if (!fullName || !phone || !password) {
    alert("All fields required");
    return;
  }

  const playerId = generatePlayerId();

  const playerData = {
    playerId,
    fullName,
    phone
  };

  localStorage.setItem("player", JSON.stringify(playerData));
  localStorage.setItem("loggedIn", "true");

  alert("Registration successful. Your Player ID: " + playerId);
  window.location.href = "index.html";
}

/* ---------- Login ---------- */
function loginPlayer() {
  const phone = document.getElementById("phone").value.trim();
  const stored = JSON.parse(localStorage.getItem("player"));

  if (!stored || stored.phone !== phone) {
    alert("Invalid login");
    return;
  }

  localStorage.setItem("loggedIn", "true");
  window.location.href = "index.html";
}

/* ---------- Deposit ---------- */
function submitDeposit() {
  const method = document.getElementById("method").value;
  const senderPhone = document.getElementById("senderPhone").value.trim();
  const senderName = document.getElementById("senderName").value.trim();
  const amount = Number(document.getElementById("amount").value);

  if (!senderPhone || !senderName || amount < 100) {
    alert("Minimum deposit is 100 birr");
    return;
  }

  const depositData = {
    type: "deposit",
    method,
    senderPhone,
    senderName,
    amount,
    date: new Date().toISOString()
  };

  console.log("DEPOSIT:", depositData);
  alert("Deposit submitted (pending confirmation)");
}

/* ---------- Withdrawal ---------- */
function submitWithdrawal() {
  const method = document.getElementById("method").value;
  const receiverPhone = document.getElementById("receiverPhone").value.trim();
  const receiverName = document.getElementById("receiverName").value.trim();
  const amount = Number(document.getElementById("amount").value);

  if (!receiverPhone || !receiverName || amount < 100 || amount > 10000) {
    alert("Withdrawal must be 100 – 10,000 birr");
    return;
  }

  const withdrawalData = {
    type: "withdraw",
    method,
    receiverPhone,
    receiverName,
    amount,
    date: new Date().toISOString()
  };

  console.log("WITHDRAW:", withdrawalData);
  alert("Withdrawal request sent");
}

/* ---------- UI State ---------- */
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("loggedIn") === "true") {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const depositBtn = document.getElementById("depositBtn");

    if (loginBtn) loginBtn.classList.add("hidden");
    if (registerBtn) registerBtn.classList.add("hidden");
    if (depositBtn) depositBtn.classList.remove("hidden");
  }
});
