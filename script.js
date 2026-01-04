// =========================
// CONFIG
// =========================
const GS_URL = "https://script.google.com/macros/s/AKfycbxf_AZ6uJO5BuW9y0M9EuUjF1ZKphqcLG6SeE5DtOORxusuMosjbEvqUiv7tsd4JVfAdA/exec";
let users = JSON.parse(localStorage.getItem("users") || "[]");
let user = JSON.parse(localStorage.getItem("user") || "null");
let balance = user ? Number(localStorage.getItem(`balance_${user.id}`) || 0) : 0;

// =========================
// UI UPDATE
// =========================
function updateUI(){
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const depositBtn = document.getElementById("depositBtn");
    const withdrawalBtn = document.getElementById("withdrawalBtn");
    const profileBtn = document.getElementById("profileBtn");
    const balancePanel = document.getElementById("balancePanel");

    if(user){
        loginBtn.style.display="none";
        registerBtn.style.display="none";
        logoutBtn.style.display="inline-block";
        depositBtn.style.display="inline-block";
        withdrawalBtn.style.display="inline-block";
        profileBtn.style.display="inline-block";
        balancePanel.innerText=`ID: ${user.id} | Balance: ${balance} Birr`;
    } else {
        loginBtn.style.display="inline-block";
        registerBtn.style.display="inline-block";
        logoutBtn.style.display="none";
        depositBtn.style.display="none";
        withdrawalBtn.style.display="none";
        profileBtn.style.display="none";
        balancePanel.innerText="";
    }
}
updateUI();

// =========================
// REGISTRATION
// =========================
function register(name, phone, password){
    if(!name || !phone || !password) return alert("Fill all fields");
    if(users.find(u=>u.phone===phone)) return alert("Phone already registered");

    const id = "P"+Date.now();
    const newUser = {id, name, phone, password};
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem(`balance_${id}`,0);
    alert(`Registered! Your ID: ${id}`);
}

// =========================
// LOGIN / LOGOUT
// =========================
function login(phone, password){
    const u = users.find(usr=>usr.phone===phone && usr.password===password);
    if(!u) return alert("Invalid phone or password");
    user = u;
    localStorage.setItem("user", JSON.stringify(user));
    balance = Number(localStorage.getItem(`balance_${user.id}`) || 0);
    updateUI();
}

function logout(){
    user=null;
    localStorage.removeItem("user");
    balance=0;
    updateUI();
}

// =========================
// PASSWORD TOGGLE
// =========================
function togglePassword(id){
    const input=document.getElementById(id);
    input.type = (input.type==="password")?"text":"password";
}

// =========================
// DEPOSIT
// =========================
async function deposit(amount, method, senderName, senderPhone){
    if(!user) return alert("Login first");
    if(amount<100) return alert("Minimum deposit 100 Birr");

    const payload={
        action:"deposit",
        playerId:user.id,
        name:user.name,
        phone:user.phone,
        amount,
        method,
        senderName,
        senderPhone
    };
    try{
        await fetch(GS_URL,{method:"POST",body:JSON.stringify(payload)});
        alert("Deposit submitted (pending admin approval)");
    } catch(e){ alert("Error: "+e.message); }
}

// =========================
// WITHDRAWAL
// =========================
async function withdraw(amount, method, receiverName, receiverPhone){
    if(!user) return alert("Login first");
    if(amount<100) return alert("Minimum 100 Birr");
    if(amount>balance) return alert("Insufficient balance");

    balance-=amount; // temporary deduction
    localStorage.setItem(`balance_${user.id}`,balance);
    updateUI();

    const payload={
        action:"withdraw",
        playerId:user.id,
        amount,
        method,
        receiverName,
        receiverPhone
    };
    try{
        await fetch(GS_URL,{method:"POST",body:JSON.stringify(payload)});
        alert("Withdrawal submitted (pending admin approval)");
    } catch(e){
        balance+=amount; // rollback
        localStorage.setItem(`balance_${user.id}`,balance);
        updateUI();
        alert("Error: "+e.message);
    }
}

// =========================
// ADMIN ACTIONS
// =========================
async function adminApproveDeposit(id){ await adminAction("adminApproveDeposit",id); }
async function adminRejectDeposit(id){ await adminAction("adminRejectDeposit",id); }
async function adminApproveWithdrawal(id){ await adminAction("adminApproveWithdrawal",id); }
async function adminRejectWithdrawal(id){ await adminAction("adminRejectWithdrawal",id); }

async function adminAction(action,id){
    try{
        await fetch(GS_URL,{method:"POST",body:JSON.stringify({action,id})});
        alert("Action completed");
    } catch(e){ alert("Error: "+e.message); }
}

// =========================
// FETCH ADMIN DATA
// =========================
async function fetchAdminData(){
    try{
        const res = await fetch(GS_URL);
        const data = await res.json();
        return data; // {deposits:[], withdrawals:[]}
    } catch(e){
        alert("Error fetching admin data: "+e.message);
        return {deposits:[], withdrawals:[]};
    }
}

// =========================
// GAME PLACEHOLDER NAVIGATION
// =========================
document.querySelectorAll(".card").forEach((c,i)=>{
    c.addEventListener("click",()=>{
        if(!user) return alert("Login to play");
        if(i===0) window.location.href="game1.html";
        if(i===1) window.location.href="game2.html";
        if(i===2) window.location.href="keno.html";
    });
});

// =========================
// LIVE BALANCE UPDATE (after admin approval, Google Script should send back updates)
// =========================
function updateBalance(newBalance){
    balance=newBalance;
    localStorage.setItem(`balance_${user.id}`,balance);
    updateUI();
}
