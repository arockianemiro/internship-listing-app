const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// 1. PUBLIC: GET ALL INTERNSHIPS
router.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search ? `%${req.query.search}%` : '%';

    try {
        const query = `
            SELECT * FROM internships
            WHERE title ILIKE $1 OR company ILIKE $1 OR domain ILIKE $1
            ORDER BY id DESC
                LIMIT $2 OFFSET $3;
        `;
        const { rows } = await pool.query(query, [search, limit, offset]);
        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// 2. PUBLIC: GET SINGLE INTERNSHIP
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM internships WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Internship not found.' });
        }
        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// 3. PROTECTED: CREATE INTERNSHIP (Requires verifyToken)
router.post('/', verifyToken, async (req, res) => {
    const { title, company, location, domain } = req.body;
    const userId = req.user.id; // Extracted directly from JWT payload by verifyToken

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Validation Error: Title is required.' });
    }
    if (!company || typeof company !== 'string' || company.trim() === '') {
        return res.status(400).json({ success: false, message: 'Validation Error: Company is required.' });
    }

    try {
        const query = `
            INSERT INTO internships (title, company, location, domain, created_by)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const { rows } = await pool.query(query, [
            title.trim(),
            company.trim(),
            location || 'Remote',
            domain || 'General',
            userId
        ]);
        return res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// 4. PROTECTED: UPDATE INTERNSHIP (Requires verifyToken)
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { title, company, location, domain } = req.body;

    if (!title || !company) {
        return res.status(400).json({ success: false, message: 'Validation Error: Title and Company cannot be empty.' });
    }

    try {
        const query = `
            UPDATE internships
            SET title = $1, company = $2, location = $3, domain = $4
            WHERE id = $5 RETURNING *;
        `;
        const { rows } = await pool.query(query, [title, company, location, domain, id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Internship not found.' });
        }
        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// 5. PROTECTED: DELETE INTERNSHIP (Requires verifyToken)
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM internships WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Internship not found.' });
        }
        return res.status(200).json({ success: true, message: 'Internship deleted successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;