const Dao = require('./dao.js')

class ProductDiscard extends Dao{
    constructor(){
        super('product-discard')
    }
}

module.exports = new ProductDiscard()
