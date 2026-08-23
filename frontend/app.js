const form = document.getElementById("employeeForm");
const table = document.getElementById("employeeTable");

async function loadEmployees() {

    try {

        const response = await fetch("/api/employees");

        if (!response.ok) {
            throw new Error("Failed to fetch employees");
        }

        const employees = await response.json();

        table.innerHTML = "";

        employees.forEach(employee => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>${employee.department}</td>
                <td>
                    <button onclick="deleteEmployee(${employee.id})">
                        Delete
                    </button>
                </td>
            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load employees
                </td>
            </tr>
        `;
    }
}

form.addEventListener("submit", async event => {

    event.preventDefault();

    const employee = {

        name: document.getElementById("name").value,

        email: document.getElementById("email").value,

        department: document.getElementById("department").value
    };

    try {

        const response = await fetch("/api/employees", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(employee)

        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to add employee");
            return;
        }

        form.reset();

        await loadEmployees();

    } catch (error) {

        console.error(error);

        alert("Unable to connect to backend");

    }
});

async function deleteEmployee(id) {

    if (!confirm("Delete this employee?")) {
        return;
    }

    try {

        const response = await fetch(`/api/employees/${id}`, {

            method: "DELETE"

        });

        const result = await response.json();

        if (!response.ok) {

            alert(result.error || "Delete failed");

            return;
        }

        await loadEmployees();

    } catch (error) {

        console.error(error);

        alert("Unable to delete employee");
    }
}

loadEmployees();
