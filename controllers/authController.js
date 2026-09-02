class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    // Bind methods using arrow functions to preserve 'this'
    register = async (req, res) => {
        try {
            const { name, email, password, role } = req.body;

            if (!this.authService || typeof this.authService.register !== 'function') {
                return res.status(500).json({
                    success: false,
                    message: 'AuthService is not properly initialized'
                });
            }

            const result = await this.authService.register({ name, email, password, role });
            return res.status(201).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!this.authService || typeof this.authService.login !== 'function') {
                return res.status(500).json({
                    success: false,
                    message: 'AuthService is not properly initialized'
                });
            }

            const result = await this.authService.login({ email, password });
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    };
}

module.exports = AuthController;