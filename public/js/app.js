/** Runs code for the index part */
/**
 * 
 * TODOS
 * [ X ] : Render tasks when is_finished is true. This doesn't update the toggle.
 * [ X ] : Render time left in days and hrs (Maybe could run in the server)
 * [ X ] : Render strikeout text when a task is finished
 * [ X ] : Style notif to make it stand out and increase user clarity

 * 
 */
console.log("App is running!!!! :))))")

const taskContainer = document.getElementById("task-container");
const addForm = document.getElementById("add-form");
const notifBar = document.getElementById("task-notification-bar");


// Shows an announcement on the bottom of the tasks bar and dissapears
// after a short time.
function showNotif(text){
    const time = 1500;
    notifBar.innerHTML = `${text}`;
    notifBar.className = `bg-blue-950 p-4`;
    
    setTimeout( () => {
        notifBar.innerHTML = ``;
        notifBar.className = ``;
    }, time )
}

/** 
 * 
 *  CLIENT SIDE TASK METHODS
 */

// Returns a string of a due date
function returnTimeLeft( timeLeft ){

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hoursInMs = timeLeft - ( days * (1000 * 60 * 60 * 24) );
    const hours = Math.floor(hoursInMs / (1000 * 60 * 60));

    let resStr = "Due in: ";

    if(days > 0){
        resStr += `${days} days`;
    }

    if(hours > 0){
        resStr += ` ${hours} hours`
    }

    return resStr;
}

function addTaskEl(task){
        const taskEl = document.createElement('div');
        taskEl.setAttribute("data-taskid", task._id);
        taskEl.id = "task-item";
        taskEl.className = "mb-4 p-8 rounded-md bg-sky-800 border-2 border-indigo-800";

        const created_at = new Date(task.created_at);
        const due_at_date = new Date(task.due_at);


        taskEl.innerHTML = `
            <div class="task--header mb-4"> 
                <h3 class="${ (task.is_finished)? "line-through" : "" } text-2xl">${task.name}</h3>
                <p class="text-gray-300">${task.description}</p>
            </div>

            <div class="mb-8">
                <p> ${returnTimeLeft(task.time_left)}
                <p> Created at: ${created_at.toDateString()} </p>
                <p> Due at: ${due_at_date.toDateString()} </p>
            </div>
        `;

        const taskOptions = document.createElement('div');
        taskOptions.className = "flex items-end"

        taskEl.appendChild(taskOptions);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = "cursor-pointer px-4 py-2 bg-red-400 mr-8"
        deleteBtn.textContent = "Delete Item";

        deleteBtn.addEventListener("click", (e) => {
            // deleteItem(id)
            deleteTask(task._id);
        })

        taskOptions.appendChild(deleteBtn);

        const toggleBtn = document.createElement('input');
        toggleBtn.type = 'checkbox';
        toggleBtn.checked = ( task.is_finished );
        toggleBtn.className = "w-10 h-10 bg-sky-950 border border-indigo-800";

        toggleBtn.addEventListener("click", (e) => {
            toggleTask(task._id);
        })

        taskOptions.appendChild(toggleBtn);

        taskContainer.appendChild(taskEl);
}

function deleteTaskEl(taskId){
    const taskItems = document.querySelectorAll("#task-item");

    for (let i = 0; i<taskItems.length; i++){
        if(taskId === taskItems[i].dataset.taskid){
            taskItems[i].remove();
        }
    }
}

function toggleTaskEl(taskId){
    const taskItems = document.querySelectorAll("#task-item");

    for (let i = 0; i<taskItems.length; i++){
        if(taskId === taskItems[i].dataset.taskid){
            const taskTitle = taskItems[i].querySelector(".task--header > h3");

            taskTitle.classList.toggle('line-through')
        }
    }
}

/**
 *  SERVER REQUEST CLIENT METHODS
 */

async function getTasks(){
    const response = await fetch("/get-tasks", {
      method: "GET"
    })

    if(!response.ok){
      throw new Error(`Response status: ${response.status}`);
    }

    const taskItems = await response.text();
    const taskItemsJson = JSON.parse(taskItems);

    const tasks = taskItemsJson.content;

    tasks.forEach(task => {
        addTaskEl(task);
    });

    showNotif("Tasks have loaded successfully :)")
}


async function addTask(){
    const name = document.querySelector(".input-name");
    const description = document.querySelector(".input-description");

    const dueAt = document.querySelector(".input-date"); 
    const dueAtDate = new Date(dueAt.value); 
    
    if(name.value === "" || dueAt.value === ""){
        let res = "";

        if(name.value === ""){
            res += "<p>Name is not defined, ensure you entered a name</p>"
        }

        if(dueAt.value === ""){
            res += "<p>No due date has been set, please set a due date</p>"
        }
        showNotif(res);
        return;
    }

    const body  = {
        name: name.value,
        description: description.value,
        due_at: dueAtDate,
    }

    console.log(body);
    const bodyJson = JSON.stringify(body);

    const response = await fetch("/get-tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: bodyJson
    });


    const data = await response.text();
    const taskData = JSON.parse(data);

    name.value = "";
    description.value = "";
    dueAt.value = "";

    addTaskEl(taskData.content);
    showNotif("Task added successfully");
}

async function deleteTask(taskId){
    console.log("Task will be deleted")

    const body = {id: taskId};
    const bodyJson = JSON.stringify(body);

    console.log(bodyJson);
    const response = await fetch("/delete", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: bodyJson
    });

    if(response.ok){
        const data = await response.text();

        deleteTaskEl(taskId);
        showNotif("Task deleted successfully");
    }
}

async function toggleTask(taskId){
    
    const body = { id: taskId };
    const bodyJson = JSON.stringify(body);

    const response = await fetch("/toggle", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: bodyJson
    });

    if(response.ok){
        toggleTaskEl(taskId);
    }
}


getTasks();

addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addTask();
})