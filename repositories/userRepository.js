const pool = require('../config/db'); // Adjust path to your DB connection if needed

class UserRepository {
    constructor(dbPool = pool) {
        this.pool = dbPool;
    }

    async findByEmail(email) {
        if (!this.pool) return null;
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await this.pool.query(query, [email]);
        return rows[0];
    }

    async createUser(name, email, password, role) {
        if (!this.pool) {
            return { id: Date.now(), name, email, role };
        }
        const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role
    `;
        const values = [name, email, password, role || 'user'];
        const { rows } = await this.pool.query(query, values);
        return rows[0];
    }
}

// Export the class definition directly
module.exports = UserRepository;