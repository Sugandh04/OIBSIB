let display = document.getElementById("display");
let historyList = document.getElementById("historyList");

function appendValue(value){

let last = display.value.slice(-1);

if(["+","-","*","/"].includes(last) && ["+","-","*","/"].includes(value)){
return;
}

display.value += value;
}

function clearDisplay(){
display.value="";
}

function deleteLast(){
display.value = display.value.slice(0,-1);
}

function calculate(){

try{

let expression = display.value;
let result = eval(expression);

display.value = result;

let li = document.createElement("li");
li.textContent = expression + " = " + result;

historyList.prepend(li);

}

catch{
display.value="Error";
}

}

document.addEventListener("keydown",(event)=>{

let key = event.key;

if(!isNaN(key) || ["+","-","*","/","."].includes(key)){
display.value += key;
}

if(key==="Enter"){
calculate();
}

if(key==="Backspace"){
deleteLast();
}

if(key==="Escape"){
clearDisplay();
}

});

function toggleMode(){

let body = document.body;
let button = document.querySelector(".top-bar button");

body.classList.toggle("light");

if(body.classList.contains("light")){
button.textContent = "☀";
}else{
button.textContent = "🌙";
}

}