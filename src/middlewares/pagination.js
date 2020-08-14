/**
 * Middleware used to return the mongoose options for skip, limit and sorting data.
 * Use as it from client: /api/data?sortBy=createdAt:desc&limit=10&skip=20
 * Into your router configuration, find those options in req.pagination
 * @param {Request} req 
 * @param {Response} res 
 * @param {internal callback} next 
 */
const pagination = async (req, res, next) => {
    const {query} = req;
    const sort = {};
    if (query.sortBy) {
        const [field, order] = query.sortBy.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
    }
    req.pagination = {
        limit: parseInt(query.limit) || 50,
        skip: parseInt(query.skip) || 0,
        sort,
    };
    next();
}

module.exports = pagination;