const Dao = require('./dao.js')

class Category extends Dao{
    constructor(){
        super('category')
    }
}

module.exports = new Category()
