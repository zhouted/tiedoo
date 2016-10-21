const Dao = require('./dao.js')

class User extends Dao{
    constructor(){
        super('user')
    }
}

module.exports = new User()
