const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Import Routes
const internshipRoutes = require('./routes/internshipRoutes');
const authRoutes = require('./routes/authRoutes');

// Mount Routes
app.use('/api/internships', internshipRoutes);
app.use('/api/auth', authRoutes);

// Health Check Endpoint
app.get('/', (req, res) => {
    res.send('Internship API Server is running successfully!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});