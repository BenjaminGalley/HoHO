// =========================
// USER MANAGEMENT
// =========================
let users = JSON.parse(localStorage.getItem("users") || "[]");
let user = JSON.parse(localStorage.getItem("user") || "null");
let balance = Number(localStorage.getItem("balance") || 0);

// -------------------------
// UPDATE UI AFTER LOGIN
// -------------------------
function updateUI() {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const depositBtn = document.getElementById("depositBtn");
  const withdrawalBtn = document.getElementById("withdrawalBtn");
  const profileBtn = document.getElementById("profileBtn");
  const balancePanel = document.getElementById("balancePanel");

  if (user) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    depositBtn.style.display = "inline-block";
    withdrawalBtn.style.display = "inline-block";
    profileBtn.style.display = "inline-block";
    balancePanel.innerText = `ID: ${user.id} | Balance: ${balance} Birr`;
  } else {
    loginBtn.style.display = "inline-block";
    registerBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    depositBtn.style.display = "none";
    withdrawalBtn.style.display = "none";
    profileBtn.style.display = "none";
    balancePanel.innerText = "";
  }
}
updateUI();

// -------------------------
// LOGIN & LOGOUT
// -------------------------
function login(phone, password) {
  const u = users.find(usr => usr.phone === phone && usr.password === password);
  if (!u) return alert("Invalid phone or password");
  user = u;
  localStorage.setItem("user", JSON.stringify(user));
  balance = Number(localStorage.getItem(`balance_${user.id}`) || 0);
  updateUI();
}

function logout() {
  user = null;
  localStorage.removeItem("user");
  balance = 0;
  updateUI();
}

// -------------------------
// REGISTRATION
// -------------------------
function register(name, phone, password) {
  if (!name || !phone || !password) return alert("Fill all fields");
  if (users.find(u => u.phone === phone)) return alert("Phone already registered");

  const id = "P" + Date.now();
  const newUser = { id, name, phone, password };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem(`balance_${id}`, 0); // start with 0 balance
  alert(`Registered! Your ID: ${id}`);
}

// =========================
// DEPOSIT & WITHDRAWAL (local pending for now)
// =========================
let deposits = JSON.parse(localStorage.getItem("deposits") || "[]");
let withdrawals = JSON.parse(localStorage.getItem("withdrawals") || "[]");

function deposit(amount, method, senderName, senderPhone) {
  if (!user) return alert("Login first");
  if (amount < 100) return alert("Minimum deposit 100 Birr");

  const dep = {
    id: Date.now(),
    playerId: user.id,
    name: user.name,
    phone: user.phone,
    amount,
    method,
    senderName,
    senderPhone,
    status: "PENDING"
  };
  deposits.push(dep);
  localStorage.setItem("deposits", JSON.stringify(deposits));
  alert("Deposit request submitted");
}

function withdraw(amount, method, receiverName, receiverPhone) {
  if (!user) return alert("Login first");
  if (amount < 100) return alert("Minimum 100 Birr");
  if (amount > balance) return alert("Insufficient balance");

  const w = {
    id: Date.now(),
    playerId: user.id,
    amount,
    method,
    receiverName,
    receiverPhone,
    status: "PENDING"
  };
  withdrawals.push(w);
  balance -= amount; // temp deduct until admin approves
  localStorage.setItem("balance", balance);
  localStorage.setItem("withdrawals", JSON.stringify(withdrawals));
  alert("Withdrawal request submitted");
  updateUI();
}

// =========================
// ADMIN FUNCTIONS
// =========================
function adminApproveDeposit(id) {
  const d = deposits.find(dep => dep.id === id);
  if (!d) return;
  d.status = "APPROVED";
  balance = Number(localStorage.getItem(`balance_${d.playerId}`) || 0) + d.amount;
  localStorage.setItem(`balance_${d.playerId}`, balance);
  localStorage.setItem("deposits", JSON.stringify(deposits));
}

function adminRejectDeposit(id) {
  const d = deposits.find(dep => dep.id === id);
  if (!d) return;
  d.status = "REJECTED";
  localStorage.setItem("deposits", JSON.stringify(deposits));
}

function adminApproveWithdrawal(id) {
  const w = withdrawals.find(wd => wd.id === id);
  if (!w) return;
  w.status = "APPROVED";
  localStorage.setItem("withdrawals", JSON.stringify(withdrawals));
}

function adminRejectWithdrawal(id) {
  const w = withdrawals.find(wd => wd.id === id);
  if (!w) return;
  w.status = "REJECTED";
  balance += w.amount; // return money to user
  localStorage.setItem("balance", balance);
  localStorage.setItem("withdrawals", JSON.stringify(withdrawals));
  updateUI();
}

// =========================
// GAME PLACEHOLDER CLICK
// =========================
document.querySelectorAll(".card").forEach((c, i)=>{
  c.addEventListener("click",()=>{
    if(!user) return alert("Login to play");
    if(i===0) window.location.href="game1.html";
    if(i===1) window.location.href="game2.html";
    if(i===2) window.location.href="keno.html";
  });
});

// =========================
// PASSWORD EYE TOGGLE
// =========================
function togglePassword(id) {
  const input = document.getElementById(id);
  if(input.type==="password") input.type="text";
  else input.type="password";
}
