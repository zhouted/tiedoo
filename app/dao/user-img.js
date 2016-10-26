const DaoImg = require('./dao-img.js')

let defaultSize = {width:150, height:150}
class UserImg extends DaoImg{
    constructor(){
        super('user-img')
    }
    fsave(file, size = defaultSize){
        return super.fsave(file, size)
    }
    findById(id, size = defaultSize){
        return super.findById(id, size)
    }

}

module.exports = new UserImg()
