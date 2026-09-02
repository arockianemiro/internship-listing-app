const pool = require('../config/db');

class InternshipRepository {
    // Fetch listings with search, domain filter, and pagination
    async findAll({ search, domain, limit, offset }) {
        let queryText = 'SELECT * FROM internships WHERE 1=1';
        let queryParams = [];
        let paramCount = 1;

        if (search) {
            queryText += ` AND (LOWER(title) LIKE $${paramCount} OR LOWER(company) LIKE $${paramCount})`;
            queryParams.push(`%${search.toLowerCase()}%`);
            paramCount++;
        }

        if (domain && domain !== 'All Domains') {
            queryText += ` AND LOWER(domain) = $${paramCount}`;
            queryParams.push(domain.toLowerCase());
            paramCount++;
        }

        queryText += ` ORDER BY id ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        queryParams.push(limit, offset);

        const { rows } = await pool.query(queryText, queryParams);
        const countResult = await pool.query('SELECT COUNT(*) FROM internships');

        return {
            data: rows,
            totalItems: parseInt(countResult.rows[0].count)
        };
    }

    // Find a single listing by ID
    async findById(id) {
        const { rows } = await pool.query('SELECT * FROM internships WHERE id = $1', [id]);
        return rows[0];
    }

    // Insert a new internship
    async create({ title, company, location, domain, created_by }) {
        const query = `
      INSERT INTO internships (title, company, location, domain, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
        const { rows } = await pool.query(query, [title, company, location, domain, created_by]);
        return rows[0];
    }

    // Update an existing internship
    async update(id, { title, company, location, domain }) {
        const query = `
      UPDATE internships
      SET title = $1, company = $2, location = $3, domain = $4
      WHERE id = $5
      RETURNING *;
    `;
        const { rows } = await pool.query(query, [title, company, location, domain, id]);
        return rows[0];
    }

    // Delete an internship
    async delete(id) {
        const { rows } = await pool.query('DELETE FROM internships WHERE id = $1 RETURNING *', [id]);
        return rows[0];
    }
}

module.exports = new InternshipRepository();