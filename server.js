const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Create database
const dbPath = path.join(__dirname, "database", "students.db");
const db = new Database(dbPath);

// Create students table
db.prepare(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        course TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

// GET all students
app.get("/api/students", (req, res) => {
    try {
        const students = db.prepare(`
            SELECT * FROM students
            ORDER BY id DESC
        `).all();

        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch students"
        });
    }
});

// ADD student
app.post("/api/students", (req, res) => {
    try {
        const { name, email, course } = req.body;

        if (!name || !email || !course) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const insert = db.prepare(`
            INSERT INTO students (name, email, course)
            VALUES (?, ?, ?)
        `);

        const result = insert.run(
            name.trim(),
            email.trim(),
            course.trim()
        );

        const student = db.prepare(`
            SELECT * FROM students WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: "Student added successfully",
            data: student
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to add student"
        });
    }
});

// DELETE student
app.delete("/api/students/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID"
            });
        }

        const result = db.prepare(`
            DELETE FROM students WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete student"
        });
    }
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Cloud Student App is running",
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});