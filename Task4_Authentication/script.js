/* SHA-256 password hashing */

async function hashPassword(password){

const encoder=new TextEncoder();
const data=encoder.encode(password);

const hashBuffer=await crypto.subtle.digest("SHA-256",data);

const hashArray=Array.from(new Uint8Array(hashBuffer));

return hashArray.map(b=>b.toString(16).padStart(2,"0")).join("");

}


/* REGISTER */

const registerForm=document.getElementById("registerForm");

if(registerForm){

registerForm.addEventListener("submit",async e=>{

e.preventDefault();

const email=document.getElementById("regEmail").value;
const password=document.getElementById("regPassword").value;

let users=JSON.parse(localStorage.getItem("users")) || [];

if(users.find(u=>u.email===email)){

alert("User already exists");

return;

}

const hashed=await hashPassword(password);

users.push({email,password:hashed});

localStorage.setItem("users",JSON.stringify(users));

alert("Registration successful");

window.location.href="login.html";

});

}


/* LOGIN */

const loginForm=document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit",async e=>{

e.preventDefault();

const email=document.getElementById("loginEmail").value;
const password=document.getElementById("loginPassword").value;

let users=JSON.parse(localStorage.getItem("users")) || [];

const hashed=await hashPassword(password);

const user=users.find(u=>u.email===email && u.password===hashed);

if(user){

localStorage.setItem("session",email);

window.location.href="dashboard.html";

}else{

alert("Invalid email or password");

}

});

}


/* DASHBOARD PROTECTION */

if(window.location.pathname.includes("dashboard")){

const session=localStorage.getItem("session");

if(!session){

window.location.href="login.html";

}

}


/* LOGOUT */

function logout(){

localStorage.removeItem("session");

window.location.href="login.html";

}