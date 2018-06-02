const {sign} = require('../../utils/jwt');
const User = require('../../models/user');
const hashPassword = require('../../utils/hashPassword');

module.exports = async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).send({error: 'Invalid query parameters provided'});
        }
        const user = await User.query().findOne({email: req.body.email});
        const hashedPassword = hashPassword(req.body.password);
        if (user && user.password === hashedPassword) {
            res.setHeader(
                'Authorization',
                `Bearer ${await sign({
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    superAdmin: user.superAdmin,
                })}`,
            );
            res.send(user);
        } else {
            res.status(401).send({
                error: 'These credentials are not valid.',
            });
        }
    } catch (e) {
        console.error('❌  POST /auth: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
