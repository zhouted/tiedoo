const Dao = require('./dao.js')

class Product extends Dao{
    constructor(){
        super('product')
    }
}

module.exports = new Product()
