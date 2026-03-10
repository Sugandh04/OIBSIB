const sections = document.querySelectorAll(".fade");

window.addEventListener("scroll", () => {

sections.forEach(section => {

const position = section.getBoundingClientRect().top;
const screenPosition = window.innerHeight / 1.2;

if(position < screenPosition){
section.classList.add("show");
}

});

});