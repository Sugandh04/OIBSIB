let pending = JSON.parse(localStorage.getItem("pending")) || [];
let completed = JSON.parse(localStorage.getItem("completed")) || [];

function save() {
    localStorage.setItem("pending", JSON.stringify(pending));
    localStorage.setItem("completed", JSON.stringify(completed));
}

function addTask() {

    let input = document.getElementById("taskInput");
    let priority = document.getElementById("priority").value;

    let text = input.value.trim();
    if (!text) return;

    let task = {
        text,
        priority,
        time: new Date().toLocaleString()
    };

    pending.push(task);

    input.value = "";
    save();
    render();
}

function render() {

    let search = document.getElementById("search").value.toLowerCase();
    let filter = document.getElementById("filter").value;

    let pendingList = document.getElementById("pending");
    let completedList = document.getElementById("completed");

    pendingList.innerHTML = "";
    completedList.innerHTML = "";

    pending.forEach((task, i) => {

        if (task.text.toLowerCase().includes(search) &&
            (filter === "all" || filter === task.priority)) {

            pendingList.appendChild(createTask(task, i, false));

        }

    });

    completed.forEach((task, i) => {

        completedList.appendChild(createTask(task, i, true));

    });

    document.getElementById("pendingCount").textContent = pending.length;
    document.getElementById("completedCount").textContent = completed.length;

    updateProgress();
}

function createTask(task, index, isCompleted) {

    let li = document.createElement("li");
    li.classList.add("priority-" + task.priority);

    li.innerHTML = `
<strong>${task.text}</strong>
<div class="timestamp">${task.time}</div>
`;

    let actions = document.createElement("div");
    actions.className = "task-actions";

    if (!isCompleted) {

        let done = document.createElement("button");
        done.textContent = "✔";

        done.onclick = () => {
            completed.push(task);
            pending.splice(index, 1);
            save();
            render();
        };

        actions.appendChild(done);

    }

    let edit = document.createElement("button");
    edit.textContent = "Edit";

    edit.onclick = () => {
        let newText = prompt("Edit task", task.text);
        if (newText) {
            task.text = newText;
            save();
            render();
        }
    };

    let del = document.createElement("button");
    del.textContent = "Delete";

    del.onclick = () => {
        if (isCompleted) {
            completed.splice(index, 1);
        } else {
            pending.splice(index, 1);
        }
        save();
        render();
    };

    actions.appendChild(edit);
    actions.appendChild(del);

    li.appendChild(actions);

    return li;
}

function updateProgress() {

    let total = pending.length + completed.length;

    let percent = total === 0 ? 0 : (completed.length / total) * 100;

    document.getElementById("progressBar").style.width = percent + "%";
}

/* SEARCH & FILTER */

document.getElementById("search").addEventListener("input", render);
document.getElementById("filter").addEventListener("change", render);

/* ENTER KEY */

document.getElementById("taskInput").addEventListener("keypress", e => {
    if (e.key === "Enter") addTask();
});

/* THEME */

document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("light");
};

render();