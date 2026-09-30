const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const studentCount = document.getElementById("studentCount");
const loading = document.getElementById("loading");
const message = document.getElementById("message");


// Load students
async function loadStudents() {

    loading.style.display = "block";

    try {

        const response = await fetch("/api/students");

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        renderStudents(result.data);

    } catch (error) {

        studentList.innerHTML = `
            <div class="empty">
                Unable to load student records.
                Please try again.
            </div>
        `;

        console.error(error);

    } finally {

        loading.style.display = "none";
    }
}


// Display students
function renderStudents(students) {

    studentCount.textContent = students.length;

    if (students.length === 0) {

        studentList.innerHTML = `
            <div class="empty">
                No student records found.
                Add your first student above.
            </div>
        `;

        return;
    }

    studentList.innerHTML = students.map(student => `

        <div class="student-card">

            <div class="student-info">

                <h3>${escapeHTML(student.name)}</h3>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(student.email)}
                </p>

                <p>
                    <strong>Course:</strong>
                    ${escapeHTML(student.course)}
                </p>

            </div>

            <button
                class="delete-btn"
                onclick="deleteStudent(${student.id})"
            >
                Delete
            </button>

        </div>

    `).join("");
}


// Add student
studentForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const course = document.getElementById("course").value;

    try {

        const response = await fetch("/api/students", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                course
            })

        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        showMessage(
            "Student added successfully!",
            "success"
        );

        studentForm.reset();

        loadStudents();

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );

        console.error(error);
    }

});


// Delete student
async function deleteStudent(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `/api/students/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        showMessage(
            "Student deleted successfully!",
            "success"
        );

        loadStudents();

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );

        console.error(error);
    }
}


// Show message
function showMessage(text, type) {

    message.textContent = text;

    message.className = type;

    setTimeout(() => {

        message.className = "";

        message.style.display = "none";

    }, 3000);
}


// Prevent HTML injection
function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// Load students when page opens
loadStudents();