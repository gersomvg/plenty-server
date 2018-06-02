const {verify, sign} = require('./jwt');

const authMiddleware = (accessLevel = '') => {
    if (!['admin', 'superAdmin'].includes(accessLevel)) {
        console.error("Please specify a valid access level: 'admin' or 'superAdmin'");
    }
    return async (req, res, next) => {
        try {
            // Remove 'Bearer ' from auth header
            const jwt = (req.get('Authorization') || '').toString().slice(7);
            // Verify JWT token
            const {iat, exp, ...payload} = await verify(jwt);
            res.setHeader('Authorization', `Bearer ${await sign(payload)}`);
            next();
        } catch (e) {
            console.log('Error while authenticating user: ', e.message);
            res.status(401).send({
                error:
                    'Could not find or verify the JWT token. Please make sure you use the header Authorization: Bearer token',
            });
        }
    };
};

module.exports = authMiddleware;
