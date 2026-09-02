const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const internshipRoutes = require('./routes/internshipRoutes');

// Mount Routes
app.use('/api/internships', internshipRoutes);

// Root Check
app.get('/', (req, res) => {
    res.send('Internship API Server is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});