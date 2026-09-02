const internshipRepository = require('../repositories/internshipRepository');

class InternshipService {
    async getAllInternships(queryParams) {
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 6;
        const offset = (page - 1) * limit;

        const { data, totalItems } = await internshipRepository.findAll({
            search: queryParams.search,
            domain: queryParams.domain,
            limit,
            offset
        });

        return {
            data,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit)
            }
        };
    }

    async getInternshipById(id) {
        const internship = await internshipRepository.findById(id);
        if (!internship) {
            throw new Error('Internship listing not found.');
        }
        return internship;
    }

    async createInternship(data, userId) {
        const { title, company, location, domain } = data;
        if (!title || !company || !location || !domain) {
            throw new Error('All fields (title, company, location, domain) are required.');
        }

        return await internshipRepository.create({
            title,
            company,
            location,
            domain,
            created_by: userId
        });
    }

    async updateInternship(id, data) {
        const existing = await internshipRepository.findById(id);
        if (!existing) {
            throw new Error('Internship listing not found.');
        }

        const { title, company, location, domain } = data;
        if (!title || !company || !location || !domain) {
            throw new Error('All fields (title, company, location, domain) are required.');
        }

        return await internshipRepository.update(id, { title, company, location, domain });
    }

    async deleteInternship(id) {
        const existing = await internshipRepository.findById(id);
        if (!existing) {
            throw new Error('Internship listing not found.');
        }

        return await internshipRepository.delete(id);
    }
}

module.exports = new InternshipService();