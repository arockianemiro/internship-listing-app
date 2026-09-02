const internshipService = require('../services/internshipService');

class InternshipController {
    async getAll(req, res) {
        try {
            const result = await internshipService.getAllInternships(req.query);
            return res.status(200).json({ success: true, ...result });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async getById(req, res) {
        try {
            const internship = await internshipService.getInternshipById(req.params.id);
            return res.status(200).json({ success: true, data: internship });
        } catch (err) {
            return res.status(440).json({ success: false, message: err.message });
        }
    }

    async create(req, res) {
        try {
            const newInternship = await internshipService.createInternship(req.body, req.user.id);
            return res.status(201).json({
                success: true,
                message: 'Internship created successfully!',
                data: newInternship
            });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async update(req, res) {
        try {
            const updated = await internshipService.updateInternship(req.params.id, req.body);
            return res.status(200).json({
                success: true,
                message: 'Internship updated successfully!',
                data: updated
            });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async delete(req, res) {
        try {
            await internshipService.deleteInternship(req.params.id);
            return res.status(200).json({
                success: true,
                message: 'Internship deleted successfully!'
            });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
}

module.exports = new InternshipController();