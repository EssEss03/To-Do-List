document.addEventListener("DOMContentLoaded", () => {
    // Select form and input elements for interacting with tasks
    const form = document.getElementById("todo-form");
    const taskInput = document.getElementById("task-input"); // Input field for task name
    const taskDate = document.getElementById("task-date"); // Input field for task due date
    const taskCategory = document.getElementById("task-category"); // Dropdown for selecting task category
    const todoList = document.getElementById("todo-list"); // Unordered list where active tasks will be displayed
    const completedList = document.getElementById("completed-list"); // Unordered list where completed tasks will be displayed

    // Set today's date as the minimum selectable date
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    taskDate.setAttribute("min", today); // Prevent selecting past dates

    // Load saved tasks from local storage
    loadTasks();

    // Handle form submission (when user adds a new task)
    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent default form submission behavior (no page reload)
        const taskText = taskInput.value.trim(); // Get the task name, remove extra spaces
        const dueDate = taskDate.value; // Get selected due date
        const category = taskCategory.value; // Get selected task category

        if (taskText) { // Only add task if task name is not empty
            addTask(taskText, dueDate, category, false); // Add task to the list
            saveTasks(); // Save task to local storage
            taskInput.value = ""; // Clear task input field after adding
            taskDate.value = ""; // Clear date input field after adding
        }
    });

    // Function to add a new task to the list
    function addTask(text, dueDate, category, completed = false) {
        const li = document.createElement("li"); // Create a new <li> element to hold task details

        // Create a span for task description and set its text
        const span = document.createElement("span");
        span.textContent = text;

        // Create a span for due date and display it if provided
        const dateSpan = document.createElement("span");
        dateSpan.textContent = dueDate ? ` (Due: ${dueDate})` : "";
        dateSpan.classList.add("due-date"); // Add class to style due date

        // Create a span to display task category and style it
        const categorySpan = document.createElement("span");
        categorySpan.textContent = ` [${category}]`;
        categorySpan.classList.add("category");

        // Check if task is overdue and apply the "overdue" class if it is
        if (dueDate && new Date(dueDate) < new Date(today)) {
            dateSpan.classList.add("overdue");
        }

        // Create an edit button and handle task editing
        const editButton = document.createElement("button");
        editButton.textContent = "✎";
        editButton.addEventListener("click", () => {
            editTask(li, span, dateSpan, categorySpan); // Edit the task when clicked
        });

        // Create a complete button to mark the task as completed
        const completeButton = document.createElement("button");
        completeButton.textContent = "✔";
        completeButton.addEventListener("click", () => {
            li.classList.toggle("completed"); // Toggle the "completed" class to cross out the task
            if (li.classList.contains("completed")) {
                completedList.appendChild(li); // Move to completed list
            } else {
                todoList.appendChild(li); // Move back to active list
            }
            saveTasks(); // Save the updated task status
        });

        // Create a delete button to remove the task
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "✖"; // Cross symbol
        deleteButton.addEventListener("click", () => {
            li.classList.add("removing"); // Add slide-out animation class
    setTimeout(() => {
                li.remove(); // Remove after animation completes
                saveTasks(); // Save updated list to local storage
            }, 300); // Match animation duration (0.3s)
        });

        // Append task details and buttons to the <li> element
        li.appendChild(span);
        li.appendChild(dateSpan);
        li.appendChild(categorySpan);
        li.appendChild(editButton);
        li.appendChild(completeButton);
        li.appendChild(deleteButton);

        // Add the task to the correct list (completed or to-do)
        if (completed) {
            li.classList.add("completed");
            completedList.appendChild(li); // Add to completed list if marked as completed
        } else {
            todoList.appendChild(li); // Otherwise, add to active list
        }
    }

    // Function to edit an existing task
    function editTask(li, span, dateSpan, categorySpan) {
        // Create input fields for editing the task name, date, and category
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = span.textContent;

        const editDate = document.createElement("input");
        editDate.type = "date";
        editDate.value = dateSpan.textContent.replace(" (Due: ", "").replace(")", "");

        const editCategory = document.createElement("select");
        ["Work", "Personal", "Urgent", "Other"].forEach(cat => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            if (categorySpan.textContent.includes(cat)) {
                option.selected = true;
            }
            editCategory.appendChild(option);
        });

        // Create a save button to save the edited task
        const saveButton = document.createElement("button");
        saveButton.textContent = "💾";
        saveButton.addEventListener("click", () => {
            // Update task details with edited values
            span.textContent = editInput.value;
            dateSpan.textContent = editDate.value ? ` (Due: ${editDate.value})` : "";
            categorySpan.textContent = ` [${editCategory.value}]`;

            // Replace input fields with updated task elements
            li.replaceChild(span, editInput);
            li.replaceChild(dateSpan, editDate);
            li.replaceChild(categorySpan, editCategory);
            li.replaceChild(editButton, saveButton);

            saveTasks(); // Save updates to localStorage
        });

        // Replace current task details with input fields
        li.replaceChild(editInput, span);
        li.replaceChild(editDate, dateSpan);
        li.replaceChild(editCategory, categorySpan);
        li.replaceChild(saveButton, li.querySelector("button")); // Replace edit button with save button
    }

    // Function to save tasks to local storage
    function saveTasks() {
        const tasks = []; // Create an array to hold task details
        // Save active tasks
        todoList.querySelectorAll("li").forEach(li => {
            tasks.push({
                text: li.querySelector("span").textContent,
                dueDate: li.querySelector(".due-date") ? li.querySelector(".due-date").textContent.replace(" (Due: ", "").replace(")", "") : "",
                category: li.querySelector(".category") ? li.querySelector(".category").textContent.replace(" [", "").replace("]", "") : "",
                completed: false
            });
        });

        // Save completed tasks
        completedList.querySelectorAll("li").forEach(li => {
            tasks.push({
                text: li.querySelector("span").textContent,
                dueDate: li.querySelector(".due-date") ? li.querySelector(".due-date").textContent.replace(" (Due: ", "").replace(")", "") : "",
                category: li.querySelector(".category") ? li.querySelector(".category").textContent.replace(" [", "").replace("]", "") : "",
                completed: true
            });
        });

        // Save tasks as a JSON string in local storage
        localStorage.setItem("todos", JSON.stringify(tasks));
    }

    // Function to load tasks from local storage
    function loadTasks() {
        const savedTasks = JSON.parse(localStorage.getItem("todos")) || []; // Retrieve tasks or set empty array
        savedTasks.forEach(task => addTask(task.text, task.dueDate, task.category, task.completed)); // Add each saved task
    }
});
