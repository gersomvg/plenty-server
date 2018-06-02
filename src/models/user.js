const {Model} = require('objection');

class UserModel extends Model {
    static get tableName() {
        return 'user';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['email', 'password', 'firstName', 'lastName', 'superAdmin'],
            properties: {
                email: {type: 'string', format: 'email', maxLength: 255},
                password: {type: 'string', pattern: '\\S+'},
                firstName: {type: 'string', pattern: '\\S+', maxLength: 255},
                lastName: {type: 'string', pattern: '\\S+', maxLength: 255},
                superAdmin: {type: 'boolean'},
            },
        };
    }

    $formatJson(obj) {
        obj = super.$formatJson(obj);
        delete obj.password;
        return obj;
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = UserModel;
