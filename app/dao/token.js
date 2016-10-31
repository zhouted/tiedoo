const Dao = require('./dao.js')

class Token extends Dao{
    constructor(){
        super('token')
    }
    save(token){
        token._id = 'onlyone'
        return super.save(token)
    }
}

module.exports = new Token()
