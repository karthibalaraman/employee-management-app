const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

const dbConfig = {
    host: process.env.DB_HOST || "database",
    user: process.env.DB_USER || "employeeuser",
    password: process.env.DB_PASSWORD || "employeepassword",
    database: process.env.DB_NAME || "employee_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

async function connectDatabase() {
    while (true) {
        try {
            pool = mysql.createPool(dbConfig);

            await pool.query("SELECT 1");

            console.log("Connected to MySQL");
            break;
        } catch (error) {
            console.log("Waiting for MySQL...");
            console.log(error.message);

            if (pool) {
                try {
                    await pool.end();
                } catch (e) {}
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            status: "UP",
            database: "CONNECTED"
        });
    } catch (error) {
        res.status(500).json({
            status: "DOWN",
            database: "DISCONNECTED"
        });
    }
});

app.get("/api/employees", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM employees ORDER BY id DESC"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch employees"
        });
    }
});

app.post("/api/employees", async (req, res) => {
    try {
        const { name, email, department } = req.body;

        if (!name || !email || !department) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        const [result] = await pool.query(
            "INSERT INTO employees (name, email, department) VALUES (?, ?, ?)",
            [name, email, department]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            email,
            department
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create employee"
        });
    }
});

app.delete("/api/employees/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const [result] = await pool.query(
            "DELETE FROM employees WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Employee not found"
            });
        }

        res.json({
            message: "Employee deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete employee"
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
});

connectDatabase();
