const DaoImg = require('./dao-img.js')

let defaultSize = {width:180, height:180}

class UserImg extends DaoImg{
    constructor(){
        super('company-img')
    }
    fsave(file, size = defaultSize){
        return super.fsave(file, size)
    }
    findById(id, size = null){
        return super.findById(id, size)
    }

}

module.exports = new UserImg()
