const Dao = require('./dao.js')

class Current extends Dao{
    constructor(){
        super('current')
    }
    save(current){
        current._id = 'onlyone'
        return super.save(current)
    }
}

module.exports = new Current()
