const Dao = require('./dao.js')

class Setting extends Dao{
    constructor(){
        super('setting')
    }
}

module.exports = new Setting()
