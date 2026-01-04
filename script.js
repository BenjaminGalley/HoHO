const API_URL = "https://script.google.com/macros/s/AKfycbxf_AZ6uJO5BuW9y0M9EuUjF1ZKphqcLG6SeE5DtOORxusuMosjbEvqUiv7tsd4JVfAdA/exec";
let user = null;

// =======================
// LOGIN FUNCTION
// =======================
function login() {
  const phone = document.getElementById("loginPhone").value;
  const password = document.getElementById("loginPassword").value;
  fetch(API_URL, {
    method:"POST",
    body:JSON.stringify({action:"login",phone,password})
  }).then(r=>r.json()).then(res=>{
    if(res.status==="success"){
      user = {playerId:res.playerId,name:res.name,balance:res.balance};
      document.getElementById("loginBtn").style.display="none";
      document.getElementById("registerBtn").style.display="none";
      document.getElementById("logoutBtn").style.display="inline-block";
      updateBalance();
      document.getElementById("sideMenu").style.display="flex";
      hideModal('loginModal');
    } else {alert(res.message);}
  });
}

// =======================
// REGISTER FUNCTION
// =======================
function register() {
  const name = document.getElementById("regName").value;
  const phone = document.getElementById("regPhone").value;
  const password = document.getElementById("regPassword").value;
  fetch(API_URL, {
    method:"POST",
    body:JSON.stringify({action:"register",name,phone,password})
  }).then(r=>r.json()).then(res=>{
    if(res.status==="success"){alert("Registered! Your ID: "+res.playerId); hideModal('registerModal');}
    else alert(res.message);
  });
}

// =======================
// LOGOUT
// =======================
function logout(){
  user=null;
  document.getElementById("loginBtn").style.display="inline-block";
  document.getElementById("registerBtn").style.display="inline-block";
  document.getElementById("logoutBtn").style.display="none";
  document.getElementById("sideMenu").style.display="none";
  document.getElementById("balancePanel").innerText="";
}

// =======================
// UPDATE BALANCE
// =======================
function updateBalance(){
  if(!user) return;
  fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({action:"getBalance",playerId:user.playerId})
  }).then(r=>r.json()).then(res=>{
    if(res.status==="success"){
      user.balance=res.balance;
      document.getElementById("balancePanel").innerText="ID: "+user.playerId+" | Balance: "+user.balance+" Birr";
    }
  });
}

// =======================
// OPEN GAME
// =======================
function openGame(url){
  if(!user){alert("Please login first"); return;}
  window.open(url,"_blank");
}
