const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    // Bind methods using arrow functions to preserve 'this'
    register = async ({ name, email, password, role }) => {
        // Check if user already exists
        if (this.userRepository && typeof this.userRepository.findByEmail === 'function') {
            const existingUser = await this.userRepository.findByEmail(email);
            if (existingUser) {
                throw new Error('User already exists with this email');
            }
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Save user to DB
        let newUser;
        if (this.userRepository && typeof this.userRepository.createUser === 'function') {
            newUser = await this.userRepository.createUser(
                name,
                email,
                hashedPassword,
                role
            );
        } else {
            newUser = { id: Date.now(), name, email, role };
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        return { user: newUser, token };
    };

    login = async ({ email, password }) => {
        if (!this.userRepository || typeof this.userRepository.findByEmail !== 'function') {
            throw new Error('User repository not configured properly');
        }

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        };
    };
}

module.exports = AuthService;