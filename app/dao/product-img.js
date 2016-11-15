const DaoImg = require('./dao-img.js')

let defaultSize = {width:480, height:480}

class ProductImg extends DaoImg{
    constructor(){
        super('product-img')
    }
    fsave(file, size = defaultSize){
        return super.fsave(file, size)
    }
    findById(id, size = null){
        return super.findById(id, size)
    }
}

module.exports = new ProductImg()
