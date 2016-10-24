const Dao = require('./dao.js')

class UserImg extends Dao{
    constructor(){
        super('user-img')
    }
    // fsave(file){
    //     super.fsave(doc)
    // }
}

module.exports = new UserImg()
