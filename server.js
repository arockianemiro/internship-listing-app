require('dotenv').config(); // Loads variables from .env file

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());

// Configure CORS for both local development and production deployments
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5500', // Common for VS Code Live Server
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or Postman)
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app') || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(null, true); // Set to callback(new Error('Not allowed by CORS')) to restrict strictly
        }
    },
    credentials: true
}));

// Configure PostgreSQL connection using .env variables
const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('render.com');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'internship_db',
    password: process.env.DB_PASSWORD || 'I N3v3r Stopp3d',
    port: process.env.DB_PORT || 5432,
    // Render's hosted PostgreSQL requires SSL enabled
    ssl: isProduction ? { rejectUnauthorized: false } : false
});

// --- HEALTH CHECK ROUTE ---
app.get('/', (req, res) => {
    res.json({ message: 'Internship Portal API is running live!' });
});

// --- AUTHENTICATION ROUTES ---

// Registration Endpoint
const handleRegister = async (req, res) => {
    const name = req.body.name || req.body.fullName || req.body.username;
    const { email, password, role, adminKey } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    const userRole = role || 'Student';

    // Verify Admin Key if Admin role is selected
    if (userRole === 'Admin') {
        const SECRET_ADMIN_KEY = process.env.ADMIN_SECRET || 'MySuperSecretAdminKey123';
        if (adminKey !== SECRET_ADMIN_KEY) {
            return res.status(403).json({ message: 'Invalid Admin Secret Key!' });
        }
    }

    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, userRole]
        );

        res.status(201).json({ message: 'User registered successfully!', user: newUser.rows[0] });
    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

app.post('/api/auth/register', handleRegister);
app.post('/api/register', handleRegister);

// Login Endpoint
const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

app.post('/api/auth/login', handleLogin);
app.post('/api/login', handleLogin);

// --- INTERNSHIP ROUTES ---

app.get('/api/internships', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM internships ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch Internships Error:', err.message);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// --- APPLICATION ROUTES ---

app.post('/api/applications', async (req, res) => {
    const { internshipId, name, email, resume } = req.body;

    if (!internshipId || !name || !email || !resume) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO applications (internship_id, student_name, student_email, resume_link) VALUES ($1, $2, $3, $4)',
            [internshipId, name, email, resume]
        );
        res.status(201).json({ message: 'Application submitted successfully!' });
    } catch (err) {
        console.error('Application Submission Error:', err.message);
        res.status(500).json({ error: 'Failed to submit application: ' + err.message });
    }
});

app.get('/api/applications', async (req, res) => {
    try {
        const query = `
            SELECT
                a.id AS application_id,
                a.student_name,
                a.student_email,
                a.resume_link,
                a.applied_at,
                i.title AS internship_title,
                i.company
            FROM applications a
                     JOIN internships i ON a.internship_id = i.id
            ORDER BY a.applied_at DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch Applications Error:', err.message);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});